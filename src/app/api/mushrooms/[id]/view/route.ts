import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB } from "@/lib/store";
import { getClientIp } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = await getClientIp();
  const rateCheck = await checkRateLimit(ip, "view");
  if (!rateCheck.allowed) {
    // Las vistas son una métrica de bajo riesgo: si se excede el límite,
    // simplemente no contamos esta vista en vez de mostrar un error al
    // visitante (no tiene sentido interrumpir su navegación por esto).
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { id } = await params;
  const db = await getDB();

  const mushroom = db.mushrooms.find((m) => m.id === id);
  if (!mushroom) {
    return NextResponse.json({ error: "Hongo no encontrado" }, { status: 404 });
  }

  mushroom.viewCount = (mushroom.viewCount || 0) + 1;
  await saveDB(db);

  return NextResponse.json({ ok: true, viewCount: mushroom.viewCount });
}
