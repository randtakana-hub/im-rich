import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { areFriends, pendingRequestBetween } from "@/lib/friends";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  const filter = req.nextUrl.searchParams.get("filter"); // richest | new | friends | active

  const where: any = {
    id: { not: session.user.id },
    isSuspended: false,
  };

  if (q.length > 0) {
    where.OR = [
      { username: { contains: q, mode: "insensitive" } },
      { fullName: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (filter === "richest") orderBy = { wallet: { balance: "desc" } };
  if (filter === "new") orderBy = { createdAt: "desc" };
  if (filter === "active") orderBy = { updatedAt: "desc" };

  const users = await prisma.user.findMany({
    where,
    orderBy,
    take: 30,
    include: { profile: true, wallet: true },
  });

  const results = await Promise.all(
    users.map(async (u) => {
      const [friends, pending] = await Promise.all([
        areFriends(session.user.id, u.id),
        pendingRequestBetween(session.user.id, u.id),
      ]);

      let requestState: "none" | "friends" | "pending_outgoing" | "pending_incoming" = "none";
      if (friends) requestState = "friends";
      else if (pending) {
        requestState = pending.senderId === session.user.id ? "pending_outgoing" : "pending_incoming";
      }

      return {
        username: u.username,
        fullName: u.fullName,
        avatarSeed: u.profile?.avatarSeed ?? u.username,
        balance: u.wallet?.balance ?? 0,
        requestState,
      };
    })
  );

  if (filter === "friends") {
    return NextResponse.json({ results: results.filter((r) => r.requestState === "friends") });
  }

  return NextResponse.json({ results });
}
