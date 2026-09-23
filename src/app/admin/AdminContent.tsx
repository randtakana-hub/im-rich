"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Ban, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { RCIcon } from "@/components/RCIcon";

type Stats = {
  totalUsers: number;
  totalRcInCirculation: number;
  totalRcPurchased: number;
  totalPurchaseCount: number;
  totalRcTransferred: number;
  totalTransferCount: number;
  totalRevenueCents: number;
  totalPaymentCount: number;
  recentTransactions: {
    id: string;
    type: string;
    amount: number;
    status: string;
    sender: string | null;
    receiver: string | null;
    createdAt: string;
  }[];
};

type AdminUser = {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  isSuspended: boolean;
  balance: number;
  totalPurchased: number;
  createdAt: string;
};

export function AdminContent() {
  const [tab, setTab] = useState<"overview" | "users">("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [adjustTarget, setAdjustTarget] = useState<AdminUser | null>(null);

  const loadStats = useCallback(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const loadUsers = useCallback(() => {
    const params = query ? `?q=${encodeURIComponent(query)}` : "";
    fetch(`/api/admin/users${params}`)
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []));
  }, [query]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 200);
    return () => clearTimeout(t);
  }, [loadUsers]);

  async function toggleSuspend(user: AdminUser) {
    await fetch("/api/admin/suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, suspended: !user.isSuspended }),
    });
    loadUsers();
  }

  return (
    <div className="animate-rise-in space-y-6">
      <h1 className="font-display text-3xl text-parchment-100">Admin Panel</h1>

      <div className="flex gap-2">
        {(["overview", "users"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
              tab === t
                ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
                : "border-white/10 text-parchment-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: "Total Users", value: stats.totalUsers.toLocaleString() },
              { label: "RC in Circulation", value: stats.totalRcInCirculation.toLocaleString() },
              { label: "RC Purchased", value: stats.totalRcPurchased.toLocaleString() },
              { label: "RC Transferred", value: stats.totalRcTransferred.toLocaleString() },
              { label: "Purchases", value: stats.totalPurchaseCount.toLocaleString() },
              { label: "Transfers", value: stats.totalTransferCount.toLocaleString() },
              {
                label: "Revenue",
                value: `$${(stats.totalRevenueCents / 100).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}`,
              },
              { label: "Payments", value: stats.totalPaymentCount.toLocaleString() },
            ].map((s) => (
              <div key={s.label} className="panel p-5">
                <p className="text-xs text-parchment-500">{s.label}</p>
                <p className="mt-1 font-display text-2xl text-gold-300">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="panel divide-y divide-white/[0.05]">
            <p className="p-4 text-sm text-parchment-500">Recent Transactions</p>
            {stats.recentTransactions.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-4 text-sm">
                <span className="w-24 shrink-0 text-parchment-500">{t.type}</span>
                <span className="min-w-0 flex-1 truncate text-parchment-300">
                  {t.sender ? `@${t.sender}` : "—"} → {t.receiver ? `@${t.receiver}` : "—"}
                </span>
                <span className="tabular text-gold-300">{t.amount.toLocaleString()} RC</span>
                <span className="w-20 shrink-0 text-right text-xs text-parchment-500">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, email, name…"
              className="input-field pl-11"
            />
          </div>

          <div className="overflow-x-auto">
            <div className="panel min-w-[720px] divide-y divide-white/[0.05]">
              <div className="grid grid-cols-6 gap-3 p-4 text-xs uppercase tracking-wide text-parchment-500">
                <span className="col-span-2">User</span>
                <span>Balance</span>
                <span>Purchased</span>
                <span>Status</span>
                <span className="text-right">Actions</span>
              </div>
              {users.map((u) => (
                <div key={u.id} className="grid grid-cols-6 items-center gap-3 p-4 text-sm">
                  <div className="col-span-2 min-w-0">
                    <p className="truncate text-parchment-100">{u.fullName}</p>
                    <p className="truncate text-xs text-parchment-500">
                      @{u.username} · {u.email}
                    </p>
                  </div>
                  <span className="tabular flex items-center gap-1 text-gold-300">
                    <RCIcon size={12} /> {u.balance.toLocaleString()}
                  </span>
                  <span className="tabular text-parchment-400">{u.totalPurchased.toLocaleString()}</span>
                  <span>
                    {u.isAdmin ? (
                      <span className="text-xs text-gold-400">Admin</span>
                    ) : u.isSuspended ? (
                      <span className="text-xs text-wealth-down">Suspended</span>
                    ) : (
                      <span className="text-xs text-wealth-up">Active</span>
                    )}
                  </span>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setAdjustTarget(u)}
                      className="rounded-lg p-1.5 text-parchment-400 hover:bg-white/[0.06] hover:text-gold-300"
                      title="Adjust balance"
                    >
                      <SlidersHorizontal size={15} />
                    </button>
                    {!u.isAdmin && (
                      <button
                        onClick={() => toggleSuspend(u)}
                        className="rounded-lg p-1.5 text-parchment-400 hover:bg-white/[0.06] hover:text-wealth-down"
                        title={u.isSuspended ? "Unsuspend" : "Suspend"}
                      >
                        {u.isSuspended ? <CheckCircle2 size={15} /> : <Ban size={15} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="p-6 text-center text-parchment-500">No users found.</p>}
            </div>
          </div>
        </div>
      )}

      {adjustTarget && (
        <AdjustBalanceModal
          user={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onDone={() => {
            setAdjustTarget(null);
            loadUsers();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function AdjustBalanceModal({
  user,
  onClose,
  onDone,
}: {
  user: AdminUser;
  onClose: () => void;
  onDone: () => void;
}) {
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, amount, reason }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Adjustment failed.");
      return;
    }
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <form onSubmit={submit} className="panel-glow w-full max-w-sm space-y-4 p-6">
        <h2 className="font-display text-xl text-parchment-100">Adjust @{user.username}'s balance</h2>
        {error && <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{error}</p>}
        <div>
          <label className="mb-1.5 block text-sm text-parchment-300">
            Amount (use a negative number to deduct)
          </label>
          <input
            type="number"
            className="input-field"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-parchment-300">Reason (required, audited)</label>
          <textarea
            className="input-field resize-none"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            minLength={3}
          />
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading || amount === 0} className="btn-gold flex-1 disabled:opacity-60">
            {loading ? "Applying…" : "Apply adjustment"}
          </button>
        </div>
      </form>
    </div>
  );
}
