import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [friendships, incoming] = await Promise.all([
    prisma.friendship.findMany({
      where: { OR: [{ userAId: userId }, { userBId: userId }] },
      include: {
        userA: { include: { profile: true, wallet: true } },
        userB: { include: { profile: true, wallet: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: { sender: { include: { profile: true, wallet: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const friends = friendships.map((f) => {
    const other = f.userAId === userId ? f.userB : f.userA;
    return {
      username: other.username,
      fullName: other.fullName,
      avatarSeed: other.profile?.avatarSeed ?? other.username,
      balance: other.wallet?.balance ?? 0,
      friendsSince: f.createdAt,
    };
  });

  const requests = incoming.map((r) => ({
    requestId: r.id,
    username: r.sender.username,
    fullName: r.sender.fullName,
    avatarSeed: r.sender.profile?.avatarSeed ?? r.sender.username,
    createdAt: r.createdAt,
  }));

  return NextResponse.json({ friends, requests });
}
