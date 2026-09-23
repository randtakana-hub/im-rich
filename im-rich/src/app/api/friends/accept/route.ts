import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePair } from "@/lib/friends";

const schema = z.object({ requestId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const request = await prisma.friendRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request || request.receiverId !== session.user.id) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "This request was already handled." }, { status: 409 });
  }

  const { userAId, userBId } = normalizePair(request.senderId, request.receiverId);
  const senderUser = await prisma.user.findUnique({ where: { id: request.senderId } });

  await prisma.$transaction([
    prisma.friendRequest.update({ where: { id: request.id }, data: { status: "ACCEPTED" } }),
    prisma.friendship.create({ data: { userAId, userBId } }),
    prisma.notification.create({
      data: {
        userId: request.senderId,
        type: "FRIEND_ACCEPTED",
        message: `@${session.user.username} accepted your friend request.`,
      },
    }),
  ]);

  return NextResponse.json({ success: true, friend: senderUser?.username });
}
