"use client";

import { AccordionSection } from "@/lib/types";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function SectionsEditor({
  sections,
  onChange,
}: {
  sections: AccordionSection[];
  onChange: (sections: AccordionSection[]) => void;
}) {
  const addSection = () => {
    onChange([...sections, { id: generateId(), title: "", content: "" }]);
  };

  const updateSection = (id: string, updates: Partial<AccordionSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section) => (
        <div
          key={section.id}
          className="p-3 rounded-xl flex flex-col gap-2"
          style={{ background: "var(--spore-cream)", border: "1px solid rgba(54,74,53,0.15)" }}
        >
          <div className="flex items-center gap-2">
            <input
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Título de la sección, ej: Cómo cocinarlo"
              className="input flex-1 font-semibold"
            />
            <button
              onClick={() => removeSection(section.id)}
              className="text-xs px-2 py-2 rounded-lg hover:bg-black/5 shrink-0"
              style={{ color: "var(--amanita)" }}
              aria-label="Eliminar sección"
              type="button"
            >
              ✕
            </button>
          </div>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Escribe el contenido de esta sección..."
            rows={3}
            className="input resize-none"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addSection}
        className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5"
        style={{ border: "1px solid rgba(54,74,53,0.25)", color: "var(--moss-dark)" }}
      >
        + Agregar sección desplegable
      </button>
    </div>
  );
}
