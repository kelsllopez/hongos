import { NextRequest, NextResponse } from "next/server";
import { getDB, saveDB, generateId } from "@/lib/store";
import {
  createSession,
  setSessionCookie,
  getClientIp,
  isIpBlocked,
  isUsernameBlocked,
  recordLoginAttempt,
  findUserByUsername,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return NextResponse.json({ error: "Faltan usuario o contraseña" }, { status: 400 });
  }

  const ip = await getClientIp();

  // 1. Si esta IP ya está bloqueada por intentos previos, ni siquiera
  //    comprobamos la contraseña: cortamos aquí.
  if (await isIpBlocked(ip)) {
    return NextResponse.json(
      {
        error:
          "Esta conexión fue bloqueada por demasiados intentos fallidos. Pide a la administradora que la desbloquee.",
      },
      { status: 429 }
    );
  }

  const db = await getDB();

  // 2. Primer uso absoluto del sitio: si no existe ningún usuario todavía,
  //    la primera persona en entrar crea la cuenta de superadministrador.
  if (db.users.length === 0) {
    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }
    const bcrypt = await import("bcryptjs");
    const user = {
      id: generateId(),
      username: username.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "superadmin" as const,
      createdAt: Date.now(),
      blocked: false,
    };
    db.users.push(user);
    await saveDB(db);
    await recordLoginAttempt(ip, username, true);
    const token = await createSession(user);
    await setSessionCookie(token);
    return NextResponse.json({ ok: true, created: true, role: user.role });
  }

  const user = await findUserByUsername(username);

  // 3. Cuenta bloqueada: avisamos claramente. La cuenta de superadministradora
  //    nunca se trata como bloqueada aquí, por seguridad extra: así, aunque
  //    algún dato quedara inconsistente, ella nunca pierde el acceso a su
  //    propio sitio (sigue dependiendo del bloqueo de IP, que sí le aplica).
  if (user && user.role !== "superadmin" && (await isUsernameBlocked(user.username))) {
    return NextResponse.json(
      {
        error:
          "Esta cuenta está bloqueada por seguridad. Pide a la administradora principal que la desbloquee.",
      },
      { status: 403 }
    );
  }

  const valid = user ? await verifyPassword(user, password) : false;

  if (!valid) {
    await recordLoginAttempt(ip, username, false);
    return NextResponse.json({ error: "Usuario o contraseña incorrectos" }, { status: 401 });
  }

  await recordLoginAttempt(ip, username, true);
  const token = await createSession(user!);
  await setSessionCookie(token);
  return NextResponse.json({ ok: true, created: false, role: user!.role });
}
