import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { creditPurchasedRichCoin, DuplicateRequestError } from "@/lib/rc";
import { isTestPaymentMode } from "@/lib/stripe";

const schema = z.object({ paymentId: z.string() });

/**
 * This route only exists in test-payment mode. It plays the role a real
 * payment provider's webhook plays: it independently looks up the pending
 * Payment record and credits RC based on THAT record, never based on
 * anything the client claims about amount or success. In production this
 * route is disabled entirely and /api/webhooks/stripe (verified against
 * Stripe's signature) is the only thing that can credit a purchase.
 */
export async function POST(req: NextRequest) {
  if (!isTestPaymentMode) {
    return NextResponse.json({ error: "Test payment mode is disabled." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const payment = await prisma.payment.findUnique({ where: { providerPaymentId: parsed.data.paymentId } });
  if (!payment || payment.userId !== session.user.id) {
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  }
  if (payment.status === "SUCCEEDED") {
    return NextResponse.json({ success: true, alreadyProcessed: true, rcAmount: payment.rcAmount });
  }
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "This payment can no longer be confirmed." }, { status: 400 });
  }

  try {
    await creditPurchasedRichCoin({
      userId: payment.userId,
      rcAmount: payment.rcAmount,
      amountPaidCents: payment.amountPaidCents,
      currency: payment.currency,
      paymentProvider: payment.paymentProvider,
      providerPaymentId: payment.providerPaymentId,
      packageName: payment.package,
    });
    return NextResponse.json({ success: true, rcAmount: payment.rcAmount });
  } catch (err) {
    if (err instanceof DuplicateRequestError) {
      return NextResponse.json({ success: true, alreadyProcessed: true, rcAmount: payment.rcAmount });
    }
    console.error(err);
    return NextResponse.json({ error: "Could not confirm payment." }, { status: 500 });
  }
}
