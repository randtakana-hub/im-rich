import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { creditPurchasedRichCoin, DuplicateRequestError } from "@/lib/rc";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe is not configured." }, { status: 501 });
  }

  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const checkoutSession = event.data.object as any;
    const userId = checkoutSession.metadata?.userId;
    const rcAmount = Number(checkoutSession.metadata?.rcAmount);
    const packageId = checkoutSession.metadata?.packageId;

    if (userId && rcAmount > 0) {
      try {
        await creditPurchasedRichCoin({
          userId,
          rcAmount,
          amountPaidCents: checkoutSession.amount_total ?? 0,
          currency: checkoutSession.currency ?? "usd",
          paymentProvider: "stripe",
          providerPaymentId: checkoutSession.id, // idempotency: Stripe reuses this id on retries
          packageName: packageId ?? "unknown",
        });
      } catch (err) {
        if (!(err instanceof DuplicateRequestError)) {
          console.error("Failed to credit RC from webhook", err);
          return NextResponse.json({ error: "Internal error" }, { status: 500 });
        }
        // Duplicate delivery of an event we already processed — ack it.
      }
    }
  }

  return NextResponse.json({ received: true });
}
