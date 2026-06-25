import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { isAuthenticated } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const db = await getDB();

  const idx = db.mushrooms.findIndex((m) => m.id === id);
  if (idx === -1) {
    return NextResponse.json({ error: "Hongo no encontrado" }, { status: 404 });
  }

  db.mushrooms[idx] = { ...db.mushrooms[idx], ...body, id };
  await saveDB(db);

  return NextResponse.json({ mushroom: db.mushrooms[idx] });
}

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
  db.mushrooms = db.mushrooms.filter((m) => m.id !== id);
  db.blocks = db.blocks.filter((b) => b.mushroomId !== id);
  await saveDB(db);

  return NextResponse.json({ ok: true });
}
