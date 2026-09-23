"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell } from "lucide-react";
import { RCIcon } from "@/components/RCIcon";
import { Avatar } from "@/components/Avatar";
import { useEffect, useState } from "react";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/explore", label: "Explore" },
  { href: "/friends", label: "Friends" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/buy-rc", label: "Buy RC" },
  { href: "/wallet", label: "Wallet" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session) return;
    fetch("/api/wallet/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBalance(d.balance))
      .catch(() => {});
    fetch("/api/notifications?unreadOnly=true")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setUnread(d.count))
      .catch(() => {});
  }, [session, pathname]);

  if (!session) return null;

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/[0.06] bg-ink-950/80 backdrop-blur-xl md:block">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <RCIcon size={26} />
            <span className="font-display text-lg tracking-tight text-parchment-100">IM RICH</span>
          </Link>
          <nav className="flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  pathname === l.href
                    ? "bg-white/[0.06] text-gold-400"
                    : "text-parchment-300 hover:text-parchment-100"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {balance !== null && (
            <Link
              href="/wallet"
              className="flex items-center gap-2 rounded-full border border-gold-500/25 bg-white/[0.03] px-3 py-1.5 text-sm"
            >
              <RCIcon size={16} />
              <span className="tabular font-medium text-gold-300">{balance.toLocaleString()} RC</span>
            </Link>
          )}

          <Link href="/notifications" className="relative rounded-full p-2 hover:bg-white/[0.05]">
            <Bell size={18} className="text-parchment-300" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold-400" />
            )}
          </Link>

          <div className="relative">
            <button onClick={() => setMenuOpen((v) => !v)} className="block">
              <Avatar seed={session.user.username} size={34} ring />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-ink-800 py-1 shadow-panel">
                <Link
                  href={`/profile/${session.user.username}`}
                  className="block px-4 py-2 text-sm text-parchment-200 hover:bg-white/[0.05]"
                  onClick={() => setMenuOpen(false)}
                >
                  My profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-4 py-2 text-sm text-parchment-200 hover:bg-white/[0.05]"
                  onClick={() => setMenuOpen(false)}
                >
                  Edit profile
                </Link>
                {session.user.isAdmin && (
                  <Link
                    href="/admin"
                    className="block px-4 py-2 text-sm text-parchment-200 hover:bg-white/[0.05]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin panel
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full px-4 py-2 text-left text-sm text-parchment-400 hover:bg-white/[0.05]"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
