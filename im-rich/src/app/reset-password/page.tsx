"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RCIcon } from "@/components/RCIcon";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <RCIcon size={40} />
          <h1 className="font-display text-2xl text-parchment-100">Set a new password</h1>
        </div>
        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          {error && <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{error}</p>}
          {success && (
            <p className="rounded-lg bg-wealth-up/10 px-3 py-2 text-sm text-wealth-up">
              Password updated. Redirecting to login…
            </p>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">New password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" disabled={loading || !token} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Updating…" : "Update password"}
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
