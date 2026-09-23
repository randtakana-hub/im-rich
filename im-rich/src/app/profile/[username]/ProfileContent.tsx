"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/components/Avatar";
import { WealthCard } from "@/components/WealthCard";
import { SendRCModal } from "@/components/SendRCModal";
import { Settings, Trophy, Users, Calendar } from "lucide-react";

type Profile = {
  username: string;
  fullName: string;
  bio: string;
  avatarSeed: string;
  balance: number;
  joinDate: string;
  friendCount: number;
  rank: number | null;
  requestState: "self" | "none" | "friends" | "pending_outgoing" | "pending_incoming";
  pendingRequestId: string | null;
};

export function ProfileContent({ username }: { username: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myBalance, setMyBalance] = useState(0);
  const [showSend, setShowSend] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/profile/${username}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setProfile)
      .catch(() => {});
    fetch("/api/wallet/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setMyBalance(d.balance))
      .catch(() => {});
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFriendAction(action: "request" | "accept" | "reject" | "remove") {
    if (!profile) return;
    setActionLoading(true);
    const endpoint = `/api/friends/${action}`;
    const body =
      action === "accept" || action === "reject"
        ? { requestId: profile.pendingRequestId }
        : { username: profile.username };

    await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setActionLoading(false);
    load();
  }

  if (!profile) return <div className="py-24 text-center text-parchment-500">Loading profile…</div>;

  return (
    <div className="mx-auto max-w-3xl animate-rise-in space-y-6">
      <div className="panel flex flex-col items-center gap-4 p-8 text-center">
        <Avatar seed={profile.avatarSeed} size={88} ring />
        <div>
          <h1 className="font-display text-2xl text-parchment-100">{profile.fullName}</h1>
          <p className="text-parchment-500">@{profile.username}</p>
        </div>
        {profile.bio && <p className="max-w-md text-parchment-300">"{profile.bio}"</p>}

        <div className="flex items-center gap-6 text-sm text-parchment-400">
          <div className="flex items-center gap-1.5">
            <Users size={14} /> {profile.friendCount} friends
          </div>
          {profile.rank && (
            <div className="flex items-center gap-1.5">
              <Trophy size={14} /> Rank #{profile.rank}
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Calendar size={14} /> Joined {new Date(profile.joinDate).toLocaleDateString()}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {profile.requestState === "self" && (
            <Link href="/settings" className="btn-ghost">
              <Settings size={16} /> Edit profile
            </Link>
          )}
          {profile.requestState === "none" && (
            <button onClick={() => handleFriendAction("request")} disabled={actionLoading} className="btn-ghost">
              Add Friend
            </button>
          )}
          {profile.requestState === "pending_outgoing" && (
            <button className="btn-ghost opacity-60" disabled>
              Request sent
            </button>
          )}
          {profile.requestState === "pending_incoming" && (
            <>
              <button onClick={() => handleFriendAction("accept")} disabled={actionLoading} className="btn-gold">
                Accept
              </button>
              <button onClick={() => handleFriendAction("reject")} disabled={actionLoading} className="btn-ghost">
                Reject
              </button>
            </>
          )}
          {profile.requestState === "friends" && (
            <>
              <button onClick={() => setShowSend(true)} className="btn-gold">
                Send RC
              </button>
              <button onClick={() => handleFriendAction("remove")} disabled={actionLoading} className="btn-ghost">
                Remove Friend
              </button>
            </>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-sm">
        <WealthCard balance={profile.balance} />
      </div>

      {showSend && (
        <SendRCModal
          username={profile.username}
          available={myBalance}
          onClose={() => setShowSend(false)}
          onSent={() => load()}
        />
      )}
    </div>
  );
}
