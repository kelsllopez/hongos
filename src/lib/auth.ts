import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import bcrypt from "bcryptjs";
import { getDB, saveDB, generateId, User, Role } from "@/lib/store";
import { sendSecurityAlert } from "@/lib/notifications";

const COOKIE_NAME = "hongos_session";
const SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "cambia-este-secreto-en-produccion-por-favor"
);

const MAX_ATTEMPTS = 3;
// Ventana de tiempo en la que contamos los intentos fallidos antes de bloquear.
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutos

type SessionPayload = {
  userId: string;
  username: string;
  role: Role;
};

// ---------------------------------------------------------------------------
// Sesión (cookie firmada)
// ---------------------------------------------------------------------------

export async function createSession(user: User): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    role: user.role,
  } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(SECRET);
  return token;
}

export async function setSessionCookie(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function isSuperAdmin(): Promise<boolean> {
  const session = await getSession();
  return session?.role === "superadmin";
}

export async function requireAuth(): Promise<SessionPayload | null> {
  return getSession();
}

// ---------------------------------------------------------------------------
// Dirección IP del visitante
// ---------------------------------------------------------------------------

export async function getClientIp(): Promise<string> {
  const h = await headers();
  // Vercel y la mayoría de proxies usan x-forwarded-for; el primer valor es
  // la IP original del visitante.
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "desconocida";
}

// ---------------------------------------------------------------------------
// Intentos de login, bloqueo por IP y por cuenta
// ---------------------------------------------------------------------------

export async function isIpBlocked(ip: string): Promise<boolean> {
  const db = await getDB();
  return db.ipBlocks.some((b) => b.ip === ip);
}

export async function isUsernameBlocked(username: string): Promise<boolean> {
  const db = await getDB();
  const user = db.users.find((u) => u.username === username.toLowerCase());
  return Boolean(user?.blocked);
}

/**
 * Registra un intento de login (exitoso o fallido) y, si corresponde,
 * aplica el bloqueo por IP y/o por cuenta tras demasiados fallos.
 */
export async function recordLoginAttempt(ip: string, username: string, success: boolean): Promise<void> {
  const db = await getDB();
  const now = Date.now();
  const normalizedUsername = username.toLowerCase();

  db.loginAttempts.push({ ip, username: normalizedUsername, success, createdAt: now });

  // Solo conservamos un historial razonable para no inflar la base de datos.
  if (db.loginAttempts.length > 2000) {
    db.loginAttempts = db.loginAttempts.slice(-2000);
  }

  if (success) {
    await saveDB(db);
    return;
  }

  // Contamos los intentos fallidos RECIENTES desde esa misma IP,
  // sin importar qué usuario hayan probado.
  const recentFailuresFromIp = db.loginAttempts.filter(
    (a) => a.ip === ip && !a.success && now - a.createdAt <= ATTEMPT_WINDOW_MS
  );

  if (recentFailuresFromIp.length >= MAX_ATTEMPTS && !db.ipBlocks.some((b) => b.ip === ip)) {
    const attemptedUsernames = Array.from(new Set(recentFailuresFromIp.map((a) => a.username)));
    db.ipBlocks.push({
      ip,
      blockedAt: now,
      reason: `${recentFailuresFromIp.length} intentos fallidos en los últimos 15 minutos`,
      attemptedUsernames,
    });

    // También marcamos como bloqueada cualquier cuenta real que haya
    // recibido intentos fallidos desde esta IP -- EXCEPTO la cuenta de
    // superadministradora, que nunca queda bloqueada a nivel de cuenta.
    // Así, aunque alguien intente atacar también el usuario "kels", la
    // superadministradora siempre puede entrar desde otra conexión y
    // desbloquear la IP, en vez de quedar atrapada fuera de su propio sitio.
    for (const uname of attemptedUsernames) {
      const user = db.users.find((u) => u.username === uname);
      if (user && user.role !== "superadmin" && !user.blocked) {
        user.blocked = true;
        user.blockedAt = now;
        user.blockedReason = `Bloqueada automáticamente tras intentos fallidos desde la IP ${ip}`;
      }
    }

    // Aviso por correo, sin bloquear este flujo ni hacerlo fallar si el
    // envío tiene problemas (la función ya maneja sus propios errores).
    void sendSecurityAlert(
      "Se bloqueó una conexión sospechosa",
      `Se bloqueó la IP ${ip} tras ${recentFailuresFromIp.length} intentos fallidos de inicio de sesión.\nUsuarios que se intentaron usar: ${attemptedUsernames.join(", ")}.\nPuedes revisar y desbloquear desde /edit/security.`
    );
  }

  await saveDB(db);
}

export async function unblockIp(ip: string): Promise<void> {
  const db = await getDB();
  db.ipBlocks = db.ipBlocks.filter((b) => b.ip !== ip);
  // Al desbloquear, también "perdonamos" los intentos fallidos previos de
  // esa IP. Si no hiciéramos esto, un solo intento fallido más volvería a
  // sumar al conteo viejo y re-bloquearía la IP casi de inmediato.
  db.loginAttempts = db.loginAttempts.filter((a) => !(a.ip === ip && !a.success));
  await saveDB(db);
}

export async function unblockUser(userId: string): Promise<void> {
  const db = await getDB();
  const user = db.users.find((u) => u.id === userId);
  if (user) {
    user.blocked = false;
    user.blockedAt = undefined;
    user.blockedReason = undefined;
  }
  await saveDB(db);
}

// ---------------------------------------------------------------------------
// Gestión de usuarios
// ---------------------------------------------------------------------------

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = await getDB();
  return db.users.find((u) => u.username === username.toLowerCase());
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.passwordHash);
}

export async function createUser(
  username: string,
  password: string,
  role: Role
): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const db = await getDB();
  const normalized = username.toLowerCase().trim();

  if (!normalized || normalized.length < 3) {
    return { ok: false, error: "El usuario debe tener al menos 3 caracteres" };
  }
  if (db.users.some((u) => u.username === normalized)) {
    return { ok: false, error: "Ese nombre de usuario ya existe" };
  }
  if (password.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const user: User = {
    id: generateId(),
    username: normalized,
    passwordHash: await bcrypt.hash(password, 10),
    role,
    createdAt: Date.now(),
    blocked: false,
  };

  db.users.push(user);
  await saveDB(db);
  return { ok: true, user };
}

export async function changePassword(
  userId: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (newPassword.length < 6) {
    return { ok: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }
  const db = await getDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: "Usuario no encontrado" };
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await saveDB(db);
  return { ok: true };
}

/**
 * Elimina un usuario. El superadmin nunca puede ser eliminado, sea quien
 * sea quien lo intente -- esta protección vive a nivel de función, no solo
 * de interfaz, para que ninguna ruta pueda saltársela.
 */
export async function deleteUser(userId: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const db = await getDB();
  const user = db.users.find((u) => u.id === userId);
  if (!user) return { ok: false, error: "Usuario no encontrado" };
  if (user.role === "superadmin") {
    return { ok: false, error: "No se puede eliminar a la administradora principal" };
  }
  db.users = db.users.filter((u) => u.id !== userId);
  await saveDB(db);
  return { ok: true };
}
