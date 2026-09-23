import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { BuyRCContent } from "./BuyRCContent";

export default async function BuyRCPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <BuyRCContent />
    </AppShell>
  );
}
