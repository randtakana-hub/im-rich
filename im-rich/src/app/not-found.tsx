import Link from "next/link";
import { RCIcon } from "@/components/RCIcon";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <RCIcon size={40} className="mb-6 opacity-60" />
      <h1 className="font-display text-3xl text-parchment-100">Page not found</h1>
      <p className="mt-2 text-parchment-400">This page doesn't exist, or may have moved.</p>
      <Link href="/dashboard" className="btn-gold mt-6">
        Go to Dashboard
      </Link>
    </div>
  );
}
