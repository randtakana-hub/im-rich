import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.isAdmin) {
    return { session: null, error: "Forbidden." as const };
  }
  return { session, error: null };
}
