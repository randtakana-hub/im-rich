import Stripe from "stripe";

export const isTestPaymentMode = process.env.USE_TEST_PAYMENTS !== "false";

// The apiVersion string must match a literal your installed `stripe` package
// version recognizes. If `npm install` reports a type error here, check
// node_modules/stripe/types/lib.d.ts (or the Stripe docs) for the current
// pinned version string and update this literal to match.
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20" as Stripe.LatestApiVersion,
    })
  : null;
