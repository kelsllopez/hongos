import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, getClientIp } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";

const MAX_SIZE = 4 * 1024 * 1024; // 4MB

// Firmas binarias ("magic bytes") de los formatos de imagen que aceptamos.
// Esto evita que alguien suba un archivo malicioso (ej. un script) solo
// cambiándole la extensión o el campo "Content-Type" declarado, ya que ambos
// se pueden falsear fácilmente desde el navegador o con herramientas como
// curl -- los primeros bytes reales del archivo son mucho más confiables.
const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] }, // "RIFF" (WebP usa RIFF container)
];

function detectRealImageType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) {
      return sig.mime;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const ip = await getClientIp();
  const rateCheck = await checkRateLimit(ip, "upload");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Estás subiendo imágenes muy rápido. Espera ${rateCheck.retryAfterSeconds} segundos.` },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió ningún archivo" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Solo se permiten imágenes" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "La imagen es muy grande (máx 4MB)" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Verificamos el contenido real del archivo, no solo lo que el navegador
  // dijo que era. Si los primeros bytes no corresponden a ningún formato de
  // imagen conocido, rechazamos -- sin importar qué extensión o
  // Content-Type haya declarado quien subió el archivo.
  const realType = detectRealImageType(buffer);
  if (!realType) {
    return NextResponse.json(
      { error: "El archivo no parece ser una imagen válida" },
      { status: 400 }
    );
  }

  // Guardamos como data URL en base64. Esto evita depender de un sistema de
  // archivos persistente, lo cual es importante porque en hosting serverless
  // (como Vercel) el filesystem no persiste entre despliegues.
  // Para un sitio con muchas imágenes pesadas conviene migrar esto a un
  // servicio de almacenamiento como Vercel Blob o Cloudinary.
  const base64 = buffer.toString("base64");
  const dataUrl = `data:${realType};base64,${base64}`;

  return NextResponse.json({ url: dataUrl });
}
