import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB, generateId, Mushroom } from "@/lib/store";
import { isAuthenticated, getClientIp } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET() {
  const db = await getDB();
  return NextResponse.json({ mushrooms: db.mushrooms });
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = await getClientIp();
  const rateCheck = await checkRateLimit(ip, "create-post");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Demasiadas publicaciones en poco tiempo. Espera ${rateCheck.retryAfterSeconds} segundos.` },
      { status: 429 }
    );
  }

  const body = await req.json();
  const db = await getDB();

  const mushroom: Mushroom = {
    id: generateId(),
    name: body.name || "Hongo sin nombre",
    scientificName: body.scientificName || "",
    description: body.description || "",
    imageUrl: body.imageUrl || "",
    images: Array.isArray(body.images) ? body.images : [],
    edible: body.edible || "desconocido",
    habitat: body.habitat || "",
    season: body.season || "",
    infoTable: Array.isArray(body.infoTable) ? body.infoTable : [],
    sections: Array.isArray(body.sections) ? body.sections : [],
    createdAt: Date.now(),
  };

  db.mushrooms.push(mushroom);
  await saveDB(db);

  return NextResponse.json({ mushroom });
}
