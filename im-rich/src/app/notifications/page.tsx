import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { NotificationsContent } from "./NotificationsContent";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <NotificationsContent />
    </AppShell>
  );
}
