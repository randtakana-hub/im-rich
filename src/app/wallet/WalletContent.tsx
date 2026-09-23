"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RCIcon } from "@/components/RCIcon";
import { CountUp } from "@/components/CountUp";
import { ArrowUpRight, ArrowDownRight, ShoppingBag, SlidersHorizontal } from "lucide-react";

type Summary = { balance: number; totalPurchased: number; totalSent: number; totalReceived: number };
type Tx = {
  id: string;
  amount: number;
  type: "SEND" | "RECEIVE" | "PURCHASE" | "ADMIN_ADJUST";
  status: string;
  direction: "in" | "out";
  counterparty: string | null;
  createdAt: string;
};

export function WalletContent() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [txs, setTxs] = useState<Tx[]>([]);

  useEffect(() => {
    fetch("/api/wallet/summary")
      .then((r) => r.json())
      .then(setSummary);
    fetch("/api/wallet/transactions")
      .then((r) => r.json())
      .then((d) => setTxs(d.transactions ?? []));
  }, []);

  function typeLabel(t: Tx) {
    if (t.type === "PURCHASE") return "Purchased RC";
    if (t.type === "ADMIN_ADJUST") return "Balance adjustment";
    if (t.direction === "in") return `Received from @${t.counterparty}`;
    return `Sent to @${t.counterparty}`;
  }

  function icon(t: Tx) {
    if (t.type === "PURCHASE") return <ShoppingBag size={14} className="text-gold-400" />;
    if (t.type === "ADMIN_ADJUST") return <SlidersHorizontal size={14} className="text-parchment-400" />;
    return t.direction === "in" ? (
      <ArrowUpRight size={14} className="text-wealth-up" />
    ) : (
      <ArrowDownRight size={14} className="text-wealth-down" />
    );
  }

  return (
    <div className="animate-rise-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl text-parchment-100">Wallet</h1>
        <Link href="/buy-rc" className="btn-gold text-sm">
          Buy RC
        </Link>
      </div>

      <div className="panel-glow p-8 text-center">
        <div className="mb-2 flex justify-center">
          <RCIcon size={36} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-parchment-500">Rich Coin Balance</p>
        <p className="mt-2 font-display text-5xl text-gold-300">
          {summary ? <CountUp value={summary.balance} /> : "—"}
        </p>
        <p className="mt-4 text-sm text-parchment-400">
          Available to send: {summary?.balance.toLocaleString() ?? "—"} RC
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <p className="text-xs text-parchment-500">Total Purchased</p>
          <p className="mt-1 font-display text-2xl text-parchment-100">
            {summary?.totalPurchased.toLocaleString() ?? "—"}
          </p>
        </div>
        <div className="panel p-5">
          <p className="text-xs text-parchment-500">Total Sent</p>
          <p className="mt-1 font-display text-2xl text-parchment-100">
            {summary?.totalSent.toLocaleString() ?? "—"}
          </p>
        </div>
      </div>

      <div className="panel divide-y divide-white/[0.05]">
        <p className="p-4 text-sm text-parchment-500">Transaction History</p>
        {txs.map((t) => (
          <div key={t.id} className="flex items-center gap-3 p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04]">{icon(t)}</div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-parchment-200">{typeLabel(t)}</p>
              <p className="text-xs text-parchment-500">{new Date(t.createdAt).toLocaleString()}</p>
            </div>
            <p
              className={`tabular text-sm font-medium ${
                t.direction === "in" ? "text-wealth-up" : "text-wealth-down"
              }`}
            >
              {t.direction === "in" ? "+" : "-"}
              {t.amount.toLocaleString()}
            </p>
          </div>
        ))}
        {txs.length === 0 && <p className="p-6 text-center text-parchment-500">No transactions yet.</p>}
      </div>
    </div>
  );
}
