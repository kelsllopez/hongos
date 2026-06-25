import { NextResponse } from "next/server";
import { getDB } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export async function GET() {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const db = await getDB();

  const blockedUsers = db.users
    .filter((u) => u.blocked)
    .map((u) => ({
      id: u.id,
      username: u.username,
      role: u.role,
      blockedAt: u.blockedAt,
      blockedReason: u.blockedReason,
    }));

  const ipBlocks = [...db.ipBlocks].sort((a, b) => b.blockedAt - a.blockedAt);

  const recentAttempts = [...db.loginAttempts]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 50);

  return NextResponse.json({ blockedUsers, ipBlocks, recentAttempts });
}
