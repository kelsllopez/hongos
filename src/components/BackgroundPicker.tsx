"use client";

import { useRef } from "react";

const BG_SWATCHES = ["#f4efe2", "#fdfbf4", "#e8dcc4", "#dde5d4", "#f0e3da", "#2b2620"];

export function BackgroundPicker({
  label,
  color,
  imageUrl,
  onColorChange,
  onImageChange,
  onUpload,
}: {
  label: string;
  color: string;
  imageUrl?: string;
  onColorChange: (color: string) => void;
  onImageChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--moss)" }}>
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        {BG_SWATCHES.map((c) => (
          <button
            key={c}
            onClick={() => {
              onColorChange(c);
              onImageChange("");
            }}
            className="w-8 h-8 rounded-full border-2"
            style={{
              background: c,
              borderColor: !imageUrl && color.toLowerCase() === c.toLowerCase() ? "var(--terracotta)" : "rgba(54,74,53,0.2)",
            }}
            aria-label={c}
          />
        ))}
        <input
          type="color"
          value={color}
          onChange={(e) => {
            onColorChange(e.target.value);
            onImageChange("");
          }}
          className="w-8 h-8 rounded-full overflow-hidden border-2 cursor-pointer"
          style={{ borderColor: "rgba(54,74,53,0.2)" }}
        />
      </div>

      <div className="flex items-center gap-3 mt-1">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const url = await onUpload(file);
            if (url) onImageChange(url);
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5"
          style={{ border: "1px solid rgba(54,74,53,0.25)", color: "var(--moss-dark)" }}
        >
          Usar una imagen de fondo
        </button>
        {imageUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
            <button
              type="button"
              onClick={() => onImageChange("")}
              className="text-xs hover:underline"
              style={{ color: "var(--amanita)" }}
            >
              Quitar imagen
            </button>
          </>
        )}
      </div>
    </div>
  );
}
