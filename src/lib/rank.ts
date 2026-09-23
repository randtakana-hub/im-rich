import { prisma } from "@/lib/prisma";

export async function getLeaderboard(limit = 50) {
  const wallets = await prisma.wallet.findMany({
    orderBy: { balance: "desc" },
    take: limit,
    include: {
      user: { include: { profile: true } },
    },
  });

  return wallets.map((w, i) => ({
    rank: i + 1,
    userId: w.userId,
    username: w.user.username,
    fullName: w.user.fullName,
    avatarSeed: w.user.profile?.avatarSeed ?? w.user.username,
    balance: w.balance,
  }));
}

export async function getUserRank(userId: string) {
  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) return null;

  const higherCount = await prisma.wallet.count({
    where: { balance: { gt: wallet.balance } },
  });
  const totalUsers = await prisma.wallet.count();

  const rank = higherCount + 1;
  const percentile = totalUsers > 0 ? Math.max(1, Math.ceil((rank / totalUsers) * 100)) : 100;

  return { rank, totalUsers, topPercent: percentile, balance: wallet.balance };
}
