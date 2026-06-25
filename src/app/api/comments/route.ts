import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB, generateId, Comment } from "@/lib/store";
import { isAuthenticated, getClientIp } from "@/lib/auth";
import { moderateComment } from "@/lib/moderation";
import { checkRateLimit } from "@/lib/rateLimit";
import { verifyCaptcha } from "@/lib/captcha";

export async function GET(req: NextRequest) {
  const db = await getDB();
  const authed = await isAuthenticated();
  const mushroomId = req.nextUrl.searchParams.get("mushroomId");

  let comments = db.comments;
  if (mushroomId) {
    comments = comments.filter((c) => c.mushroomId === mushroomId);
  }

  // Los visitantes normales solo ven los comentarios aprobados.
  // La dueña del sitio (autenticada) puede ver también los rechazados,
  // útil para revisar si el filtro se equivocó.
  if (!authed) {
    comments = comments.filter((c) => c.status === "approved");
  }

  comments = [...comments].sort((a, b) => b.createdAt - a.createdAt);

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const ip = await getClientIp();
  const rateCheck = await checkRateLimit(ip, "comment");
  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: `Estás comentando muy rápido. Espera ${rateCheck.retryAfterSeconds} segundos e intenta de nuevo.`,
      },
      { status: 429 }
    );
  }

  const body = await req.json();
  const { author, text, mushroomId, captchaToken, captchaAnswer } = body;

  if (!text || typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "El comentario está vacío" }, { status: 400 });
  }
  if (text.length > 1000) {
    return NextResponse.json({ error: "El comentario es muy largo" }, { status: 400 });
  }

  if (!captchaToken || !captchaAnswer || !(await verifyCaptcha(captchaToken, captchaAnswer))) {
    return NextResponse.json(
      { error: "La respuesta de verificación no es correcta. Intenta de nuevo." },
      { status: 400 }
    );
  }

  let moderation;
  try {
    moderation = await moderateComment(text);
  } catch (err) {
    console.error("Error moderando comentario:", err);
    // Si la IA falla (ej. caída de la API), dejamos el comentario en
    // estado pendiente para revisión manual, en vez de publicarlo a ciegas
    // o de romper la experiencia del visitante.
    moderation = { approved: false, reason: "Error técnico al verificar, en revisión" };
  }

  const db = await getDB();
  const comment: Comment = {
    id: generateId(),
    mushroomId: mushroomId || null,
    author: (author || "Anónimo").slice(0, 60),
    text: text.trim(),
    status: moderation.approved ? "approved" : "rejected",
    moderationReason: moderation.reason,
    createdAt: Date.now(),
  };

  db.comments.push(comment);
  await saveDB(db);

  if (!moderation.approved) {
    // No revelamos el motivo exacto al visitante para no darle un manual
    // de cómo "esquivar" el filtro la próxima vez.
    return NextResponse.json(
      {
        ok: false,
        message:
          "Tu comentario no pudo publicarse porque no cumple las normas de la comunidad.",
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ ok: true, comment });
}
