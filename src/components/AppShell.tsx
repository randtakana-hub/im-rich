import { Navbar } from "@/components/Navbar";
import { MobileNav } from "@/components/MobileNav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-6 md:pb-12 md:pt-8">{children}</main>
      <MobileNav />
    </div>
  );
}
