"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Mushroom, Comment } from "@/lib/types";
import { LoginGate } from "@/components/LoginGate";

export default function StatsPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [usersExist, setUsersExist] = useState(true);

  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

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
      fetch("/api/mushrooms").then((r) => r.json()),
      fetch("/api/comments").then((r) => r.json()),
    ]).then(([m, c]) => {
      setMushrooms(m.mushrooms || []);
      setComments(c.comments || []);
    });
  }, []);

  useEffect(() => {
    if (!authed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial tras autenticarse
    loadData();
  }, [authed, loadData]);

  if (checkingAuth) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!authed) return <LoginGate usersExist={usersExist} onSuccess={() => window.location.reload()} />;

  const commentCounts: Record<string, number> = {};
  for (const c of comments) {
    if (c.mushroomId) commentCounts[c.mushroomId] = (commentCounts[c.mushroomId] || 0) + 1;
  }

  const totalViews = mushrooms.reduce((sum, m) => sum + (m.viewCount || 0), 0);
  const totalComments = comments.filter((c) => c.status === "approved").length;
  const totalRejected = comments.filter((c) => c.status === "rejected").length;

  const sortedByViews = [...mushrooms].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
  const sortedByComments = [...mushrooms].sort(
    (a, b) => (commentCounts[b.id] || 0) - (commentCounts[a.id] || 0)
  );

  return (
    <div className="min-h-screen paper-texture" style={{ background: "var(--spore-cream)" }}>
      <header
        className="flex items-center justify-between px-5 py-3 border-b sticky top-0 z-10"
        style={{ borderColor: "rgba(54,74,53,0.15)", background: "var(--bone)" }}
      >
        <span className="font-display font-bold text-lg">📊 Estadísticas</span>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/edit" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            ← Volver al editor
          </Link>
          <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            Ver sitio
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-8 flex flex-col gap-10">
        <section className="grid grid-cols-3 gap-4">
          <StatCard icon="🍄" label="Hongos" value={mushrooms.length} />
          <StatCard icon="👀" label="Visitas totales" value={totalViews} />
          <StatCard icon="💬" label="Comentarios publicados" value={totalComments} />
        </section>

        {totalRejected > 0 && (
          <p className="text-sm text-center" style={{ color: "var(--humus)" }}>
            Además, se bloquearon {totalRejected} comentarios por el filtro. Puedes revisarlos en{" "}
            <Link href="/edit/comments" className="underline" style={{ color: "var(--moss-dark)" }}>
              Comentarios
            </Link>
            .
          </p>
        )}

        <section>
          <h2 className="font-display font-semibold text-lg mb-3">🏆 Más vistos</h2>
          <div className="flex flex-col gap-2">
            {sortedByViews.slice(0, 10).map((m, i) => (
              <RankRow key={m.id} rank={i + 1} name={m.name} value={m.viewCount || 0} unit="visitas" id={m.id} />
            ))}
            {mushrooms.length === 0 && (
              <p className="text-sm" style={{ color: "var(--humus)" }}>Todavía no hay hongos.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg mb-3">💬 Más comentados</h2>
          <div className="flex flex-col gap-2">
            {sortedByComments.slice(0, 10).map((m, i) => (
              <RankRow
                key={m.id}
                rank={i + 1}
                name={m.name}
                value={commentCounts[m.id] || 0}
                unit="comentarios"
                id={m.id}
              />
            ))}
            {mushrooms.length === 0 && (
              <p className="text-sm" style={{ color: "var(--humus)" }}>Todavía no hay hongos.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col items-center gap-1 text-center"
      style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
    >
      <span className="text-2xl">{icon}</span>
      <span className="font-display font-bold text-2xl" style={{ color: "var(--ink)" }}>
        {value}
      </span>
      <span className="text-xs" style={{ color: "var(--humus)" }}>
        {label}
      </span>
    </div>
  );
}

function RankRow({
  rank,
  name,
  value,
  unit,
  id,
}: {
  rank: number;
  name: string;
  value: number;
  unit: string;
  id: string;
}) {
  return (
    <Link
      href={`/hongo/${id}`}
      target="_blank"
      className="flex items-center justify-between px-4 py-2.5 rounded-xl hover:bg-black/5"
      style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.1)" }}
    >
      <span className="flex items-center gap-3">
        <span className="text-sm font-semibold w-5" style={{ color: "var(--moss)" }}>
          {rank}
        </span>
        <span style={{ color: "var(--ink)" }}>{name}</span>
      </span>
      <span className="text-sm" style={{ color: "var(--humus)" }}>
        {value} {unit}
      </span>
    </Link>
  );
}
