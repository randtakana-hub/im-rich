import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getLeaderboard, getUserRank } from "@/lib/rank";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [leaderboard, yourRank] = await Promise.all([
    getLeaderboard(50),
    getUserRank(session.user.id),
  ]);

  return NextResponse.json({ leaderboard, yourRank });
}
