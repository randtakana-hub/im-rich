"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Home, Compass, Trophy, Wallet, UserRound } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/leaderboard", label: "Top", icon: Trophy },
  { href: "/wallet", label: "Wallet", icon: Wallet },
];

export function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  if (!session) return null;

  const profileHref = `/profile/${session.user.username}`;
  const allLinks = [...links, { href: profileHref, label: "Profile", icon: UserRound }];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.06] bg-ink-950/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-between px-2 py-2">
        {allLinks.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 text-[11px]"
            >
              <Icon size={20} className={active ? "text-gold-400" : "text-parchment-500"} strokeWidth={active ? 2.4 : 1.8} />
              <span className={active ? "text-gold-400" : "text-parchment-500"}>{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
