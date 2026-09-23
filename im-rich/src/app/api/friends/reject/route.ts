import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ requestId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const request = await prisma.friendRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request || (request.receiverId !== session.user.id && request.senderId !== session.user.id)) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "This request was already handled." }, { status: 409 });
  }

  const isSender = request.senderId === session.user.id;

  await prisma.friendRequest.update({
    where: { id: request.id },
    data: { status: isSender ? "CANCELED" : "REJECTED" },
  });

  return NextResponse.json({ success: true });
}
