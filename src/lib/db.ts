import { createClient, type Client } from "@libsql/client";

// ---------------------------------------------------------------------------
// Conexión a Turso (base de datos SQLite en la nube, plan gratuito).
//
// Si no hay credenciales configuradas (TURSO_DATABASE_URL / TURSO_AUTH_TOKEN),
// usamos una base de datos SQLite local en archivo, para que el sitio siga
// funcionando perfectamente en desarrollo sin necesitar internet ni cuenta.
// En producción (Vercel), SIEMPRE debes configurar las credenciales de
// Turso, porque el sistema de archivos ahí no es permanente.
// ---------------------------------------------------------------------------

let client: Client | null = null;

export function getDbClient(): Client {
  if (client) return client;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (url && authToken) {
    client = createClient({ url, authToken });
  } else {
    // Fallback para desarrollo local: archivo SQLite en disco.
    client = createClient({ url: "file:./data/local.db" });
  }

  return client;
}
