// ---------------------------------------------------------------------------
// Filtro de palabras prohibidas (sin IA, gratis, funciona sin internet).
//
// Esta lista cubre insultos, groserías y lenguaje de odio comunes en español
// (incluyendo variantes chilenas/latinoamericanas). No es exhaustiva ni
// entiende contexto como lo haría una IA -- es un filtro de coincidencia de
// palabras, así que algunas cosas se le pueden escapar y otras vez puede
// marcar algo que en contexto era inofensivo. Si quieres algo más preciso,
// la alternativa es activar la moderación con IA configurando una
// ANTHROPIC_API_KEY en el archivo .env.local.
// ---------------------------------------------------------------------------

export const BANNED_WORDS: string[] = [
  // Insultos comunes
  "idiota",
  "imbecil",
  "estupido",
  "estupida",
  "tonto",
  "tonta",
  "pendejo",
  "pendeja",
  "huevon",
  "huevona",
  "weon",
  "wn",
  "ctm",
  "csm",
  "conchetumadre",
  "concha de tu madre",
  "maricon",
  "marica",
  "puto",
  "puta",
  "perra",
  "zorra",
  "imbecil",
  "subnormal",
  "retrasado",
  "retrasada",
  "mongolico",
  "basura",
  "asqueroso",
  "asquerosa",
  "patetico",
  "patetica",
  "inutil",
  "fracasado",
  "fracasada",
  "feo de mierda",
  "horrible de mierda",

  // Groserías / palabrotas
  "mierda",
  "mierdas",
  "cagada",
  "carajo",
  "joder",
  "verga",
  "pinga",
  "chinga",
  "chingada",
  "chingar",
  "culiao",
  "culiada",
  "culia",
  "cabron",
  "cabrona",

  // Odio / discriminación (palabras-raíz; detecta variantes)
  "negro de mierda",
  "indio de mierda",
  "muerete",
  "ojala te mueras",
  "te voy a matar",
  "te odio",

  // Sexual no solicitado / spam típico
  "sexo gratis",
  "webcam gratis",
  "haz clic aqui",
  "gana dinero facil",
  "compra ahora",
  "viagra",
];

/**
 * Palabras y frases NEGATIVAS sobre la página, el sitio o los hongos -- sin
 * ser insultos hacia una persona. Por defecto este filtro las bloquea
 * también, para proteger el ánimo de quien recibe los comentarios. Si en
 * algún momento quieres permitir crítica constructiva, basta con vaciar o
 * recortar esta lista; el resto del filtro (insultos, odio, spam) sigue
 * funcionando igual sin depender de esta lista.
 */
export const NEGATIVE_WORDS: string[] = [
  "feo",
  "fea",
  "horrible",
  "horrendo",
  "horrenda",
  "espantoso",
  "espantosa",
  "malo",
  "mala",
  "pesimo",
  "pesima",
  "no me gusta",
  "no me gusto",
  "que asco",
  "da asco",
  "aburrido",
  "aburrida",
  "feisimo",
  "feisima",
  "deficiente",
  "decepcionante",
  "no sirve",
  "no sirvio",
  "perdida de tiempo",
];

/**
 * Normaliza un texto para detectar intentos comunes de "disfrazar" palabras:
 * quita acentos, pasa a minúsculas, colapsa espacios/símbolos repetidos entre
 * letras, y reemplaza algunos números usados como letras (leetspeak básico).
 */
function normalize(text: string): string {
  let result = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos

  // leetspeak básico: 0->o, 1->i, 3->e, 4->a, 5->s, 7->t, @->a
  result = result
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a");

  // quita espacios, puntos, guiones y asteriscos ENTRE letras sueltas
  // (ej. "p u t o" o "p.u.t.o" -> "puto"), sin afectar palabras normales
  result = result.replace(/(\w)[\s.\-_*]+(?=\w)/g, "$1");

  return result;
}

export type WordFilterResult = {
  approved: boolean;
  matchedWord?: string;
  category?: "ofensivo" | "negativo";
};

export function checkBannedWords(text: string): WordFilterResult {
  const normalized = normalize(text);

  for (const word of BANNED_WORDS) {
    const normalizedWord = normalize(word);
    if (normalized.includes(normalizedWord)) {
      return { approved: false, matchedWord: word, category: "ofensivo" };
    }
  }

  for (const word of NEGATIVE_WORDS) {
    const normalizedWord = normalize(word);
    if (normalized.includes(normalizedWord)) {
      return { approved: false, matchedWord: word, category: "negativo" };
    }
  }

  return { approved: true };
}
