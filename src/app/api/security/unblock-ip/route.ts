import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, unblockIp } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { ip } = await req.json();
  if (!ip) {
    return NextResponse.json({ error: "Falta la IP" }, { status: 400 });
  }

  await unblockIp(ip);
  return NextResponse.json({ ok: true });
}
