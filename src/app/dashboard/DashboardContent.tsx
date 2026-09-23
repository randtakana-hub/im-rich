"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useSession } from "next-auth/react";
import { CountUp } from "@/components/CountUp";
import { RCIcon } from "@/components/RCIcon";
import { Trophy, Users, ArrowUpRight, ArrowDownRight, ShoppingBag } from "lucide-react";

type DashboardData = {
  balance: number;
  changeThisMonth: number;
  friendCount: number;
  rank: number | null;
  topPercent: number | null;
  chart: { date: string; balance: number }[];
  recentActivity: { id: string; direction: "in" | "out"; amount: number; label: string; createdAt: string }[];
};

export function DashboardContent() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-rise-in">
      <div>
        <p className="text-sm text-parchment-500">Welcome back</p>
        <h1 className="font-display text-3xl text-parchment-100">
          {session?.user?.name?.split(" ")[0] ?? "there"}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel-glow p-6 md:col-span-1">
          <div className="mb-3 flex items-center gap-2">
            <RCIcon size={18} />
            <p className="text-xs uppercase tracking-wide text-parchment-500">Rich Coin Balance</p>
          </div>
          <p className="font-display text-4xl text-gold-300">
            {data ? <CountUp value={data.balance} /> : "—"}
            <span className="ml-2 text-lg text-parchment-500">RC</span>
          </p>
          {data && (
            <p
              className={`mt-2 flex items-center gap-1 text-sm ${
                data.changeThisMonth >= 0 ? "text-wealth-up" : "text-wealth-down"
              }`}
            >
              {data.changeThisMonth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {data.changeThisMonth >= 0 ? "+" : ""}
              {data.changeThisMonth.toLocaleString()} RC this month
            </p>
          )}
        </div>

        <div className="panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-gold-400" />
            <p className="text-xs uppercase tracking-wide text-parchment-500">My Rank</p>
          </div>
          <p className="font-display text-4xl text-parchment-100">{data?.rank ? `#${data.rank}` : "—"}</p>
          {data?.topPercent && <p className="mt-2 text-sm text-parchment-400">Top {data.topPercent}%</p>}
        </div>

        <div className="panel p-6">
          <div className="mb-3 flex items-center gap-2">
            <Users size={16} className="text-gold-400" />
            <p className="text-xs uppercase tracking-wide text-parchment-500">Friends</p>
          </div>
          <p className="font-display text-4xl text-parchment-100">
            {data ? <CountUp value={data.friendCount} /> : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="panel p-6 md:col-span-2">
          <p className="mb-4 text-sm text-parchment-400">RC activity — last 30 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.chart ?? []}>
                <defs>
                  <linearGradient id="goldLine" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#C88A2A" />
                    <stop offset="100%" stopColor="#F0B95A" />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <Tooltip
                  contentStyle={{
                    background: "#151517",
                    border: "1px solid rgba(217,164,65,0.25)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#8A8780" }}
                  formatter={(v: number) => [`${v.toLocaleString()} RC`, "Balance"]}
                />
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="url(#goldLine)"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6">
          <p className="mb-4 text-sm text-parchment-400">Recent Activity</p>
          <div className="space-y-4">
            {data?.recentActivity.length === 0 && (
              <p className="text-sm text-parchment-500">No activity yet.</p>
            )}
            {data?.recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    a.direction === "in" ? "bg-wealth-up/10" : "bg-wealth-down/10"
                  }`}
                >
                  {a.direction === "in" ? (
                    <ArrowUpRight size={14} className="text-wealth-up" />
                  ) : (
                    <ArrowDownRight size={14} className="text-wealth-down" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-parchment-200">{a.label}</p>
                </div>
                <p
                  className={`tabular text-sm font-medium ${
                    a.direction === "in" ? "text-wealth-up" : "text-wealth-down"
                  }`}
                >
                  {a.direction === "in" ? "+" : "-"}
                  {a.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
