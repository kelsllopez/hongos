import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { isSuperAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const allowed = await isSuperAdmin();
  if (!allowed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  let parsed;
  try {
    parsed = await req.json();
  } catch {
    return NextResponse.json({ error: "El archivo no es un JSON válido" }, { status: 400 });
  }

  if (!parsed || !Array.isArray(parsed.mushrooms) || !Array.isArray(parsed.comments)) {
    return NextResponse.json(
      { error: "El archivo no tiene el formato esperado de un backup de este sitio" },
      { status: 400 }
    );
  }

  // Conservamos las contraseñas y configuración de seguridad ACTUALES, ya
  // que el backup nunca las incluye (se omiten al exportar, por seguridad).
  // Solo restauramos el contenido del sitio: hongos, comentarios, diseño.
  const currentDB = await getDB();

  const restored = {
    ...currentDB,
    blocks: Array.isArray(parsed.blocks) ? parsed.blocks : currentDB.blocks,
    mushrooms: parsed.mushrooms,
    comments: parsed.comments,
    config: parsed.config || currentDB.config,
  };

  await saveDB(restored);

  return NextResponse.json({
    ok: true,
    restored: {
      mushrooms: restored.mushrooms.length,
      comments: restored.comments.length,
    },
  });
}
