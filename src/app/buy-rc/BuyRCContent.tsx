"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RCIcon } from "@/components/RCIcon";

const PACKAGES = [
  { id: "25_RC", rc: 25, price: "$2.50" },
  { id: "50_RC", rc: 50, price: "$5.00" },
  { id: "100_RC", rc: 100, price: "$10.00" },
  { id: "250_RC", rc: 250, price: "$25.00" },
  { id: "500_RC", rc: 500, price: "$50.00" },
  { id: "1000_RC", rc: 1000, price: "$100.00" },
];

export function BuyRCContent() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buy(packageId: string) {
    setLoadingId(packageId);
    setError(null);
    const res = await fetch("/api/rc/buy/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const data = await res.json();
    setLoadingId(null);
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      return;
    }
    router.push(data.redirectUrl);
  }

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Buy Rich Coin</h1>
        <p className="mt-1 text-parchment-500">
          RC is a virtual social currency for use within IM RICH. It is not an investment and cannot be
          redeemed for cash.
        </p>
      </div>

      {error && <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{error}</p>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((p) => (
          <div key={p.id} className="panel-glow flex flex-col items-center gap-3 p-8 text-center">
            <RCIcon size={40} />
            <p className="font-display text-3xl text-gold-300">{p.rc.toLocaleString()} RC</p>
            <p className="text-parchment-400">{p.price}</p>
            <button
              onClick={() => buy(p.id)}
              disabled={loadingId === p.id}
              className="btn-gold mt-2 w-full disabled:opacity-60"
            >
              {loadingId === p.id ? "Redirecting…" : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
