"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Comment, Mushroom } from "@/lib/types";
import { LoginGate } from "@/components/LoginGate";

export default function CommentsAdminPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [usersExist, setUsersExist] = useState(true);

  const [comments, setComments] = useState<Comment[]>([]);
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [filter, setFilter] = useState<"all" | "approved" | "rejected">("all");

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.authenticated);
        setUsersExist(d.usersExist);
        setCheckingAuth(false);
      });
  }, []);

  const loadData = useCallback(() => {
    Promise.all([
      fetch("/api/comments").then((r) => r.json()),
      fetch("/api/mushrooms").then((r) => r.json()),
    ]).then(([c, m]) => {
      setComments(c.comments || []);
      setMushrooms(m.mushrooms || []);
    });
  }, []);

  useEffect(() => {
    if (!authed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos tras autenticarse
    loadData();
  }, [authed, loadData]);

  const handleDelete = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    loadData();
  };

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!authed) return <LoginGate usersExist={usersExist} onSuccess={() => window.location.reload()} />;

  const filtered = comments.filter((c) => (filter === "all" ? true : c.status === filter));
  const mushroomName = (id: string | null) => mushrooms.find((m) => m.id === id)?.name || null;

  return (
    <div className="min-h-screen paper-texture" style={{ background: "var(--spore-cream)" }}>
      <header
        className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(54,74,53,0.15)", background: "var(--bone)" }}
      >
        <span className="font-display font-bold text-lg">💬 Comentarios</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/edit" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            ← Volver al editor
          </Link>
          <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            Ver sitio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8">
        <p className="mb-5" style={{ color: "var(--humus)" }}>
          Cada comentario que deja un visitante pasa primero por un filtro automático. Aquí puedes
          ver todo lo que se publicó y lo que fue bloqueado, en caso de que quieras revisar si el
          filtro se equivocó.
        </p>

        <div className="flex gap-2 mb-5">
          {[
            { key: "all", label: "Todos" },
            { key: "approved", label: "Publicados" },
            { key: "rejected", label: "Bloqueados" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className="px-3 py-1.5 rounded-full text-sm font-medium"
              style={{
                background: filter === f.key ? "var(--moss-dark)" : "var(--bone)",
                color: filter === f.key ? "white" : "var(--moss-dark)",
                border: "1px solid rgba(54,74,53,0.2)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-xl flex flex-col gap-1"
              style={{
                background: "var(--bone)",
                border: `1px solid ${c.status === "approved" ? "rgba(79,107,74,0.3)" : "rgba(184,57,42,0.3)"}`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <span>{c.author}</span>
                  {mushroomName(c.mushroomId) && (
                    <Link
                      href={`/hongo/${c.mushroomId}`}
                      target="_blank"
                      className="text-xs px-2 py-0.5 rounded-full hover:underline"
                      style={{ background: "rgba(54,74,53,0.08)", color: "var(--moss-dark)" }}
                    >
                      sobre {mushroomName(c.mushroomId)}
                    </Link>
                  )}
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: c.status === "approved" ? "rgba(79,107,74,0.15)" : "rgba(184,57,42,0.15)",
                      color: c.status === "approved" ? "var(--moss-dark)" : "var(--amanita)",
                    }}
                  >
                    {c.status === "approved" ? "Publicado" : "Bloqueado"}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-xs font-medium hover:underline"
                  style={{ color: "var(--amanita)" }}
                >
                  Eliminar
                </button>
              </div>
              <p className="text-sm" style={{ color: "var(--ink)" }}>{c.text}</p>
              {c.moderationReason && (
                <p className="text-xs italic" style={{ color: "var(--humus)" }}>
                  Motivo: {c.moderationReason}
                </p>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center py-10" style={{ color: "var(--humus)" }}>
            No hay comentarios en esta categoría todavía.
          </p>
        )}
      </main>
    </div>
  );
}
