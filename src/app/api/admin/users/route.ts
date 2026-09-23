import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 403 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();

  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { username: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { fullName: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { wallet: true },
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      fullName: u.fullName,
      isAdmin: u.isAdmin,
      isSuspended: u.isSuspended,
      balance: u.wallet?.balance ?? 0,
      totalPurchased: u.wallet?.totalPurchased ?? 0,
      createdAt: u.createdAt,
    })),
  });
}
