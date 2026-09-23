import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RC_PACKAGES } from "@/lib/rc";
import { isTestPaymentMode, stripe } from "@/lib/stripe";
import { rateLimit } from "@/lib/rateLimit";

const schema = z.object({ packageId: z.string() });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limited = rateLimit(`checkout:${session.user.id}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid package." }, { status: 400 });

  const pkg = RC_PACKAGES.find((p) => p.id === parsed.data.packageId);
  if (!pkg) return NextResponse.json({ error: "Unknown package." }, { status: 400 });

  // ── Test / development mode ──────────────────────────────────────────
  // No real charge happens. We still create a real, uniquely-keyed Payment
  // row in PENDING status and only credit RC once the "confirm" step (the
  // stand-in for a payment provider's webhook) is hit — the same shape the
  // production Stripe flow uses, so swapping in real Stripe later doesn't
  // change the RC-crediting logic at all.
  if (isTestPaymentMode || !stripe) {
    const providerPaymentId = `test_${randomUUID()}`;
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        package: pkg.id,
        rcAmount: pkg.rc,
        amountPaidCents: pkg.cents,
        currency: "usd",
        paymentProvider: "test-mode",
        providerPaymentId,
        status: "PENDING",
      },
    });
    return NextResponse.json({
      mode: "test",
      redirectUrl: `/buy-rc/confirm?paymentId=${providerPaymentId}`,
    });
  }

  // ── Production Stripe path ───────────────────────────────────────────
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pkg.cents,
          product_data: { name: `${pkg.rc.toLocaleString()} Rich Coin` },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session.user.id,
      packageId: pkg.id,
      rcAmount: String(pkg.rc),
    },
    success_url: `${process.env.NEXTAUTH_URL}/wallet?purchase=success`,
    cancel_url: `${process.env.NEXTAUTH_URL}/buy-rc?purchase=canceled`,
  });

  await prisma.payment.create({
    data: {
      userId: session.user.id,
      package: pkg.id,
      rcAmount: pkg.rc,
      amountPaidCents: pkg.cents,
      currency: "usd",
      paymentProvider: "stripe",
      providerPaymentId: checkoutSession.id,
      status: "PENDING",
    },
  });

  return NextResponse.json({ mode: "stripe", redirectUrl: checkoutSession.url });
}
