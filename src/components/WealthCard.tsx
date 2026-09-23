import { RCIcon } from "@/components/RCIcon";

export function WealthCard({ balance }: { balance: number }) {
  return (
    <div className="panel-glow relative overflow-hidden p-8 text-center">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="mb-4 flex justify-center">
        <RCIcon size={44} />
      </div>
      <p className="text-xs uppercase tracking-[0.25em] text-parchment-500">Rich Coin</p>
      <p className="mt-3 font-display text-5xl text-gold-300">{balance.toLocaleString()}</p>
      <p className="mt-1 text-sm text-parchment-500">RC</p>
      <div className="mx-auto mt-6 h-px w-16 bg-gold-500/30" />
      <p className="mt-6 text-sm text-parchment-400">Digital Wealth</p>
    </div>
  );
}
