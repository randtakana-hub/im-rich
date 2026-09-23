import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProfileContent } from "./ProfileContent";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <AppShell>
      <ProfileContent username={params.username} />
    </AppShell>
  );
}
