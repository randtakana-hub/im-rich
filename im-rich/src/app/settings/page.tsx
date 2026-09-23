import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { SettingsContent } from "./SettingsContent";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <SettingsContent />
    </AppShell>
  );
}
