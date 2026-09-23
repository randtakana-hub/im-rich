import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { Sparkles } from "lucide-react";

export default async function RichStorePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-500/10">
          <Sparkles className="text-gold-400" size={28} />
        </div>
        <h1 className="font-display text-3xl text-parchment-100">Rich Store</h1>
        <p className="mt-2 rounded-full border border-gold-500/25 bg-gold-500/5 px-4 py-1 text-xs uppercase tracking-widest text-gold-300">
          Coming Soon
        </p>
        <p className="mt-6 max-w-md text-parchment-400">
          Spend your Rich Coins on exclusive digital items and experiences.
        </p>
      </div>
    </AppShell>
  );
}
