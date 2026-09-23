"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { RCIcon } from "@/components/RCIcon";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      identifier: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <RCIcon size={40} />
          <h1 className="font-display text-2xl text-parchment-100">Create your account</h1>
        </div>

        <form onSubmit={handleSubmit} className="panel space-y-4 p-6">
          {error && (
            <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{error}</p>
          )}
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Full name</label>
            <input className="input-field" value={form.fullName} onChange={update("fullName")} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Username</label>
            <input
              className="input-field"
              value={form.username}
              onChange={update("username")}
              required
              pattern="[a-zA-Z0-9_]+"
              title="Letters, numbers, and underscores only"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Email</label>
            <input type="email" className="input-field" value={form.email} onChange={update("email")} required />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-parchment-300">Password</label>
            <input
              type="password"
              className="input-field"
              value={form.password}
              onChange={update("password")}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="mt-1 text-xs text-parchment-500">At least 8 characters.</p>
          </div>
          <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-60">
            {loading ? "Creating account…" : "Get Started"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-parchment-400">
          Already have an account?{" "}
          <Link href="/login" className="text-gold-400 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
