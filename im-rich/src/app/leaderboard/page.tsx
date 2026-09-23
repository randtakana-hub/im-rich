import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { LeaderboardContent } from "./LeaderboardContent";

export default async function LeaderboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <LeaderboardContent />
    </AppShell>
  );
}
