import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { areFriends, pendingRequestBetween } from "@/lib/friends";
import { getUserRank } from "@/lib/rank";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { username: params.username.toLowerCase() },
    include: { profile: true, wallet: true },
  });
  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const friendCount = await prisma.friendship.count({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
  });

  const isSelf = user.id === session.user.id;
  const [friends, pending, rank] = await Promise.all([
    isSelf ? Promise.resolve(false) : areFriends(session.user.id, user.id),
    isSelf ? Promise.resolve(null) : pendingRequestBetween(session.user.id, user.id),
    getUserRank(user.id),
  ]);

  let requestState: "self" | "none" | "friends" | "pending_outgoing" | "pending_incoming" = "none";
  if (isSelf) requestState = "self";
  else if (friends) requestState = "friends";
  else if (pending) requestState = pending.senderId === session.user.id ? "pending_outgoing" : "pending_incoming";

  return NextResponse.json({
    username: user.username,
    fullName: user.fullName,
    bio: user.profile?.bio ?? "",
    avatarSeed: user.profile?.avatarSeed ?? user.username,
    balance: user.wallet?.balance ?? 0,
    joinDate: user.createdAt,
    friendCount,
    rank: rank?.rank ?? null,
    requestState,
    pendingRequestId: pending?.id ?? null,
  });
}
