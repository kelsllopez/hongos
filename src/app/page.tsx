"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mushroom, Comment, SiteConfig } from "@/lib/types";
import { PostCard } from "@/components/PostCard";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { FloatingSpores } from "@/components/FloatingSpores";
import { SortSelector, SortOption } from "@/components/SortSelector";
import { DarkModeToggle } from "@/components/DarkModeToggle";

type EdibleFilter = Mushroom["edible"] | "todos";

export default function FeedPage() {
  const router = useRouter();
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EdibleFilter>("todos");
  const [sort, setSort] = useState<SortOption>("recientes");

  useEffect(() => {
    Promise.all([
      fetch("/api/mushrooms").then((r) => r.json()),
      fetch("/api/comments").then((r) => r.json()),
      fetch("/api/layout").then((r) => r.json()),
    ]).then(([m, c, l]) => {
      setMushrooms(m.mushrooms || []);
      setComments(c.comments || []);
      setConfig(l.config);
      setLoading(false);
    });
  }, []);

  const commentCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of comments) {
      if (c.mushroomId) map[c.mushroomId] = (map[c.mushroomId] || 0) + 1;
    }
    return map;
  }, [comments]);

  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { todos: mushrooms.length };
    for (const m of mushrooms) {
      const key = m.edible || "desconocido";
      map[key] = (map[key] || 0) + 1;
    }
    return map;
  }, [mushrooms]);

  const filtered = useMemo(() => {
    let result = [...mushrooms];

    if (sort === "nombre") {
      result.sort((a, b) => a.name.localeCompare(b.name, "es"));
    } else if (sort === "comentados") {
      result.sort((a, b) => (commentCounts[b.id] || 0) - (commentCounts[a.id] || 0));
    } else {
      result.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (category !== "todos") {
      result = result.filter((m) => (m.edible || "desconocido") === category);
    }

    if (query.trim()) {
      const normalize = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""); // quita acentos para que "nisc" encuentre "níscalo"
      const q = normalize(query.trim());
      result = result.filter(
        (m) =>
          normalize(m.name).includes(q) ||
          (m.scientificName && normalize(m.scientificName).includes(q))
      );
    }

    return result;
  }, [mushrooms, query, category, sort, commentCounts]);

  const handleRandom = () => {
    if (mushrooms.length === 0) return;
    const pick = mushrooms[Math.floor(Math.random() * mushrooms.length)];
    router.push(`/hongo/${pick.id}`);
  };

  const feedBackgroundStyle: React.CSSProperties = config?.feedBackgroundImage
    ? {
        backgroundImage: `url(${config.feedBackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : { background: config?.feedBackgroundColor || "var(--spore-cream)" };

  return (
    <div className="min-h-screen flex flex-col paper-texture" style={feedBackgroundStyle}>
      <header className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <span className="font-display font-bold text-lg">
          🍄 {config?.siteName || "El Bosque de Mis Hongos"}
        </span>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="/sobre-el-bosque"
            className="text-xs px-3 py-1.5 rounded-full font-medium opacity-70 hover:opacity-100 transition-opacity"
            style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
          >
            Sobre el bosque
          </Link>
          <Link
            href="/edit"
            className="text-xs px-3 py-1.5 rounded-full font-medium opacity-60 hover:opacity-100 transition-opacity"
            style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
          >
            Editar
          </Link>
        </div>
      </header>

      <main className="relative flex-1 max-w-5xl mx-auto w-full px-6 pb-16">
        <FloatingSpores count={8} />

        <div className="relative z-10 flex flex-col items-center text-center gap-4 py-8">
          <h1 className="font-display font-bold text-3xl sm:text-4xl" style={{ color: "var(--ink)" }}>
            Cada hongo, su propia historia
          </h1>
          <p className="max-w-md" style={{ color: "var(--humus)" }}>
            Explora la colección, lee sobre cada hongo y deja tu comentario en el que más te guste.
          </p>
          <div className="w-full max-w-md mt-2">
            <SearchBar
              value={query}
              onChange={setQuery}
              resultCount={query ? filtered.length : undefined}
            />
          </div>
          <CategoryFilter value={category} onChange={setCategory} counts={categoryCounts} />

          {mushrooms.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <SortSelector value={sort} onChange={setSort} />
              <button
                onClick={handleRandom}
                className="text-sm px-3.5 py-1.5 rounded-full font-medium flex items-center gap-1.5"
                style={{ background: "var(--terracotta)", color: "white" }}
              >
                🎲 Sorpréndeme
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16" style={{ color: "var(--moss)" }}>
            Cargando el bosque...
          </div>
        ) : mushrooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-5xl">🍄</span>
            <h2 className="font-display font-bold text-xl">Este bosque todavía está creciendo</h2>
            <p style={{ color: "var(--humus)" }}>Pronto habrá hongos por aquí.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-4xl">🔍</span>
            <p style={{ color: "var(--humus)" }}>No encontramos ningún hongo con esos filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {filtered.map((m) => (
              <PostCard key={m.id} mushroom={m} commentCount={commentCounts[m.id] || 0} />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center text-xs py-6" style={{ color: "var(--humus)" }}>
        Hecho con cariño por una amante de los hongos 🍄
      </footer>
    </div>
  );
}
