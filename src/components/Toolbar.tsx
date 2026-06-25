"use client";

const TOOLS: { type: string; label: string; icon: string }[] = [
  { type: "title", label: "Título", icon: "𝐀" },
  { type: "text", label: "Texto", icon: "¶" },
  { type: "image", label: "Imagen", icon: "🖼" },
  { type: "mushroom-card", label: "Tarjeta de hongo", icon: "🍄" },
  { type: "shape", label: "Forma", icon: "●" },
  { type: "icon", label: "Sticker", icon: "✨" },
];

export function Toolbar({
  onAdd,
  onSave,
  saving,
  saved,
}: {
  onAdd: (type: string) => void;
  onSave: () => void;
  saving: boolean;
  saved: boolean;
}) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-2 rounded-2xl shadow-lg z-50"
      style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
    >
      {TOOLS.map((t) => (
        <button
          key={t.type}
          onClick={() => onAdd(t.type)}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl hover:bg-black/5 transition-colors"
          title={t.label}
        >
          <span className="text-lg leading-none">{t.icon}</span>
          <span className="text-[10px] font-medium" style={{ color: "var(--moss)" }}>
            {t.label}
          </span>
        </button>
      ))}
      <div className="w-px h-8 mx-1" style={{ background: "rgba(54,74,53,0.15)" }} />
      <button
        onClick={onSave}
        disabled={saving}
        className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
        style={{ background: "var(--moss-dark)" }}
      >
        {saving ? "Guardando..." : saved ? "✓ Guardado" : "Guardar"}
      </button>
    </div>
  );
}
