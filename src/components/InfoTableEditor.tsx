"use client";

import { InfoTableRow } from "@/lib/types";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function InfoTableEditor({
  rows,
  onChange,
}: {
  rows: InfoTableRow[];
  onChange: (rows: InfoTableRow[]) => void;
}) {
  const addRow = () => {
    onChange([...rows, { id: generateId(), label: "", value: "" }]);
  };

  const updateRow = (id: string, updates: Partial<InfoTableRow>) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-2">
              <input
                value={row.label}
                onChange={(e) => updateRow(row.id, { label: e.target.value })}
                placeholder="Ej: Tamaño"
                className="input flex-1"
              />
              <input
                value={row.value}
                onChange={(e) => updateRow(row.id, { value: e.target.value })}
                placeholder="Ej: 5-10 cm"
                className="input flex-1"
              />
              <button
                onClick={() => removeRow(row.id)}
                className="text-xs px-2 py-2 rounded-lg hover:bg-black/5 shrink-0"
                style={{ color: "var(--amanita)" }}
                aria-label="Eliminar fila"
                type="button"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        onClick={addRow}
        className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5"
        style={{ border: "1px solid rgba(54,74,53,0.25)", color: "var(--moss-dark)" }}
      >
        + Agregar fila
      </button>
    </div>
  );
}
