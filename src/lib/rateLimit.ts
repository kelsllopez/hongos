import { getDB, saveDB } from "@/lib/store";

// ---------------------------------------------------------------------------
// Rate limiting genérico por IP y por "acción" (ej. "comment", "create-post").
// Reutiliza el mismo archivo de datos que el resto del sitio, así que no
// necesita ninguna infraestructura extra (Redis, etc.) -- suficiente para
// un sitio personal/familiar de tráfico bajo-medio.
// ---------------------------------------------------------------------------

type RateLimitConfig = {
  /** Cuántas acciones se permiten dentro de la ventana de tiempo */
  maxRequests: number;
  /** Duración de la ventana, en milisegundos */
  windowMs: number;
};

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  comment: { maxRequests: 6, windowMs: 60 * 1000 }, // 6 comentarios por minuto
  "create-post": { maxRequests: 20, windowMs: 60 * 1000 }, // 20 hongos por minuto (ya requiere sesión, pero por si una sesión se compromete)
  upload: { maxRequests: 30, windowMs: 60 * 1000 }, // 30 subidas de imagen por minuto
  view: { maxRequests: 60, windowMs: 60 * 1000 }, // 60 vistas registradas por minuto (navegación normal no llega ni cerca)
  default: { maxRequests: 30, windowMs: 60 * 1000 },
};

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

/**
 * Verifica y registra un intento de acción para una IP. Si supera el límite
 * configurado para esa acción, devuelve allowed: false y cuántos segundos
 * faltan para poder reintentar.
 */
export async function checkRateLimit(ip: string, action: string): Promise<RateLimitResult> {
  const config = DEFAULT_LIMITS[action] || DEFAULT_LIMITS.default;
  const db = await getDB();
  const now = Date.now();

  // Limpiamos entradas viejas de cualquier acción para no inflar la base de
  // datos indefinidamente.
  db.rateLimitLog = (db.rateLimitLog || []).filter(
    (entry) => now - entry.timestamp < 10 * 60 * 1000 // conservamos 10 min de historial
  );

  const recent = db.rateLimitLog.filter(
    (entry) => entry.ip === ip && entry.action === action && now - entry.timestamp < config.windowMs
  );

  if (recent.length >= config.maxRequests) {
    const oldest = Math.min(...recent.map((e) => e.timestamp));
    const retryAfterSeconds = Math.ceil((oldest + config.windowMs - now) / 1000);
    await saveDB(db); // persistimos igual la limpieza de entradas viejas
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  db.rateLimitLog.push({ ip, action, timestamp: now });
  await saveDB(db);
  return { allowed: true };
}
