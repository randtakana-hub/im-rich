"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { useSession } from "next-auth/react";

type Row = { rank: number; username: string; fullName: string; avatarSeed: string; balance: number };

export function LeaderboardContent() {
  const { data: session } = useSession();
  const [rows, setRows] = useState<Row[]>([]);
  const [yourRank, setYourRank] = useState<{ rank: number; topPercent: number; balance: number } | null>(null);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then((d) => {
        setRows(d.leaderboard ?? []);
        setYourRank(d.yourRank ?? null);
      });
  }, []);

  const [first, second, third, ...rest] = rows;

  const podiumStyle: Record<number, string> = {
    1: "border-gold-400/50 bg-gradient-to-b from-gold-500/15 to-transparent shadow-gold order-2 md:-translate-y-4",
    2: "border-parchment-300/30 bg-white/[0.03] order-1",
    3: "border-gold-700/40 bg-gold-700/[0.06] order-3",
  };

  return (
    <div className="animate-rise-in space-y-8">
      <h1 className="font-display text-3xl text-parchment-100">Top Rich</h1>

      {rows.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[first, second, third].map((p, i) =>
            p ? (
              <div key={p.username} className={`panel flex flex-col items-center gap-3 border p-6 text-center ${podiumStyle[i + 1]}`}>
                {i === 0 && <Crown size={22} className="text-gold-400" />}
                <Avatar seed={p.avatarSeed} size={i === 0 ? 72 : 56} ring />
                <div>
                  <Link href={`/profile/${p.username}`} className="font-medium text-parchment-100 hover:text-gold-300">
                    {p.fullName}
                  </Link>
                  <p className="text-sm text-parchment-500">@{p.username}</p>
                </div>
                <p className="font-display text-2xl text-gold-300">{p.balance.toLocaleString()} RC</p>
              </div>
            ) : (
              <div key={i} />
            )
          )}
        </div>
      )}

      <div className="panel divide-y divide-white/[0.05]">
        {rest.map((r) => (
          <div key={r.username} className="flex items-center gap-4 p-4">
            <span className="w-8 text-center font-display text-parchment-500">#{r.rank}</span>
            <Avatar seed={r.avatarSeed} size={40} />
            <div className="min-w-0 flex-1">
              <Link href={`/profile/${r.username}`} className="font-medium text-parchment-100 hover:text-gold-300">
                {r.fullName}
              </Link>
              <p className="text-sm text-parchment-500">@{r.username}</p>
            </div>
            <p className="tabular font-medium text-gold-300">{r.balance.toLocaleString()} RC</p>
          </div>
        ))}
      </div>

      {yourRank && session && (
        <div className="panel-glow flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-parchment-500">Your Rank</p>
            <p className="font-display text-2xl text-parchment-100">#{yourRank.rank}</p>
          </div>
          <p className="text-sm text-parchment-400">Top {yourRank.topPercent}%</p>
        </div>
      )}
    </div>
  );
}
