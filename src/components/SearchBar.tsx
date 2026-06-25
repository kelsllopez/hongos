"use client";

export function SearchBar({
  value,
  onChange,
  resultCount,
}: {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-full shadow-sm"
        style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.18)" }}
      >
        <span className="text-lg" aria-hidden="true">🔎</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Busca un hongo por su nombre..."
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--ink)" }}
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="text-xs px-2 py-1 rounded-full hover:bg-black/5"
            style={{ color: "var(--humus)" }}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <p className="text-xs px-2" style={{ color: "var(--humus)" }}>
          {resultCount === 0
            ? `Ningún hongo coincide con "${value}"`
            : `${resultCount} ${resultCount === 1 ? "resultado" : "resultados"} para "${value}"`}
        </p>
      )}
    </div>
  );
}
