"use client";

import Link from "next/link";
import { Mushroom } from "@/lib/types";

const EDIBLE_LABELS: Record<string, { label: string; color: string }> = {
  comestible: { label: "Comestible", color: "var(--moss)" },
  "no-comestible": { label: "No comestible", color: "var(--humus)" },
  toxico: { label: "Tóxico", color: "var(--amanita)" },
  desconocido: { label: "Sin clasificar", color: "#9a9182" },
};

export function PostCard({ mushroom, commentCount }: { mushroom: Mushroom; commentCount: number }) {
  const edible = EDIBLE_LABELS[mushroom.edible || "desconocido"];

  return (
    <Link
      href={`/hongo/${mushroom.id}`}
      className="group flex flex-col rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
      style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.12)" }}
    >
      <div className="relative w-full aspect-[4/3]" style={{ background: "rgba(54,74,53,0.08)" }}>
        {mushroom.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mushroom.imageUrl}
            alt={mushroom.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍄</div>
        )}
        <span
          className="absolute top-3 right-3 text-[11px] font-semibold px-2.5 py-1 rounded-full text-white shadow-sm"
          style={{ background: edible.color }}
        >
          {edible.label}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-1 flex-1">
        <h3 className="font-display font-semibold text-lg leading-snug" style={{ color: "var(--ink)" }}>
          {mushroom.name}
        </h3>
        {mushroom.scientificName && (
          <p className="text-xs italic" style={{ color: "var(--moss)" }}>
            {mushroom.scientificName}
          </p>
        )}
        <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--humus)" }}>
          {mushroom.description}
        </p>
        <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "var(--moss)" }}>
          {mushroom.season && <span>🍂 {mushroom.season}</span>}
          <span className="ml-auto flex items-center gap-1">
            💬 {commentCount} {commentCount === 1 ? "comentario" : "comentarios"}
          </span>
        </div>
      </div>
    </Link>
  );
}
