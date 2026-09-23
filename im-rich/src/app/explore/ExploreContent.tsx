"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { RCIcon } from "@/components/RCIcon";

type Person = {
  username: string;
  fullName: string;
  avatarSeed: string;
  balance: number;
  requestState: "none" | "friends" | "pending_outgoing" | "pending_incoming";
};

const filters = [
  { id: "", label: "All" },
  { id: "richest", label: "Richest" },
  { id: "new", label: "New users" },
  { id: "friends", label: "Friends" },
  { id: "active", label: "Recently active" },
];

export function ExploreContent() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (filter) params.set("filter", filter);
    const t = setTimeout(() => {
      fetch(`/api/friends/search?${params.toString()}`)
        .then((r) => r.json())
        .then((d) => setPeople(d.results ?? []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, filter]);

  async function addFriend(username: string) {
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    setPeople((prev) =>
      prev.map((p) => (p.username === username ? { ...p, requestState: "pending_outgoing" } : p))
    );
  }

  return (
    <div className="animate-rise-in space-y-6">
      <div>
        <h1 className="font-display text-3xl text-parchment-100">Explore People</h1>
        <p className="mt-1 text-parchment-500">Find people to follow, befriend, and compare wealth with.</p>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-parchment-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people…"
          className="input-field pl-11"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
              filter === f.id
                ? "border-gold-500/40 bg-gold-500/10 text-gold-300"
                : "border-white/10 text-parchment-400 hover:text-parchment-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {people.map((p) => (
          <div key={p.username} className="panel flex flex-col items-center gap-3 p-6 text-center">
            <Link href={`/profile/${p.username}`}>
              <Avatar seed={p.avatarSeed} size={64} ring />
            </Link>
            <div>
              <Link href={`/profile/${p.username}`} className="font-medium text-parchment-100 hover:text-gold-300">
                {p.fullName}
              </Link>
              <p className="text-sm text-parchment-500">@{p.username}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gold-300">
              <RCIcon size={14} /> {p.balance.toLocaleString()} RC
            </div>
            {p.requestState === "none" && (
              <button onClick={() => addFriend(p.username)} className="btn-ghost w-full text-sm">
                Add Friend
              </button>
            )}
            {p.requestState === "pending_outgoing" && (
              <button disabled className="btn-ghost w-full text-sm opacity-60">
                Request sent
              </button>
            )}
            {p.requestState === "friends" && (
              <span className="w-full rounded-xl border border-gold-500/20 bg-gold-500/5 py-3 text-sm text-gold-300">
                Friends
              </span>
            )}
            {p.requestState === "pending_incoming" && (
              <Link href="/friends" className="btn-ghost w-full text-sm">
                Respond to request
              </Link>
            )}
          </div>
        ))}
        {!loading && people.length === 0 && (
          <p className="col-span-full py-12 text-center text-parchment-500">No one matches yet.</p>
        )}
      </div>
    </div>
  );
}
