"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-ink-950 px-4 text-parchment-100">
        <div className="panel max-w-sm p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-gold-400" size={28} />
          <h1 className="font-display text-xl">Something went wrong</h1>
          <p className="mt-2 text-sm text-parchment-400">
            An unexpected error occurred. You can try again, or head back to your dashboard.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={reset} className="btn-ghost">
              Try again
            </button>
            <Link href="/dashboard" className="btn-gold">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
