import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const db = await getDB();
  db.comments = db.comments.filter((c) => c.id !== id);
  await saveDB(db);

  return NextResponse.json({ ok: true });
}
