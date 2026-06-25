"use client";

import { useRef } from "react";
import { Block, Mushroom, ShapeKind, IconName } from "@/lib/types";
import { StickerIcon, ICON_NAMES, ICON_LABELS } from "@/components/icons/StickerIcon";
import { ShapeRenderer } from "@/components/ShapeRenderer";

const SHAPE_KINDS: { kind: ShapeKind; label: string }[] = [
  { kind: "circle", label: "Círculo" },
  { kind: "square", label: "Cuadrado" },
  { kind: "triangle", label: "Triángulo" },
  { kind: "blob", label: "Mancha" },
  { kind: "star", label: "Estrella" },
  { kind: "heart", label: "Corazón" },
  { kind: "hexagon", label: "Hexágono" },
  { kind: "diamond", label: "Rombo" },
  { kind: "ring", label: "Anillo" },
  { kind: "arch", label: "Arco" },
];

const COLOR_SWATCHES = [
  "#fdfbf4", // hueso
  "#f4efe2", // crema espora
  "#e8dcc4", // arena
  "#b5562f", // terracota
  "#b8392a", // amanita
  "#4f6b4a", // musgo
  "#364a35", // musgo oscuro
  "#5c4632", // humus
  "#2b2620", // tinta
  "#ffffff",
];

export function PropertiesPanel({
  block,
  mushrooms,
  onChange,
  onDelete,
  onUploadImage,
  onClose,
}: {
  block: Block;
  mushrooms: Mushroom[];
  onChange: (updates: Partial<Block>) => void;
  onDelete: () => void;
  onUploadImage: (file: File) => Promise<string>;
  onClose: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-72 shrink-0 border-l h-full overflow-y-auto p-4 flex flex-col gap-5"
      style={{ background: "var(--bone)", borderColor: "rgba(54,74,53,0.15)" }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Editar bloque</h3>
        <button
          onClick={onClose}
          className="text-sm px-2 py-1 rounded hover:bg-black/5"
          style={{ color: "var(--moss)" }}
        >
          Cerrar
        </button>
      </div>

      {(block.type === "title" || block.type === "text") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Contenido
          </label>
          <textarea
            value={block.content || ""}
            onChange={(e) => onChange({ content: e.target.value })}
            rows={block.type === "title" ? 2 : 5}
            className="w-full rounded-lg border p-2 text-sm resize-none"
            style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--spore-cream)" }}
          />
        </div>
      )}

      {block.type === "shape" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Tipo de forma
          </label>
          <div className="grid grid-cols-4 gap-2">
            {SHAPE_KINDS.map((s) => (
              <button
                key={s.kind}
                onClick={() => onChange({ shapeKind: s.kind })}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border"
                style={{
                  borderColor: block.shapeKind === s.kind ? "var(--terracotta)" : "rgba(54,74,53,0.2)",
                  background: block.shapeKind === s.kind ? "rgba(181,86,47,0.08)" : "transparent",
                }}
                title={s.label}
              >
                <div className="w-7 h-7">
                  <ShapeRenderer kind={s.kind} color={block.bgColor || "var(--terracotta)"} borderRadius={block.borderRadius} />
                </div>
                <span className="text-[10px]" style={{ color: "var(--humus)" }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
          <label className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: "var(--moss)" }}>
            Color de la forma
          </label>
          <SwatchPicker value={block.bgColor || "#b5562f"} onChange={(c) => onChange({ bgColor: c })} />
        </div>
      )}

      {block.type === "icon" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Elige un sticker
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ICON_NAMES.map((name) => (
              <button
                key={name}
                onClick={() => onChange({ iconName: name })}
                className="flex flex-col items-center gap-1 p-2 rounded-lg border"
                style={{
                  borderColor: block.iconName === name ? "var(--terracotta)" : "rgba(54,74,53,0.2)",
                  background: block.iconName === name ? "rgba(181,86,47,0.08)" : "transparent",
                }}
                title={ICON_LABELS[name]}
              >
                <div className="w-7 h-7">
                  <StickerIcon name={name} color={block.bgColor} />
                </div>
              </button>
            ))}
          </div>
          <label className="text-xs font-semibold uppercase tracking-wide mt-2" style={{ color: "var(--moss)" }}>
            Color del sticker
          </label>
          <SwatchPicker value={block.bgColor || "#b5562f"} onChange={(c) => onChange({ bgColor: c })} />
        </div>
      )}

      {block.type === "mushroom-card" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Hongo mostrado
          </label>
          <select
            value={block.mushroomId || ""}
            onChange={(e) => onChange({ mushroomId: e.target.value })}
            className="w-full rounded-lg border p-2 text-sm"
            style={{ borderColor: "rgba(54,74,53,0.25)", background: "var(--spore-cream)" }}
          >
            <option value="">— elige un hongo —</option>
            {mushrooms.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {mushrooms.length === 0 && (
            <p className="text-xs" style={{ color: "var(--humus)" }}>
              Todavía no has agregado ningún hongo. Ve a &ldquo;Mis hongos&rdquo; para crear uno.
            </p>
          )}
        </div>
      )}

      {block.type === "image" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Imagen
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = await onUploadImage(file);
              onChange({ imageUrl: url });
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-black/5"
            style={{ borderColor: "rgba(54,74,53,0.25)" }}
          >
            Subir imagen
          </button>
        </div>
      )}

      {(block.type === "title" || block.type === "text") && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
              Tamaño de letra ({block.fontSize || 16}px)
            </label>
            <input
              type="range"
              min={10}
              max={96}
              value={block.fontSize || 16}
              onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
              Tipografía
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onChange({ fontFamily: "display" })}
                className="flex-1 rounded-lg border px-2 py-1.5 text-sm font-display"
                style={{
                  borderColor: block.fontFamily === "display" ? "var(--terracotta)" : "rgba(54,74,53,0.25)",
                  background: block.fontFamily === "display" ? "rgba(181,86,47,0.08)" : "transparent",
                }}
              >
                Elegante
              </button>
              <button
                onClick={() => onChange({ fontFamily: "body" })}
                className="flex-1 rounded-lg border px-2 py-1.5 text-sm"
                style={{
                  borderColor: block.fontFamily === "body" ? "var(--terracotta)" : "rgba(54,74,53,0.25)",
                  background: block.fontFamily === "body" ? "rgba(181,86,47,0.08)" : "transparent",
                }}
              >
                Simple
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
              Color de texto
            </label>
            <SwatchPicker value={block.textColor || "#2b2620"} onChange={(c) => onChange({ textColor: c })} />
          </div>
        </>
      )}

      {(block.type === "mushroom-card" || block.type === "image") && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Color de fondo
          </label>
          <SwatchPicker value={block.bgColor || "#fdfbf4"} onChange={(c) => onChange({ bgColor: c })} />
        </div>
      )}

      {block.type !== "shape" && block.type !== "icon" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Bordes redondeados ({block.borderRadius ?? 0}px)
          </label>
          <input
            type="range"
            min={0}
            max={80}
            value={block.borderRadius ?? 0}
            onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          />
        </div>
      )}

      {block.type === "shape" && block.shapeKind === "square" && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
            Bordes redondeados ({block.borderRadius ?? 0}px)
          </label>
          <input
            type="range"
            min={0}
            max={80}
            value={block.borderRadius ?? 0}
            onChange={(e) => onChange({ borderRadius: Number(e.target.value) })}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
          Rotación ({block.rotation || 0}°)
        </label>
        <input
          type="range"
          min={-45}
          max={45}
          value={block.rotation || 0}
          onChange={(e) => onChange({ rotation: Number(e.target.value) })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
          Orden de capa
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => onChange({ zIndex: (block.zIndex || 0) + 1 })}
            className="flex-1 rounded-lg border px-2 py-1.5 text-sm hover:bg-black/5"
            style={{ borderColor: "rgba(54,74,53,0.25)" }}
          >
            Subir
          </button>
          <button
            onClick={() => onChange({ zIndex: Math.max(0, (block.zIndex || 0) - 1) })}
            className="flex-1 rounded-lg border px-2 py-1.5 text-sm hover:bg-black/5"
            style={{ borderColor: "rgba(54,74,53,0.25)" }}
          >
            Bajar
          </button>
        </div>
      </div>

      <button
        onClick={onDelete}
        className="mt-2 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        style={{ background: "var(--amanita)" }}
      >
        Eliminar bloque
      </button>
    </aside>
  );
}

function SwatchPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_SWATCHES.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-7 h-7 rounded-full border-2"
          style={{
            background: c,
            borderColor: value.toLowerCase() === c.toLowerCase() ? "var(--terracotta)" : "rgba(54,74,53,0.2)",
          }}
          aria-label={c}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded-full overflow-hidden border-2 cursor-pointer"
        style={{ borderColor: "rgba(54,74,53,0.2)" }}
      />
    </div>
  );
}
