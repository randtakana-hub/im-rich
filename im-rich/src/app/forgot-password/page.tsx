"use client";

import { useState } from "react";
import Link from "next/link";
import { RCIcon } from "@/components/RCIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    setMessage(data.message ?? data.error);
    if (data.devResetUrl) setDevUrl(data.devResetUrl);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <RCIcon size={40} />
          <h1 className="font-display text-2xl text-parchment-100">Reset your password</h1>
        </div>
        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          {message && <p className="rounded-lg bg-white/[0.04] px-3 py-2 text-sm text-parchment-300">{message}</p>}
          {devUrl && (
            <p className="break-all rounded-lg border border-gold-500/30 bg-gold-500/5 px-3 py-2 text-xs text-gold-300">
              Dev mode (no email provider configured):{" "}
              <Link href={devUrl} className="underline">
                {devUrl}
              </Link>
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Email</label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-parchment-400">
          <Link href="/login" className="text-gold-400 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
