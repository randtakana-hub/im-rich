"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="panel max-w-sm p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 text-gold-400" size={28} />
        <h1 className="font-display text-xl text-parchment-100">Something went wrong</h1>
        <p className="mt-2 text-sm text-parchment-400">Please try again in a moment.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-ghost">
            Try again
          </button>
          <Link href="/dashboard" className="btn-gold">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
