import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/requireAdmin";
import { adminAdjustBalance, InsufficientFundsError } from "@/lib/rc";

const schema = z.object({
  userId: z.string(),
  amount: z.number().int().refine((n) => n !== 0, "Amount can't be zero."),
  reason: z.string().trim().min(3).max(200),
});

export async function POST(req: NextRequest) {
  const { session, error } = await requireAdmin();
  if (error || !session) return NextResponse.json({ error: error ?? "Forbidden." }, { status: 403 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input." }, { status: 400 });
  }

  try {
    await adminAdjustBalance({
      adminId: session.user.id,
      targetUserId: parsed.data.userId,
      amount: parsed.data.amount,
      reason: parsed.data.reason,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof InsufficientFundsError) {
      return NextResponse.json({ error: "That would take the balance below zero." }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "Adjustment failed." }, { status: 500 });
  }
}
