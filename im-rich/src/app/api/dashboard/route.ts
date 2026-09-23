import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserRank } from "@/lib/rank";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const [wallet, friendCount, rank, recentTx] = await Promise.all([
    prisma.wallet.findUnique({ where: { userId } }),
    prisma.friendship.count({ where: { OR: [{ userAId: userId }, { userBId: userId }] } }),
    getUserRank(userId),
    prisma.richCoinTransaction.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    }),
  ]);

  // Balance-over-time chart: reconstruct a running balance from the last
  // 30 days of this user's ledger entries (server-computed, not stored
  // separately, so it can never drift from the real balance).
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const history = await prisma.richCoinTransaction.findMany({
    where: {
      OR: [{ senderId: userId }, { receiverId: userId }],
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "asc" },
  });

  let running = (wallet?.balance ?? 0) - history.reduce((sum, t) => {
    const delta = t.receiverId === userId ? t.amount : -t.amount;
    return sum + delta;
  }, 0);

  const series: { date: string; balance: number }[] = [{ date: since.toISOString().slice(0, 10), balance: running }];
  for (const t of history) {
    running += t.receiverId === userId ? t.amount : -t.amount;
    series.push({ date: t.createdAt.toISOString().slice(0, 10), balance: running });
  }
  series.push({ date: new Date().toISOString().slice(0, 10), balance: wallet?.balance ?? 0 });

  const monthAgoBalance = series[0].balance;
  const changeThisMonth = (wallet?.balance ?? 0) - monthAgoBalance;

  const recentActivity = recentTx.map((t) => {
    const direction = t.receiverId === userId ? "in" : "out";
    let label = "";
    if (t.type === "PURCHASE") label = "Purchased";
    else if (t.type === "ADMIN_ADJUST") label = "Balance adjustment";
    else if (direction === "in") label = `Received from @${t.sender?.username ?? "unknown"}`;
    else label = `Sent to @${t.receiver?.username ?? "unknown"}`;

    return {
      id: t.id,
      direction,
      amount: t.amount,
      label,
      createdAt: t.createdAt,
    };
  });

  return NextResponse.json({
    balance: wallet?.balance ?? 0,
    changeThisMonth,
    friendCount,
    rank: rank?.rank ?? null,
    topPercent: rank?.topPercent ?? null,
    chart: series,
    recentActivity,
  });
}
