"use client";

import { Block, Mushroom } from "@/lib/types";
import { ShapeRenderer } from "@/components/ShapeRenderer";
import { StickerIcon } from "@/components/icons/StickerIcon";

const EDIBLE_LABELS: Record<string, { label: string; color: string }> = {
  comestible: { label: "Comestible", color: "var(--moss)" },
  "no-comestible": { label: "No comestible", color: "var(--humus)" },
  toxico: { label: "Tóxico", color: "var(--amanita)" },
  desconocido: { label: "Sin clasificar", color: "#9a9182" },
};

export function BlockContent({
  block,
  mushroom,
}: {
  block: Block;
  mushroom?: Mushroom;
}) {
  const style: React.CSSProperties = {
    color: block.textColor || "var(--ink)",
    fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
    fontFamily:
      block.fontFamily === "display"
        ? "var(--font-display)"
        : block.fontFamily === "body"
        ? "var(--font-body)"
        : undefined,
  };

  switch (block.type) {
    case "title":
      return (
        <h2
          className="font-display w-full h-full flex items-center break-words leading-tight"
          style={{ ...style, fontWeight: 700 }}
        >
          {block.content || "Título"}
        </h2>
      );

    case "text":
      return (
        <p className="w-full h-full overflow-auto whitespace-pre-wrap leading-relaxed" style={style}>
          {block.content || "Escribe algo aquí..."}
        </p>
      );

    case "image":
      return block.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={block.imageUrl}
          alt=""
          className="w-full h-full object-cover"
          style={{ borderRadius: block.borderRadius ?? 0 }}
          draggable={false}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-sm text-center px-2"
          style={{
            background: "rgba(54,74,53,0.08)",
            borderRadius: block.borderRadius ?? 0,
            color: "var(--moss)",
          }}
        >
          Sin imagen — haz clic para subir una
        </div>
      );

    case "shape":
      return (
        <ShapeRenderer
          kind={block.shapeKind || "circle"}
          color={block.bgColor || "var(--terracotta)"}
          borderRadius={block.borderRadius}
        />
      );

    case "icon":
      return (
        <div className="w-full h-full">
          <StickerIcon name={block.iconName || "mushroom"} color={block.bgColor} />
        </div>
      );

    case "mushroom-card": {
      if (!mushroom) {
        return (
          <div
            className="w-full h-full flex items-center justify-center text-sm text-center px-3"
            style={{ background: "rgba(54,74,53,0.06)", borderRadius: block.borderRadius ?? 16 }}
          >
            Elige un hongo para esta tarjeta
          </div>
        );
      }
      const edible = EDIBLE_LABELS[mushroom.edible || "desconocido"];
      return (
        <div
          className="w-full h-full flex flex-col overflow-hidden shadow-sm"
          style={{
            background: block.bgColor || "var(--bone)",
            borderRadius: block.borderRadius ?? 16,
            border: "1px solid rgba(54,74,53,0.12)",
          }}
        >
          <div className="relative w-full" style={{ height: "55%" }}>
            {mushroom.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mushroom.imageUrl}
                alt={mushroom.name}
                className="w-full h-full object-cover"
                draggable={false}
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{ background: "rgba(54,74,53,0.08)" }}
              >
                <span className="text-3xl">🍄</span>
              </div>
            )}
            <span
              className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ background: edible.color }}
            >
              {edible.label}
            </span>
          </div>
          <div className="flex-1 p-3 flex flex-col gap-0.5 min-h-0">
            <h3 className="font-display font-semibold text-base leading-snug truncate" style={{ color: "var(--ink)" }}>
              {mushroom.name}
            </h3>
            {mushroom.scientificName && (
              <p className="text-xs italic truncate" style={{ color: "var(--moss)" }}>
                {mushroom.scientificName}
              </p>
            )}
            <p className="text-xs mt-1 overflow-hidden leading-snug" style={{ color: "var(--humus)" }}>
              {mushroom.description}
            </p>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}
