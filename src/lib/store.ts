import { getDbClient } from "@/lib/db";

// ---------------------------------------------------------------------------
// Almacenamiento en base de datos SQL (Turso/libSQL, o SQLite local en
// desarrollo). Se mantiene la misma interfaz pública que antes (getDB /
// saveDB trabajando sobre un objeto "DB" completo), para no tener que
// reescribir cada ruta de la API uno por uno -- solo se vuelven async.
//
// Internamente, cada colección vive en su propia tabla, guardando cada fila
// como una columna JSON. Esto es más simple que mapear cada campo a una
// columna SQL individual, y es suficientemente eficiente para el volumen de
// datos de un sitio personal/familiar.
// ---------------------------------------------------------------------------

export type ShapeKind = "circle" | "square" | "triangle" | "blob" | "star" | "heart" | "hexagon" | "diamond" | "ring" | "arch";

export type IconName =
  | "mushroom"
  | "leaf"
  | "sun"
  | "raindrop"
  | "star"
  | "moon"
  | "cloud"
  | "tree"
  | "acorn"
  | "butterfly"
  | "snail"
  | "flower"
  | "bee"
  | "frog"
  | "magnifier"
  | "book"
  | "mug"
  | "heart-deco";

export type Block = {
  id: string;
  type: "title" | "text" | "image" | "mushroom-card" | "shape" | "icon";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  // estilo libre
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
  // contenido específico según el tipo
  content?: string; // texto libre / título
  imageUrl?: string;
  mushroomId?: string; // referencia a un hongo, si type === "mushroom-card"
  shapeKind?: ShapeKind;
  iconName?: IconName;
};

export type InfoTableRow = {
  id: string;
  label: string;
  value: string;
};

export type AccordionSection = {
  id: string;
  title: string;
  content: string;
};

export type Mushroom = {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  imageUrl?: string;
  images?: string[];
  edible?: "comestible" | "no-comestible" | "toxico" | "desconocido";
  habitat?: string;
  season?: string;
  infoTable?: InfoTableRow[];
  sections?: AccordionSection[];
  createdAt: number;
  viewCount?: number;
};

export type Comment = {
  id: string;
  mushroomId: string | null; // null = comentario general del sitio
  author: string;
  text: string;
  status: "approved" | "rejected" | "pending";
  moderationReason?: string;
  createdAt: number;
};

export type SiteConfig = {
  siteName: string;
  backgroundColor: string;
  backgroundImage?: string;
  feedBackgroundColor?: string;
  feedBackgroundImage?: string;
  fontFamily: string;
};

export type Role = "superadmin" | "admin";

export type User = {
  id: string;
  username: string; // único, en minúsculas para comparar
  passwordHash: string;
  role: Role;
  createdAt: number;
  // Bloqueo de la CUENTA (no de la IP) tras demasiados intentos fallidos.
  // Solo el superadmin puede desbloquear.
  blocked: boolean;
  blockedAt?: number;
  blockedReason?: string;
};

export type LoginAttempt = {
  ip: string;
  username: string;
  success: boolean;
  createdAt: number;
};

export type IpBlock = {
  ip: string;
  blockedAt: number;
  reason: string;
  attemptedUsernames: string[];
};

export type RateLimitEntry = {
  ip: string;
  action: string;
  timestamp: number;
};

export type UsedCaptchaToken = {
  token: string;
  expires: number;
};

export type DB = {
  blocks: Block[];
  mushrooms: Mushroom[];
  comments: Comment[];
  config: SiteConfig;
  users: User[];
  loginAttempts: LoginAttempt[];
  ipBlocks: IpBlock[];
  rateLimitLog: RateLimitEntry[];
  usedCaptchaTokens: UsedCaptchaToken[];
};

const defaultConfig: SiteConfig = {
  siteName: "El Bosque de Mis Hongos",
  backgroundColor: "",
  fontFamily: "serif",
};

const defaultDB: DB = {
  blocks: [],
  mushrooms: [],
  comments: [],
  config: defaultConfig,
  users: [],
  loginAttempts: [],
  ipBlocks: [],
  rateLimitLog: [],
  usedCaptchaTokens: [],
};

let schemaReady: Promise<void> | null = null;

/**
 * Crea las tablas si no existen todavía. Se ejecuta una sola vez por
 * instancia del servidor (la promesa se reutiliza en llamadas siguientes).
 */
function ensureSchema(): Promise<void> {
  if (schemaReady) return schemaReady;

  schemaReady = (async () => {
    const db = getDbClient();
    await db.batch(
      [
        `CREATE TABLE IF NOT EXISTS kv_collections (
          name TEXT PRIMARY KEY,
          data TEXT NOT NULL
        )`,
      ],
      "write"
    );
  })();

  return schemaReady;
}

// Cada "colección" del antiguo documento JSON se guarda como una fila en
// kv_collections, identificada por su nombre, con todo su contenido como
// JSON. Es el equivalente de tener un archivo por colección, pero en SQL.
const COLLECTIONS = [
  "blocks",
  "mushrooms",
  "comments",
  "config",
  "users",
  "loginAttempts",
  "ipBlocks",
  "rateLimitLog",
  "usedCaptchaTokens",
] as const;

export async function getDB(): Promise<DB> {
  await ensureSchema();
  const db = getDbClient();

  const result = await db.execute("SELECT name, data FROM kv_collections");
  const stored: Record<string, unknown> = {};
  for (const row of result.rows) {
    const name = row.name as string;
    try {
      stored[name] = JSON.parse(row.data as string);
    } catch {
      // si una fila quedó corrupta, la ignoramos y usamos el default
    }
  }

  return {
    blocks: Array.isArray(stored.blocks) ? (stored.blocks as Block[]) : defaultDB.blocks,
    mushrooms: Array.isArray(stored.mushrooms) ? (stored.mushrooms as Mushroom[]) : defaultDB.mushrooms,
    comments: Array.isArray(stored.comments) ? (stored.comments as Comment[]) : defaultDB.comments,
    config: stored.config ? { ...defaultConfig, ...(stored.config as SiteConfig) } : defaultConfig,
    users: Array.isArray(stored.users) ? (stored.users as User[]) : defaultDB.users,
    loginAttempts: Array.isArray(stored.loginAttempts) ? (stored.loginAttempts as LoginAttempt[]) : [],
    ipBlocks: Array.isArray(stored.ipBlocks) ? (stored.ipBlocks as IpBlock[]) : [],
    rateLimitLog: Array.isArray(stored.rateLimitLog) ? (stored.rateLimitLog as RateLimitEntry[]) : [],
    usedCaptchaTokens: Array.isArray(stored.usedCaptchaTokens)
      ? (stored.usedCaptchaTokens as UsedCaptchaToken[])
      : [],
  };
}

export async function saveDB(dbObject: DB): Promise<void> {
  await ensureSchema();
  const db = getDbClient();

  const statements = COLLECTIONS.map((name) => ({
    sql: `INSERT INTO kv_collections (name, data) VALUES (?, ?)
          ON CONFLICT(name) DO UPDATE SET data = excluded.data`,
    args: [name, JSON.stringify(dbObject[name])],
  }));

  await db.batch(statements, "write");
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
