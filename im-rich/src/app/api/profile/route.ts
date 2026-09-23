import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(160).optional(),
  avatarSeed: z.string().trim().min(1).max(60).optional(),
});

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  const { fullName, bio, avatarSeed } = parsed.data;

  await prisma.$transaction([
    ...(fullName ? [prisma.user.update({ where: { id: session.user.id }, data: { fullName } })] : []),
    prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        ...(bio !== undefined ? { bio } : {}),
        ...(avatarSeed !== undefined ? { avatarSeed } : {}),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
