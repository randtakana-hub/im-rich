import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wallet = await prisma.wallet.findUnique({ where: { userId: session.user.id } });
  if (!wallet) return NextResponse.json({ error: "Wallet not found" }, { status: 404 });

  return NextResponse.json({
    balance: wallet.balance,
    totalPurchased: wallet.totalPurchased,
    totalSent: wallet.totalSent,
    totalReceived: wallet.totalReceived,
  });
}
