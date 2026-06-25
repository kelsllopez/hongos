"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Block, Mushroom, SiteConfig } from "@/lib/types";
import { BlockContent } from "@/components/BlockContent";
import { FloatingSpores } from "@/components/FloatingSpores";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function AboutPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [canvasSize, setCanvasSize] = useState({ width: 2400, height: 1600 });

  useEffect(() => {
    Promise.all([
      fetch("/api/layout").then((r) => r.json()),
      fetch("/api/mushrooms").then((r) => r.json()),
    ]).then(([layoutData, mushroomData]) => {
      const blocks: Block[] = layoutData.blocks || [];
      setBlocks(blocks);
      setConfig(layoutData.config);
      setMushrooms(mushroomData.mushrooms || []);

      const maxX = Math.max(800, ...blocks.map((b) => b.x + b.width + 80));
      const maxY = Math.max(900, ...blocks.map((b) => b.y + b.height + 80));
      setCanvasSize({ width: maxX, height: maxY });
      setLoading(false);
    });
  }, []);

  const aboutBackgroundStyle: React.CSSProperties = config?.backgroundImage
    ? {
        backgroundImage: `url(${config.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }
    : config?.backgroundColor
    ? { background: config.backgroundColor }
    : { background: "var(--spore-cream)" };

  return (
    <div className="min-h-screen flex flex-col paper-texture" style={aboutBackgroundStyle}>
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display font-bold text-lg hover:opacity-80 transition-opacity">
          🍄 {config?.siteName || "El Bosque de Mis Hongos"}
        </Link>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <Link
            href="/"
            className="text-xs px-3 py-1.5 rounded-full font-medium hover:opacity-100 transition-opacity"
            style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
          >
            ← Ver todos los hongos
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

      <main className="relative flex-1">
        <FloatingSpores />
        {loading ? (
          <div className="p-16 text-center" style={{ color: "var(--moss)" }}>
            Cargando...
          </div>
        ) : blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-3">
            <span className="text-5xl">🍄</span>
            <h1 className="font-display font-bold text-2xl">Esta página todavía está creciendo</h1>
            <p style={{ color: "var(--humus)" }}>
              Aquí irá la historia detrás de esta colección. Vuelve más tarde.
            </p>
          </div>
        ) : (
          <div className="relative mx-auto" style={{ width: canvasSize.width, height: canvasSize.height }}>
            {blocks.map((b) => (
              <div
                key={b.id}
                className="absolute"
                style={{
                  left: b.x,
                  top: b.y,
                  width: b.width,
                  height: b.height,
                  zIndex: b.zIndex,
                  transform: `rotate(${b.rotation || 0}deg)`,
                }}
              >
                <BlockContent block={b} mushroom={mushrooms.find((m) => m.id === b.mushroomId)} />
              </div>
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
