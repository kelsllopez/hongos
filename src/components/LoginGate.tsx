"use client";

import { useState } from "react";

export function LoginGate({
  usersExist,
  onSuccess,
}: {
  usersExist: boolean;
  onSuccess: () => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!usersExist && password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Algo salió mal");
      return;
    }
    onSuccess();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 paper-texture"
      style={{ background: "var(--spore-cream)" }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm p-7 rounded-2xl shadow-lg flex flex-col gap-4"
        style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.12)" }}
      >
        <div className="text-center mb-2">
          <div className="text-4xl mb-2">🍄</div>
          <h1 className="font-display font-bold text-xl">
            {usersExist ? "Entrar a editar" : "Crea la cuenta principal"}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--humus)" }}>
            {usersExist
              ? "Esta zona es solo para administradoras del bosque."
              : "Es la primera vez que alguien entra aquí. La cuenta que crees ahora será la administradora principal del sitio."}
          </p>
        </div>

        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuario"
          required
          autoFocus
          autoCapitalize="off"
          autoCorrect="off"
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
          style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--spore-cream)" }}
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
          style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--spore-cream)" }}
        />

        {!usersExist && (
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repite la contraseña"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
            style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--spore-cream)" }}
          />
        )}

        {error && (
          <p className="text-sm" style={{ color: "var(--amanita)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          style={{ background: "var(--moss-dark)" }}
        >
          {loading ? "Un momento..." : usersExist ? "Entrar" : "Crear y entrar"}
        </button>

        {usersExist && (
          <p className="text-xs text-center" style={{ color: "var(--humus)" }}>
            Las cuentas nuevas solo las crea la administradora principal. Si necesitas
            acceso, pídeselo directamente a ella.
          </p>
        )}
      </form>
    </div>
  );
}
