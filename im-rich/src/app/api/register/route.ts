import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const limited = rateLimit(`register:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input." },
      { status: 400 }
    );
  }

  const { fullName, username, email, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return NextResponse.json(
      { error: existing.email === email ? "Email already in use." : "Username already taken." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      fullName,
      username,
      email,
      passwordHash,
      profile: { create: { avatarSeed: username, bio: "Living the rich life." } },
      wallet: { create: { balance: 0 } },
    },
  });

  return NextResponse.json({ id: user.id, username: user.username }, { status: 201 });
}
