import { NextResponse } from "next/server";
import { getDB } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export async function GET() {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const db = await getDB();

  // No incluimos passwordHash en el backup descargable: si alguien
  // intercepta el archivo, no debería poder usarlo para iniciar sesión.
  // El resto de los datos (hongos, comentarios, diseño) sí se incluye
  // completo para poder restaurar el sitio si algo sale mal.
  const safeCopy = {
    ...db,
    users: db.users.map((u) => ({ ...u, passwordHash: "[omitido en el backup]" })),
  };

  const json = JSON.stringify(safeCopy, null, 2);
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="backup-hongos-${date}.json"`,
    },
  });
}
