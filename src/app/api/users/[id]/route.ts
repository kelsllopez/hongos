import { NextRequest, NextResponse } from "next/server";
import { isSuperAdmin, changePassword, unblockUser, deleteUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.action === "changePassword") {
    if (!body.newPassword) {
      return NextResponse.json({ error: "Falta la nueva contraseña" }, { status: 400 });
    }
    const result = await changePassword(id, body.newPassword);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (body.action === "unblock") {
    await unblockUser(id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Acción no reconocida" }, { status: 400 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  // deleteUser ya protege internamente al superadmin, sin importar quién
  // haga la petición -- doble seguro además del chequeo de arriba.
  const result = await deleteUser(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
