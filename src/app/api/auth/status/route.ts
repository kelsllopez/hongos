import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDB } from "@/lib/store";

export async function GET() {
  const session = await getSession();
  const db = await getDB();
  return NextResponse.json({
    authenticated: Boolean(session),
    role: session?.role || null,
    username: session?.username || null,
    usersExist: db.users.length > 0,
  });
}
