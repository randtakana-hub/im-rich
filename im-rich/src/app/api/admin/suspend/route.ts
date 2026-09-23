import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/requireAdmin";

const schema = z.object({ userId: z.string(), suspended: z.boolean() });

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  if (target.isAdmin) {
    return NextResponse.json({ error: "Admins can't be suspended from here." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { isSuspended: parsed.data.suspended },
  });

  return NextResponse.json({ success: true });
}
