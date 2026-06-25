"use client";

export type SortOption = "recientes" | "nombre" | "comentados";

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: "recientes", label: "Más recientes" },
  { value: "nombre", label: "Nombre (A-Z)" },
  { value: "comentados", label: "Más comentados" },
];

export function SortSelector({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (value: SortOption) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as SortOption)}
      className="text-sm px-3 py-1.5 rounded-full font-medium cursor-pointer"
      style={{
        background: "var(--bone)",
        border: "1px solid rgba(54,74,53,0.18)",
        color: "var(--moss-dark)",
      }}
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
