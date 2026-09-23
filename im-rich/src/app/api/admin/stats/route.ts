import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 403 });

  const [circulation, userCount, purchaseAgg, transferAgg, payments, recentTx] = await Promise.all([
    prisma.wallet.aggregate({ _sum: { balance: true } }),
    prisma.user.count(),
    prisma.richCoinTransaction.aggregate({
      where: { type: "PURCHASE" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.richCoinTransaction.aggregate({
      where: { type: "SEND" },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: { status: "SUCCEEDED" },
      _sum: { amountPaidCents: true },
      _count: true,
    }),
    prisma.richCoinTransaction.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        sender: { select: { username: true } },
        receiver: { select: { username: true } },
      },
    }),
  ]);

  return NextResponse.json({
    totalUsers: userCount,
    totalRcInCirculation: circulation._sum.balance ?? 0,
    totalRcPurchased: purchaseAgg._sum.amount ?? 0,
    totalPurchaseCount: purchaseAgg._count,
    totalRcTransferred: transferAgg._sum.amount ?? 0,
    totalTransferCount: transferAgg._count,
    totalRevenueCents: payments._sum.amountPaidCents ?? 0,
    totalPaymentCount: payments._count,
    recentTransactions: recentTx.map((t) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      status: t.status,
      sender: t.sender?.username ?? null,
      receiver: t.receiver?.username ?? null,
      createdAt: t.createdAt,
    })),
  });
}
