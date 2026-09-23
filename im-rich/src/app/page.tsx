import Link from "next/link";
import { RCIcon, RCCoinHero } from "@/components/RCIcon";
import { ArrowUpRight, Users, Send, ShoppingBag, TrendingUp, Crown } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* ── Header ── */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <RCIcon size={28} />
          <span className="font-display text-lg tracking-tight">IM RICH</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-parchment-300 hover:text-parchment-100">
            Log in
          </Link>
          <Link href="/register" className="btn-gold px-4 py-2 text-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="bg-radial-glow absolute inset-x-0 top-0 -z-10 h-[600px]" />
        <div>
          <h1 className="font-display text-5xl leading-[1.08] tracking-tight text-parchment-100 md:text-6xl">
            Show your <span className="italic text-gold-400">wealth.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-parchment-300">
            Build your Rich Coin balance, connect with people, and show the world your digital wealth.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn-gold">
              Get Started
            </Link>
            <Link href="/login" className="btn-ghost">
              Explore Rich People
            </Link>
          </div>
          <p className="mt-6 text-xs text-parchment-500">
            Rich Coin (RC) is a virtual social currency — not cryptocurrency, not an investment, not real money.
          </p>
        </div>
        <div className="flex justify-center">
          <RCCoinHero size={300} />
        </div>
      </section>

      {/* ── What is Rich Coin ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="panel p-6">
            <h3 className="font-display text-xl text-parchment-100">What is Rich Coin?</h3>
            <p className="mt-3 text-sm text-parchment-400">
              Rich Coin is IM RICH's platform currency — a way to represent digital status and build a
              wealth profile people can see. It's social, not financial: RC can't be withdrawn or cashed
              out.
            </p>
          </div>
          <div className="panel p-6">
            <h3 className="font-display text-xl text-parchment-100">How it works</h3>
            <p className="mt-3 text-sm text-parchment-400">
              Buy RC, build your balance, and send it to friends. Every transfer is recorded and
              verified server-side, so your balance is always accurate.
            </p>
          </div>
          <div className="panel p-6">
            <h3 className="font-display text-xl text-parchment-100">Build your profile</h3>
            <p className="mt-3 text-sm text-parchment-400">
              A wealth card, a rank, a growing circle of friends — your profile is the scoreboard for
              your digital wealth.
            </p>
          </div>
        </div>
      </section>

      {/* ── Feature strip ── */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { icon: ShoppingBag, label: "Buy RC" },
            { icon: Send, label: "Send RC" },
            { icon: Users, label: "Add friends" },
            { icon: Crown, label: "Climb the Top Rich list" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="panel flex flex-col items-start gap-3 p-5">
              <div className="rounded-lg bg-gold-500/10 p-2">
                <Icon size={18} className="text-gold-400" />
              </div>
              <span className="text-sm text-parchment-200">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Wealth card showcase ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl text-parchment-100">Your digital wealth, on display.</h2>
            <p className="mt-4 max-w-md text-parchment-400">
              Every profile carries a wealth card showing your RC balance, your rank, and how far
              you've climbed. It's the first thing people see when they find you.
            </p>
          </div>
          <div className="panel-glow mx-auto w-full max-w-sm p-8 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-parchment-500">Rich Coin</p>
            <p className="mt-3 font-display text-5xl text-gold-300">1,250</p>
            <p className="mt-1 text-sm text-parchment-500">RC</p>
            <div className="mt-6 h-px bg-white/10" />
            <p className="mt-6 text-sm text-parchment-400">Digital Wealth</p>
          </div>
        </div>
      </section>

      {/* ── Top Rich preview ── */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-3xl text-parchment-100">Top Rich</h2>
          <Link href="/register" className="flex items-center gap-1 text-sm text-gold-400">
            See the full list <ArrowUpRight size={14} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { rank: 1, name: "Amara Solis", balance: 2450 },
            { rank: 2, name: "Deniz Okur", balance: 1980 },
            { rank: 3, name: "Priya Nair", balance: 1750 },
          ].map((p) => (
            <div key={p.rank} className="panel flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/10 font-display text-lg text-gold-400">
                #{p.rank}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-parchment-100">{p.name}</p>
                <p className="text-xs text-parchment-500">Rich Coin holder</p>
              </div>
              <p className="tabular font-display text-lg text-gold-300">{p.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-7xl px-6 py-24 text-center">
        <TrendingUp className="mx-auto mb-6 text-gold-500" size={28} />
        <h2 className="font-display text-4xl text-parchment-100">Ready to show your wealth?</h2>
        <p className="mt-3 text-parchment-400">Join IM RICH and start building your Rich Coin balance today.</p>
        <Link href="/register" className="btn-gold mt-8 inline-flex">
          Get Started
        </Link>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-parchment-500">
        Rich Coin (RC) is a virtual social currency for use within IM RICH only. It is not cryptocurrency,
        a security, an investment, or a bank balance, and cannot be redeemed for cash.
      </footer>
    </div>
  );
}
