import { NextRequest, NextResponse } from "next/server";
import { getDB } from "@/lib/store";
import { isSuperAdmin, createUser } from "@/lib/auth";

// Solo el superadministrador puede ver y crear cuentas. Esto evita que
// cualquier persona se "registre" sola: las cuentas solo las crea ella.
export async function GET() {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const db = await getDB();
  const users = db.users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    blocked: u.blocked,
    blockedAt: u.blockedAt,
    blockedReason: u.blockedReason,
  }));

  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { username, password, role } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: "Faltan usuario o contraseña" }, { status: 400 });
  }
  if (role !== "admin" && role !== "superadmin") {
    return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  }

  const result = await createUser(username, password, role);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    user: {
      id: result.user.id,
      username: result.user.username,
      role: result.user.role,
      createdAt: result.user.createdAt,
      blocked: false,
    },
  });
}
