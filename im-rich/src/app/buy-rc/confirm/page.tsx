"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { RCIcon } from "@/components/RCIcon";
import { AppShell } from "@/components/AppShell";
import { useSession } from "next-auth/react";

export default function ConfirmBuyRCPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex justify-center py-16">
            <Loader2 size={32} className="animate-spin text-gold-400" />
          </div>
        </AppShell>
      }
    >
      <ConfirmBuyRCContent />
    </Suspense>
  );
}

function ConfirmBuyRCContent() {
  const { status } = useSession();
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("paymentId");
  const [state, setState] = useState<"pending" | "success" | "error">("pending");
  const [rcAmount, setRcAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (!paymentId || status !== "authenticated") {
      if (!paymentId) {
        setState("error");
        setError("Missing payment reference.");
      }
      return;
    }

    // Simulates the brief delay of a real payment provider confirming a
    // charge, then hits our server-side confirmation endpoint — which is
    // the only thing that actually credits RC, based on the amount WE
    // recorded at checkout, never anything passed in from this page.
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/rc/buy/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setState("error");
          setError(data.error ?? "Could not confirm payment.");
          return;
        }
        setRcAmount(data.rcAmount);
        setState("success");
      } catch {
        setState("error");
        setError("Network error. Please try again.");
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [paymentId, status]);

  return (
    <AppShell>
      <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center animate-rise-in">
        {state === "pending" && (
          <>
            <Loader2 size={32} className="animate-spin text-gold-400" />
            <p className="mt-4 text-parchment-300">Confirming your payment…</p>
            <p className="mt-1 text-xs text-parchment-500">Test payment mode — no real charge is made.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-wealth-up/10">
              <CheckCircle2 size={30} className="text-wealth-up" />
            </div>
            <RCIcon size={36} className="my-3" />
            <h1 className="font-display text-2xl text-parchment-100">Purchase complete</h1>
            <p className="mt-2 text-parchment-400">
              {rcAmount?.toLocaleString()} RC has been added to your wallet.
            </p>
            <Link href="/wallet" className="btn-gold mt-6">
              Go to Wallet
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-wealth-down/10">
              <XCircle size={30} className="text-wealth-down" />
            </div>
            <h1 className="font-display text-2xl text-parchment-100">Payment could not be confirmed</h1>
            <p className="mt-2 text-parchment-400">{error}</p>
            <button onClick={() => router.push("/buy-rc")} className="btn-ghost mt-6">
              Back to Buy RC
            </button>
          </>
        )}
      </div>
    </AppShell>
  );
}
