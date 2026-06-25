import Anthropic from "@anthropic-ai/sdk";
import { checkBannedWords } from "@/lib/bannedWords";

export type ModerationResult = {
  approved: boolean;
  reason: string;
};

/**
 * Modera un comentario. Si hay una ANTHROPIC_API_KEY configurada, usa Claude
 * para entender contexto e insultos disfrazados. Si no hay clave, usa un
 * filtro de palabras prohibidas local (gratis, sin internet, pero más simple:
 * no entiende contexto, solo detecta coincidencias de palabras conocidas).
 */
export async function moderateComment(text: string): Promise<ModerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    const wordCheck = checkBannedWords(text);
    if (!wordCheck.approved) {
      return {
        approved: false,
        reason:
          wordCheck.category === "negativo"
            ? "Comentario negativo sobre el sitio o los hongos (filtro básico, sin IA)"
            : "Contiene una palabra ofensiva (filtro básico, sin IA)",
      };
    }
    return {
      approved: true,
      reason: "Aprobado por el filtro básico de palabras (sin IA configurada)",
    };
  }

  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    system: `Eres un moderador de comentarios para el sitio web personal de una persona que comparte su afición por los hongos (micología). Esta persona es sensible a los comentarios negativos sobre su trabajo.
Tu única tarea es decidir si un comentario de un visitante debe PUBLICARSE o RECHAZARSE.

RECHAZA si el comentario contiene, de forma directa o disfrazada (variaciones ortográficas, espacios entre letras, símbolos en vez de letras, etc.):
- Insultos o lenguaje denigrante hacia la autora del sitio o hacia otras personas
- Discurso de odio (racismo, sexismo, homofobia, xenofobia, etc.)
- Amenazas o acoso
- Spam publicitario o enlaces sospechosos
- Contenido sexual no solicitado
- CUALQUIER opinión negativa sobre el sitio, su diseño o los hongos mostrados, aunque no sea un insulto (ej. "esto es feo", "no me gusta", "está aburrido", "esperaba algo mejor"). Esto incluye críticas formuladas de manera respetuosa.

APRUEBA todo lo demás, incluyendo:
- Elogios y comentarios positivos
- Preguntas sobre los hongos
- Comentarios neutros o informativos (ej. datos adicionales sobre una especie, sin juicio de valor)

Responde ÚNICAMENTE con un objeto JSON, sin texto adicional, sin markdown, con este formato exacto:
{"approved": true o false, "reason": "breve explicación en español de máximo 12 palabras"}`,
    messages: [
      {
        role: "user",
        content: `Comentario a evaluar:\n"""${text}"""`,
      },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  const raw = textBlock && "text" in textBlock ? textBlock.text : "";

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      approved: Boolean(parsed.approved),
      reason: String(parsed.reason || ""),
    };
  } catch {
    // Si Claude no devolvió JSON parseable, por seguridad dejamos el
    // comentario en revisión manual en vez de publicarlo a ciegas.
    return {
      approved: false,
      reason: "No se pudo verificar automáticamente, requiere revisión manual",
    };
  }
}
