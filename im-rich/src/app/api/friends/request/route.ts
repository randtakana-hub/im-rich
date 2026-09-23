import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { areFriends, pendingRequestBetween } from "@/lib/friends";

const schema = z.object({ username: z.string().trim().toLowerCase() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.id === session.user.id) {
    return NextResponse.json({ error: "You can't add yourself." }, { status: 400 });
  }

  if (await areFriends(session.user.id, target.id)) {
    return NextResponse.json({ error: "You're already friends." }, { status: 409 });
  }
  if (await pendingRequestBetween(session.user.id, target.id)) {
    return NextResponse.json({ error: "A request already exists between you two." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.friendRequest.create({
      data: { senderId: session.user.id, receiverId: target.id, status: "PENDING" },
    }),
    prisma.notification.create({
      data: {
        userId: target.id,
        type: "FRIEND_REQUEST",
        message: `@${session.user.username} sent you a friend request.`,
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
