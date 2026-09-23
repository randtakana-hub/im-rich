import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendRichCoin, InsufficientFundsError, DuplicateRequestError } from "@/lib/rc";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  receiverUsername: z.string().trim().toLowerCase().min(1),
  amount: z.number().int().positive().max(1_000_000),
  clientRequestId: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`send:${session.user.id}`, 20, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many transfers. Slow down and try again." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { receiverUsername, amount, clientRequestId } = parsed.data;

  const receiver = await prisma.user.findUnique({ where: { username: receiverUsername } });
  if (!receiver) return NextResponse.json({ error: "That user doesn't exist." }, { status: 404 });
  if (receiver.isSuspended) {
    return NextResponse.json({ error: "This account cannot receive RC right now." }, { status: 403 });
  }

  try {
    await sendRichCoin({
      senderId: session.user.id,
      receiverId: receiver.id,
      amount,
      clientRequestId,
    });
    return NextResponse.json({ success: true, amount, receiverUsername });
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      return NextResponse.json({ error: "You don't have enough RC for this transfer." }, { status: 400 });
    }
    if (err instanceof DuplicateRequestError) {
      // Already applied once — treat as success so a retried request is safe.
      return NextResponse.json({ success: true, amount, receiverUsername, duplicate: true });
    }
    console.error(err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
