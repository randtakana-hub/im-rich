import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePair } from "@/lib/friends";

const schema = z.object({ username: z.string().trim().toLowerCase() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const { userAId, userBId } = normalizePair(session.user.id, target.id);

  await prisma.friendship.deleteMany({ where: { userAId, userBId } });

  return NextResponse.json({ success: true });
}
