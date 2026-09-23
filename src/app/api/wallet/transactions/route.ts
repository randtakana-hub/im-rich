import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const take = Math.min(50, Number(req.nextUrl.searchParams.get("take") ?? 20));
  const userId = session.user.id;

  const txs = await prisma.richCoinTransaction.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    take,
    include: {
      sender: { select: { username: true, fullName: true } },
      receiver: { select: { username: true, fullName: true } },
    },
  });

  const shaped = txs.map((t) => {
    // Direction is simply "did this transaction increase or decrease MY
    // balance": receiverId === me → in, senderId === me → out. PURCHASE
    // and positive ADMIN_ADJUST rows only ever have a receiverId, never a
    // senderId, so they fall out of this the same way naturally.
    const direction: "in" | "out" = t.receiverId === userId ? "in" : "out";

    const counterparty =
      direction === "out" ? t.receiver?.username ?? null : t.sender?.username ?? null;

    return {
      id: t.id,
      amount: t.amount,
      type: t.type,
      status: t.status,
      direction,
      counterparty,
      createdAt: t.createdAt,
    };
  });

  return NextResponse.json({ transactions: shaped });
}
