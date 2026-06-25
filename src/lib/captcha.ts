import crypto from "crypto";
import { getDB, saveDB } from "@/lib/store";

const SECRET = process.env.SESSION_SECRET || "cambia-este-secreto-en-produccion-por-favor";

export type CaptchaChallenge = {
  question: string;
  token: string; // codifica la respuesta correcta + expiración, firmado
};

function sign(payload: string): string {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

/**
 * Genera un acertijo matemático simple (ej. "3 + 5") junto con un token que
 * codifica la respuesta correcta y una expiración, firmado con HMAC. Esto
 * evita tener que guardar el estado del captcha en el servidor: el propio
 * token es la prueba de cuál era la pregunta y cuál la respuesta esperada,
 * sin que el visitante pueda alterarlo sin invalidar la firma.
 */
export function generateCaptcha(): CaptchaChallenge {
  const a = Math.floor(Math.random() * 8) + 1;
  const b = Math.floor(Math.random() * 8) + 1;
  const answer = a + b;
  const expires = Date.now() + 10 * 60 * 1000; // 10 minutos para responder

  const payload = `${answer}:${expires}`;
  const signature = sign(payload);
  const token = Buffer.from(`${payload}:${signature}`).toString("base64");

  return { question: `¿Cuánto es ${a} + ${b}?`, token };
}

/**
 * Verifica un token de captcha y la respuesta dada. Cada token solo puede
 * usarse una vez: aunque el token en sí sea válido y no haya expirado, si ya
 * se usó antes (registrado en usedCaptchaTokens) se rechaza. Esto evita que
 * alguien capture un solo desafío válido y lo reenvíe en bucle para saltarse
 * el captcha repetidamente.
 */
export async function verifyCaptcha(token: string, userAnswer: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [answerStr, expiresStr, signature] = decoded.split(":");
    const payload = `${answerStr}:${expiresStr}`;

    if (sign(payload) !== signature) return false; // token alterado o falso
    if (Date.now() > Number(expiresStr)) return false; // expirado
    if (Number(userAnswer.trim()) !== Number(answerStr)) return false; // respuesta incorrecta

    const db = await getDB();
    const now = Date.now();

    // Limpiamos tokens ya vencidos del registro para no inflar la base de datos.
    db.usedCaptchaTokens = (db.usedCaptchaTokens || []).filter((t) => t.expires > now);

    if (db.usedCaptchaTokens.some((t) => t.token === token)) {
      return false; // este token ya se usó antes
    }

    db.usedCaptchaTokens.push({ token, expires: Number(expiresStr) });
    await saveDB(db);

    return true;
  } catch {
    return false;
  }
}
