import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`forgot:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });

  // Always respond the same way whether or not the email exists, so this
  // endpoint can't be used to enumerate registered accounts.
  const genericResponse = {
    message: "If an account exists for that email, a reset link has been sent.",
  };

  if (!user) return NextResponse.json(genericResponse);

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordResetToken.create({ data: { userId: user.id, token, expiresAt } });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? ""}/reset-password?token=${token}`;

  // No transactional email provider is configured in this build. In a real
  // deployment, send `resetUrl` via your email provider (Postmark, SES,
  // Resend, etc.) instead of returning it — for local development we hand
  // it back directly so the flow is fully testable end-to-end.
  const devMode = process.env.NODE_ENV !== "production";

  return NextResponse.json(devMode ? { ...genericResponse, devResetUrl: resetUrl } : genericResponse);
}
