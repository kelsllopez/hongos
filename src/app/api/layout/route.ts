import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  const db = await getDB();
  return NextResponse.json({ blocks: db.blocks, config: db.config });
}

export async function PUT(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const db = await getDB();

  if (Array.isArray(body.blocks)) {
    db.blocks = body.blocks;
  }
  if (body.config && typeof body.config === "object") {
    db.config = { ...db.config, ...body.config };
  }

  await saveDB(db);
  return NextResponse.json({ ok: true });
}
