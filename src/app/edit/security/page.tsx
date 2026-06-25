"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { LoginGate } from "@/components/LoginGate";

type UserRow = {
  id: string;
  username: string;
  role: "superadmin" | "admin";
  createdAt: number;
  blocked: boolean;
  blockedAt?: number;
  blockedReason?: string;
};

type IpBlockRow = {
  ip: string;
  blockedAt: number;
  reason: string;
  attemptedUsernames: string[];
};

type AttemptRow = {
  ip: string;
  username: string;
  success: boolean;
  createdAt: number;
};

function formatDate(ts?: number) {
  if (!ts) return "";
  return new Date(ts).toLocaleString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SecurityPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [usersExist, setUsersExist] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [ipBlocks, setIpBlocks] = useState<IpBlockRow[]>([]);
  const [attempts, setAttempts] = useState<AttemptRow[]>([]);

  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "superadmin">("admin");
  const [createError, setCreateError] = useState("");
  const [creating, setCreating] = useState(false);

  const [passwordEdits, setPasswordEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authenticated);
        setUsersExist(d.usersExist);
        setRole(d.role);
        setCheckingAuth(false);
      });
  }, []);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/security").then((r) => r.json()),
    ]).then(([u, s]) => {
      setUsers(u.users || []);
      setIpBlocks(s.ipBlocks || []);
      setAttempts(s.recentAttempts || []);
    });
  }, []);

  useEffect(() => {
    if (role !== "superadmin") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos del panel
    loadData();
  }, [role, loadData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    if (!newUsername.trim() || !newPassword) return;
    setCreating(true);
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: newUsername, password: newPassword, role: newRole }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setCreateError(data.error || "No se pudo crear la cuenta");
      return;
    }
    setNewUsername("");
    setNewPassword("");
    setNewRole("admin");
    loadData();
  };

  const handleChangePassword = async (userId: string) => {
    const pwd = passwordEdits[userId];
    if (!pwd || pwd.length < 6) {
      alert("La contraseña nueva debe tener al menos 6 caracteres");
      return;
    }
    const res = await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "changePassword", newPassword: pwd }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo cambiar la contraseña");
      return;
    }
    setPasswordEdits((prev) => ({ ...prev, [userId]: "" }));
    alert("Contraseña actualizada");
  };

  const handleUnblockUser = async (userId: string) => {
    await fetch(`/api/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unblock" }),
    });
    loadData();
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`¿Eliminar la cuenta de "${username}"? No podrá iniciar sesión nunca más.`)) return;
    const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "No se pudo eliminar");
      return;
    }
    loadData();
  };

  const handleUnblockIp = async (ip: string) => {
    await fetch("/api/security/unblock-ip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip }),
    });
    loadData();
  };

  const [restoring, setRestoring] = useState(false);
  const [restoreMessage, setRestoreMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleDownloadBackup = () => {
    window.open("/api/backup", "_blank");
  };

  const handleRestoreFile = async (file: File) => {
    setRestoring(true);
    setRestoreMessage(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch("/api/backup/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        setRestoreMessage({ type: "error", text: data.error || "No se pudo restaurar" });
      } else {
        setRestoreMessage({
          type: "ok",
          text: `Restaurado: ${data.restored.mushrooms} hongos, ${data.restored.comments} comentarios.`,
        });
        loadData();
      }
    } catch {
      setRestoreMessage({ type: "error", text: "El archivo no es un backup válido" });
    }
    setRestoring(false);
  };

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!authed) return <LoginGate usersExist={usersExist} onSuccess={() => window.location.reload()} />;

  if (role !== "superadmin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <span className="text-4xl">🔒</span>
        <h1 className="font-display font-bold text-xl">Esta sección es privada</h1>
        <p style={{ color: "var(--humus)" }}>
          Solo la administradora principal puede ver la configuración de seguridad.
        </p>
        <Link href="/edit" className="mt-2 underline" style={{ color: "var(--moss-dark)" }}>
          Volver al editor
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen paper-texture" style={{ background: "var(--spore-cream)" }}>
      <header
        className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(54,74,53,0.15)", background: "var(--bone)" }}
      >
        <span className="font-display font-bold text-lg">🔒 Seguridad y usuarios</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/edit" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            ← Volver al editor
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-10">
        {/* --- Crear nueva cuenta --- */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Crear nueva cuenta</h2>
          <p className="text-sm mb-3" style={{ color: "var(--humus)" }}>
            Nadie puede registrarse por su cuenta. Solo tú puedes crear cuentas nuevas desde aquí.
          </p>
          <form
            onSubmit={handleCreateUser}
            className="p-4 rounded-xl flex flex-col gap-3"
            style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
          >
            <div className="grid grid-cols-2 gap-3">
              <input
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Nombre de usuario"
                className="input"
                required
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Contraseña (mín. 6 caracteres)"
                type="text"
                className="input"
                required
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm flex items-center gap-2">
                <input
                  type="radio"
                  checked={newRole === "admin"}
                  onChange={() => setNewRole("admin")}
                />
                Administradora
              </label>
              <label className="text-sm flex items-center gap-2">
                <input
                  type="radio"
                  checked={newRole === "superadmin"}
                  onChange={() => setNewRole("superadmin")}
                />
                Superadministradora
              </label>
            </div>
            {createError && <p className="text-sm" style={{ color: "var(--amanita)" }}>{createError}</p>}
            <button
              type="submit"
              disabled={creating}
              className="self-start px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--moss-dark)" }}
            >
              {creating ? "Creando..." : "Crear cuenta"}
            </button>
          </form>
        </section>

        {/* --- Lista de cuentas --- */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Cuentas</h2>
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl flex flex-col gap-2"
                style={{
                  background: "var(--bone)",
                  border: `1px solid ${u.blocked ? "rgba(184,57,42,0.4)" : "rgba(54,74,53,0.15)"}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{u.username}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{
                        background: u.role === "superadmin" ? "rgba(181,86,47,0.15)" : "rgba(54,74,53,0.1)",
                        color: u.role === "superadmin" ? "var(--terracotta)" : "var(--moss-dark)",
                      }}
                    >
                      {u.role === "superadmin" ? "Superadministradora" : "Administradora"}
                    </span>
                    {u.blocked && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(184,57,42,0.15)", color: "var(--amanita)" }}
                      >
                        Bloqueada
                      </span>
                    )}
                  </div>
                  {u.role !== "superadmin" && (
                    <button
                      onClick={() => handleDeleteUser(u.id, u.username)}
                      className="text-xs font-medium hover:underline"
                      style={{ color: "var(--amanita)" }}
                    >
                      Eliminar cuenta
                    </button>
                  )}
                </div>

                {u.blocked && (
                  <div className="flex items-center justify-between text-xs" style={{ color: "var(--humus)" }}>
                    <span>
                      {u.blockedReason} — {formatDate(u.blockedAt)}
                    </span>
                    <button
                      onClick={() => handleUnblockUser(u.id)}
                      className="px-2 py-1 rounded-lg font-semibold text-white"
                      style={{ background: "var(--moss-dark)" }}
                    >
                      Desbloquear
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Nueva contraseña"
                    value={passwordEdits[u.id] || ""}
                    onChange={(e) =>
                      setPasswordEdits((prev) => ({ ...prev, [u.id]: e.target.value }))
                    }
                    className="input flex-1"
                  />
                  <button
                    onClick={() => handleChangePassword(u.id)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg whitespace-nowrap"
                    style={{ border: "1px solid rgba(54,74,53,0.25)" }}
                  >
                    Cambiar contraseña
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- Respaldos --- */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Respaldo de datos</h2>
          <p className="text-sm mb-3" style={{ color: "var(--humus)" }}>
            Descarga una copia de todos tus hongos, comentarios y diseño. Guárdala en un lugar
            seguro (tu computadora, Google Drive, etc.) por si algo le pasa al sitio. El backup
            nunca incluye contraseñas.
          </p>
          <div
            className="p-4 rounded-xl flex flex-col gap-4"
            style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
          >
            <button
              onClick={handleDownloadBackup}
              className="self-start px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "var(--moss-dark)" }}
            >
              ⬇️ Descargar respaldo ahora
            </button>

            <hr style={{ borderColor: "rgba(54,74,53,0.12)" }} />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
                Restaurar desde un respaldo
              </p>
              <p className="text-xs" style={{ color: "var(--humus)" }}>
                ⚠️ Esto reemplaza todos los hongos y comentarios actuales por los del archivo que
                subas. Tus cuentas y contraseñas no se ven afectadas.
              </p>
              <input
                type="file"
                accept="application/json"
                disabled={restoring}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && confirm("¿Seguro? Esto reemplazará los hongos y comentarios actuales.")) {
                    handleRestoreFile(file);
                  }
                  e.target.value = "";
                }}
                className="text-sm"
              />
              {restoreMessage && (
                <p
                  className="text-sm"
                  style={{ color: restoreMessage.type === "ok" ? "var(--moss-dark)" : "var(--amanita)" }}
                >
                  {restoreMessage.text}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* --- IPs bloqueadas --- */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Conexiones bloqueadas</h2>
          <p className="text-sm mb-3" style={{ color: "var(--humus)" }}>
            Tras 3 intentos fallidos de inicio de sesión desde la misma conexión, se bloquea
            automáticamente esa conexión y la cuenta involucrada.
          </p>
          {ipBlocks.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--humus)" }}>
              No hay conexiones bloqueadas en este momento.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {ipBlocks.map((b) => (
                <div
                  key={b.ip}
                  className="p-3 rounded-xl flex items-center justify-between text-sm"
                  style={{ background: "var(--bone)", border: "1px solid rgba(184,57,42,0.3)" }}
                >
                  <div>
                    <p className="font-mono font-semibold">{b.ip}</p>
                    <p style={{ color: "var(--humus)" }}>
                      {b.reason} — {formatDate(b.blockedAt)}
                    </p>
                    <p className="text-xs" style={{ color: "var(--humus)" }}>
                      Usuarios probados: {b.attemptedUsernames.join(", ")}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblockIp(b.ip)}
                    className="px-3 py-1.5 rounded-lg font-semibold text-white text-xs whitespace-nowrap"
                    style={{ background: "var(--moss-dark)" }}
                  >
                    Desbloquear
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* --- Historial reciente --- */}
        <section>
          <h2 className="font-display font-semibold text-lg mb-3">Actividad reciente de inicio de sesión</h2>
          <div className="flex flex-col gap-1 text-sm max-h-80 overflow-y-auto">
            {attempts.map((a, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                style={{ background: a.success ? "rgba(79,107,74,0.07)" : "rgba(184,57,42,0.07)" }}
              >
                <span>
                  <strong>{a.username}</strong> desde <span className="font-mono">{a.ip}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span style={{ color: a.success ? "var(--moss-dark)" : "var(--amanita)" }}>
                    {a.success ? "Éxito" : "Fallido"}
                  </span>
                  <span style={{ color: "var(--humus)" }}>{formatDate(a.createdAt)}</span>
                </span>
              </div>
            ))}
            {attempts.length === 0 && (
              <p style={{ color: "var(--humus)" }}>Sin actividad registrada todavía.</p>
            )}
          </div>
        </section>
      </main>

      <style jsx global>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(54, 74, 53, 0.25);
          background: var(--spore-cream);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
}
