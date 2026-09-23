import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { AdminContent } from "./AdminContent";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (!session.user.isAdmin) redirect("/dashboard");

  return (
    <AppShell>
      <AdminContent />
    </AppShell>
  );
}
