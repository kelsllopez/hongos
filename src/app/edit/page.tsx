"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Block, Mushroom, SiteConfig } from "@/lib/types";
import { DraggableBlock } from "@/components/DraggableBlock";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Toolbar } from "@/components/Toolbar";
import { LoginGate } from "@/components/LoginGate";
import { BackgroundPicker } from "@/components/BackgroundPicker";

function generateId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export default function EditPage() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [usersExist, setUsersExist] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [mushrooms, setMushrooms] = useState<Mushroom[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAppearance, setShowAppearance] = useState(false);

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

  const loadData = useCallback(async () => {
    setLoading(true);
    const [layoutData, mushroomData] = await Promise.all([
      fetch("/api/layout").then((r) => r.json()),
      fetch("/api/mushrooms").then((r) => r.json()),
    ]);
    setBlocks(layoutData.blocks || []);
    setConfig(layoutData.config);
    setMushrooms(mushroomData.mushrooms || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authed) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial de datos tras autenticarse, patrón intencional
    loadData();
  }, [authed, loadData]);

  const updateBlock = (id: string, updates: Partial<Block>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    setSaved(false);
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: generateId(),
      type: type as Block["type"],
      x: 120,
      y: 120,
      width: type === "title" ? 320 : type === "shape" || type === "icon" ? 100 : 240,
      height:
        type === "title"
          ? 70
          : type === "shape" || type === "icon"
          ? 100
          : type === "mushroom-card"
          ? 280
          : 150,
      rotation: 0,
      zIndex: blocks.length + 1,
      content: type === "title" ? "Nuevo título" : type === "text" ? "Escribe algo..." : undefined,
      fontSize: type === "title" ? 32 : 16,
      fontFamily: "display",
      bgColor: type === "shape" ? "#b5562f" : type === "icon" ? undefined : "#fdfbf4",
      borderRadius: type === "shape" ? 9999 : 12,
      shapeKind: type === "shape" ? "circle" : undefined,
      iconName: type === "icon" ? "mushroom" : undefined,
    };
    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);
    setSaved(false);
  };

  const deleteBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setSelectedId(null);
    setSaved(false);
  };

  const handleUploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error al subir la imagen");
      return "";
    }
    return data.url;
  };

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/layout", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blocks, config }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!authed) {
    return (
      <LoginGate
        usersExist={usersExist}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    );
  }

  const selectedBlock = blocks.find((b) => b.id === selectedId) || null;

  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--spore-cream)" }}>
      <header
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(54,74,53,0.15)", background: "var(--bone)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg">🍄 Modo edición</span>
          {config && (
            <input
              value={config.siteName}
              onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
              className="text-sm px-2 py-1 rounded border bg-transparent"
              style={{ borderColor: "rgba(54,74,53,0.2)" }}
            />
          )}
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setShowAppearance(true)}
            className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium"
            style={{ color: "var(--moss-dark)" }}
          >
            🎨 Apariencia
          </button>
          <Link href="/edit/mushrooms" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            🍄 Mis hongos
          </Link>
          <Link href="/edit/comments" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            💬 Comentarios
          </Link>
          <Link href="/edit/stats" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            📊 Estadísticas
          </Link>
          {role === "superadmin" && (
            <Link href="/edit/security" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
              🔒 Seguridad
            </Link>
          )}
          <Link href="/" className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium" style={{ color: "var(--moss-dark)" }}>
            Ver sitio
          </Link>
          <button
            onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => setAuthed(false))}
            className="px-3 py-1.5 rounded-lg hover:bg-black/5 font-medium"
            style={{ color: "var(--amanita)" }}
          >
            Salir
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          className="flex-1 relative overflow-auto canvas-grid"
          onPointerDown={() => setSelectedId(null)}
        >
          {loading ? (
            <div className="p-10 text-center" style={{ color: "var(--moss)" }}>
              Cargando tu lienzo...
            </div>
          ) : (
            <div className="relative" style={{ width: 2400, height: 1600 }}>
              {blocks.length === 0 && (
                <div
                  className="absolute top-10 left-10 text-sm max-w-xs p-4 rounded-xl"
                  style={{ background: "rgba(54,74,53,0.06)", color: "var(--moss-dark)" }}
                >
                  Tu lienzo está vacío. Usa la barra de abajo para agregar títulos, texto, imágenes o
                  tarjetas de tus hongos, y luego arrástralos donde quieras.
                </div>
              )}
              {blocks.map((b) => (
                <DraggableBlock
                  key={b.id}
                  block={b}
                  mushroom={mushrooms.find((m) => m.id === b.mushroomId)}
                  selected={selectedId === b.id}
                  onSelect={() => setSelectedId(b.id)}
                  onChange={(updates) => updateBlock(b.id, updates)}
                />
              ))}
            </div>
          )}
        </div>

        {selectedBlock && (
          <PropertiesPanel
            block={selectedBlock}
            mushrooms={mushrooms}
            onChange={(updates) => updateBlock(selectedBlock.id, updates)}
            onDelete={() => deleteBlock(selectedBlock.id)}
            onUploadImage={handleUploadImage}
            onClose={() => setSelectedId(null)}
          />
        )}
      </div>

      <Toolbar onAdd={addBlock} onSave={handleSave} saving={saving} saved={saved} />

      {showAppearance && config && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(43,38,32,0.5)" }}
          onClick={() => setShowAppearance(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md p-6 rounded-2xl flex flex-col gap-6 max-h-[85vh] overflow-y-auto"
            style={{ background: "var(--bone)" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg">🎨 Apariencia del sitio</h2>
              <button
                onClick={() => setShowAppearance(false)}
                className="text-sm px-2 py-1 rounded hover:bg-black/5"
                style={{ color: "var(--moss)" }}
              >
                Cerrar
              </button>
            </div>

            <BackgroundPicker
              label="Fondo de la portada (donde se ven todos los hongos)"
              color={config.feedBackgroundColor || "#f4efe2"}
              imageUrl={config.feedBackgroundImage}
              onColorChange={(c) => setConfig({ ...config, feedBackgroundColor: c })}
              onImageChange={(url) => setConfig({ ...config, feedBackgroundImage: url })}
              onUpload={handleUploadImage}
            />

            <hr style={{ borderColor: "rgba(54,74,53,0.12)" }} />

            <BackgroundPicker
              label="Fondo de 'Sobre el bosque'"
              color={config.backgroundColor || "#f4efe2"}
              imageUrl={config.backgroundImage}
              onColorChange={(c) => setConfig({ ...config, backgroundColor: c })}
              onImageChange={(url) => setConfig({ ...config, backgroundImage: url })}
              onUpload={handleUploadImage}
            />

            <button
              onClick={async () => {
                await handleSave();
                setShowAppearance(false);
              }}
              className="rounded-lg py-2.5 text-sm font-semibold text-white"
              style={{ background: "var(--moss-dark)" }}
            >
              Guardar apariencia
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
