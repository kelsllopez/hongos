"use client";

import { Mushroom } from "@/lib/types";

type EdibleFilter = Mushroom["edible"] | "todos";

const CATEGORIES: { value: EdibleFilter; label: string; color: string }[] = [
  { value: "todos", label: "Todos", color: "var(--moss-dark)" },
  { value: "comestible", label: "Comestibles", color: "var(--moss)" },
  { value: "no-comestible", label: "No comestibles", color: "var(--humus)" },
  { value: "toxico", label: "Tóxicos", color: "var(--amanita)" },
  { value: "desconocido", label: "Sin clasificar", color: "#9a9182" },
];

export function CategoryFilter({
  value,
  onChange,
  counts,
}: {
  value: EdibleFilter;
  onChange: (value: EdibleFilter) => void;
  counts: Record<string, number>;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {CATEGORIES.map((cat) => {
        const isActive = value === cat.value;
        const count = cat.value === "todos" ? counts.todos : counts[cat.value || "desconocido"] || 0;
        return (
          <button
            key={cat.value}
            onClick={() => onChange(cat.value)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: isActive ? cat.color : "var(--bone)",
              color: isActive ? "white" : "var(--humus)",
              border: `1px solid ${isActive ? cat.color : "rgba(54,74,53,0.18)"}`,
            }}
          >
            {cat.label}
            <span
              className="text-xs px-1.5 rounded-full"
              style={{
                background: isActive ? "rgba(255,255,255,0.25)" : "rgba(54,74,53,0.08)",
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
