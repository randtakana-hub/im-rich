"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Avatar } from "@/components/Avatar";
import { Shuffle } from "lucide-react";

export function SettingsContent() {
  const { data: session } = useSession();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarSeed, setAvatarSeed] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch(`/api/profile/${session.user.username}`)
      .then((r) => r.json())
      .then((d) => {
        setFullName(d.fullName);
        setBio(d.bio ?? "");
        setAvatarSeed(d.avatarSeed);
      });
  }, [session]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, bio, avatarSeed }),
    });
    setLoading(false);
    setSaved(true);
  }

  return (
    <div className="mx-auto max-w-lg animate-rise-in">
      <h1 className="mb-6 font-display text-2xl text-parchment-100">Edit profile</h1>
      <form onSubmit={handleSave} className="panel space-y-5 p-6">
        {saved && (
          <p className="rounded-lg bg-wealth-up/10 px-3 py-2 text-sm text-wealth-up">Profile updated.</p>
        )}

        <div className="flex items-center gap-4">
          <Avatar seed={avatarSeed} size={64} ring />
          <button
            type="button"
            onClick={() => setAvatarSeed(Math.random().toString(36).slice(2, 10))}
            className="btn-ghost text-sm"
          >
            <Shuffle size={14} /> Shuffle avatar
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-parchment-300">Full name</label>
          <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm text-parchment-300">Bio</label>
          <textarea
            className="input-field resize-none"
            rows={3}
            maxLength={160}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
          <p className="mt-1 text-right text-xs text-parchment-500">{bio.length}/160</p>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
          {loading ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
