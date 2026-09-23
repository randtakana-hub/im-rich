"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { RCIcon } from "@/components/RCIcon";

type Friend = { username: string; fullName: string; avatarSeed: string; balance: number };
type Req = { requestId: string; username: string; fullName: string; avatarSeed: string };

export function FriendsContent() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);

  const load = useCallback(() => {
    fetch("/api/friends")
      .then((r) => r.json())
      .then((d) => {
        setFriends(d.friends ?? []);
        setRequests(d.requests ?? []);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function respond(requestId: string, action: "accept" | "reject") {
    await fetch(`/api/friends/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId }),
    });
    load();
  }

  async function remove(username: string) {
    await fetch("/api/friends/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    load();
  }

  return (
    <div className="animate-rise-in space-y-8">
      <h1 className="font-display text-3xl text-parchment-100">Friends</h1>

      {requests.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm uppercase tracking-wide text-parchment-500">Friend Requests</h2>
          <div className="space-y-3">
            {requests.map((r) => (
              <div key={r.requestId} className="panel flex items-center gap-4 p-4">
                <Avatar seed={r.avatarSeed} size={44} />
                <div className="min-w-0 flex-1">
                  <Link href={`/profile/${r.username}`} className="font-medium text-parchment-100 hover:text-gold-300">
                    {r.fullName}
                  </Link>
                  <p className="text-sm text-parchment-500">@{r.username}</p>
                </div>
                <button onClick={() => respond(r.requestId, "accept")} className="btn-gold px-4 py-2 text-sm">
                  Accept
                </button>
                <button onClick={() => respond(r.requestId, "reject")} className="btn-ghost px-4 py-2 text-sm">
                  Reject
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm uppercase tracking-wide text-parchment-500">
          Your Friends ({friends.length})
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {friends.map((f) => (
            <div key={f.username} className="panel flex items-center gap-4 p-4">
              <Link href={`/profile/${f.username}`}>
                <Avatar seed={f.avatarSeed} size={48} ring />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${f.username}`} className="font-medium text-parchment-100 hover:text-gold-300">
                  {f.fullName}
                </Link>
                <p className="flex items-center gap-1 text-sm text-gold-300">
                  <RCIcon size={12} /> {f.balance.toLocaleString()} RC
                </p>
              </div>
              <button onClick={() => remove(f.username)} className="text-xs text-parchment-500 hover:text-wealth-down">
                Remove
              </button>
            </div>
          ))}
          {friends.length === 0 && (
            <p className="col-span-full py-8 text-center text-parchment-500">
              No friends yet. Head to{" "}
              <Link href="/explore" className="text-gold-400 hover:underline">
                Explore
              </Link>{" "}
              to find people.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
