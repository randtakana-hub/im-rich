"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { RCIcon } from "@/components/RCIcon";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    });

    setLoading(false);
    if (res?.error) {
      setError("Incorrect email/username or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <RCIcon size={40} />
          <h1 className="font-display text-2xl text-parchment-100">Welcome back</h1>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          {error && (
            <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{error}</p>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Email or username</label>
            <input
              className="input-field"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Password</label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <Link href="/forgot-password" className="block text-right text-xs text-gold-400 hover:underline">
            Forgot password?
          </Link>
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-parchment-400">
          New to IM RICH?{" "}
          <Link href="/register" className="text-gold-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
