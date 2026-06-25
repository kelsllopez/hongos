"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Mushroom } from "@/lib/types";
import { CommentsSection } from "@/components/CommentsSection";
import { PostGallery } from "@/components/PostGallery";
import { PostInfoTable } from "@/components/PostInfoTable";
import { PostAccordion } from "@/components/PostAccordion";
import { ShareButton } from "@/components/ShareButton";
import { DarkModeToggle } from "@/components/DarkModeToggle";

const EDIBLE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  comestible: { label: "Comestible", color: "var(--moss)", icon: "✅" },
  "no-comestible": { label: "No comestible", color: "var(--humus)", icon: "🚫" },
  toxico: { label: "Tóxico", color: "var(--amanita)", icon: "☠️" },
  desconocido: { label: "Sin clasificar", color: "#9a9182", icon: "❔" },
};

export default function MushroomPostPage() {
  const params = useParams();
  const id = params?.id as string;

  const [mushroom, setMushroom] = useState<Mushroom | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch("/api/mushrooms")
      .then((r) => r.json())
      .then((d) => {
        const found = (d.mushrooms || []).find((m: Mushroom) => m.id === id);
        if (!found) {
          setNotFound(true);
        } else {
          setMushroom(found);
          // Registramos la vista sin esperar la respuesta ni bloquear el render;
          // si falla (ej. sin conexión momentánea) no afecta la experiencia.
          fetch(`/api/mushrooms/${id}/view`, { method: "POST" }).catch(() => {});
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ color: "var(--moss)" }}>
        Cargando...
      </div>
    );
  }

  if (notFound || !mushroom) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🍄</span>
        <h1 className="font-display font-bold text-xl">No encontramos este hongo</h1>
        <p style={{ color: "var(--humus)" }}>Puede que se haya eliminado o que el enlace esté mal escrito.</p>
        <Link href="/" className="underline" style={{ color: "var(--moss-dark)" }}>
          Volver al bosque
        </Link>
      </div>
    );
  }

  const edible = EDIBLE_LABELS[mushroom.edible || "desconocido"];
  const hasSidebarContent = Boolean(
    mushroom.habitat || mushroom.season || (mushroom.infoTable && mushroom.infoTable.some((r) => r.label.trim() || r.value.trim()))
  );

  return (
    <div className="min-h-screen flex flex-col paper-texture" style={{ background: "var(--spore-cream)" }}>
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto w-full">
        <Link href="/" className="text-sm font-medium hover:underline" style={{ color: "var(--moss-dark)" }}>
          ← Volver al bosque
        </Link>
        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <ShareButton title={mushroom.name} />
          <Link
            href="/sobre-el-bosque"
            className="text-xs px-3 py-1.5 rounded-full font-medium opacity-70 hover:opacity-100 transition-opacity"
            style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
          >
            Sobre el bosque
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto w-full px-6 pb-16 flex-1">
        <article
          className={
            hasSidebarContent
              ? "grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-10"
              : "grid grid-cols-1 max-w-3xl mx-auto"
          }
        >
          {/* --- Columna principal: galería + descripción + acordeón --- */}
          <div>
            <div className="relative">
              <PostGallery
                images={mushroom.images && mushroom.images.length > 0 ? mushroom.images : mushroom.imageUrl ? [mushroom.imageUrl] : []}
                alt={mushroom.name}
              />
              <span
                className="absolute top-4 right-4 text-sm font-semibold px-3 py-1.5 rounded-full text-white shadow-sm flex items-center gap-1.5"
                style={{ background: edible.color }}
              >
                <span>{edible.icon}</span> {edible.label}
              </span>
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-4xl mb-1 mt-2" style={{ color: "var(--ink)" }}>
              {mushroom.name}
            </h1>
            {mushroom.scientificName && (
              <p className="italic text-lg mb-4" style={{ color: "var(--moss)" }}>
                {mushroom.scientificName}
              </p>
            )}

            {/* Chips solo en pantallas chicas; en grandes viven en la barra lateral */}
            <div className="flex flex-wrap gap-3 mb-6 text-sm lg:hidden">
              {mushroom.habitat && <InfoChip icon="🌲" text={mushroom.habitat} />}
              {mushroom.season && <InfoChip icon="🍂" text={mushroom.season} />}
            </div>

            <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "var(--ink)" }}>
              {mushroom.description}
            </p>

            <div className="lg:hidden mt-8">
              <PostInfoTable rows={mushroom.infoTable || []} />
            </div>

            <PostAccordion sections={mushroom.sections || []} />
          </div>

          {/* --- Barra lateral: chips + tabla, solo visible en pantallas grandes --- */}
          {hasSidebarContent && (
            <aside className="hidden lg:block h-fit lg:sticky lg:top-8">
              <div
                className="rounded-2xl p-5 flex flex-col gap-5"
                style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍄</span>
                  <h2 className="font-display font-semibold text-sm uppercase tracking-wide" style={{ color: "var(--moss)" }}>
                    Ficha del hongo
                  </h2>
                </div>

                {(mushroom.habitat || mushroom.season) && (
                  <div className="flex flex-col gap-2 text-sm">
                    {mushroom.habitat && (
                      <div className="flex items-center gap-2">
                        <span>🌲</span>
                        <span style={{ color: "var(--ink)" }}>{mushroom.habitat}</span>
                      </div>
                    )}
                    {mushroom.season && (
                      <div className="flex items-center gap-2">
                        <span>🍂</span>
                        <span style={{ color: "var(--ink)" }}>{mushroom.season}</span>
                      </div>
                    )}
                  </div>
                )}

                <PostInfoTable rows={mushroom.infoTable || []} embedded />
              </div>
            </aside>
          )}
        </article>

        <hr className="my-10" style={{ borderColor: "rgba(54,74,53,0.15)" }} />

        <div className="max-w-2xl">
          <CommentsSection mushroomId={mushroom.id} />
        </div>
      </main>

      <footer className="text-center text-xs py-6" style={{ color: "var(--humus)" }}>
        Hecho con cariño por una amante de los hongos 🍄
      </footer>
    </div>
  );
}

function InfoChip({ icon, text }: { icon: string; text: string }) {
  return (
    <span
      className="px-3 py-1.5 rounded-full flex items-center gap-1.5"
      style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)", color: "var(--humus)" }}
    >
      {icon} {text}
    </span>
  );
}
