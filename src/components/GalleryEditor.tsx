"use client";

import { useRef } from "react";

export function GalleryEditor({
  images,
  coverUrl,
  onChange,
  onSetCover,
  onUpload,
  uploading,
}: {
  images: string[];
  coverUrl: string;
  onChange: (images: string[]) => void;
  onSetCover: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
  uploading: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const url = await onUpload(file);
      if (url) uploaded.push(url);
    }
    onChange([...images, ...uploaded]);
  };

  const removeImage = (url: string) => {
    onChange(images.filter((i) => i !== url));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-3">
        {images.map((url) => (
          <div key={url} className="relative group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt=""
              className="w-20 h-20 rounded-lg object-cover"
              style={{
                outline: url === coverUrl ? "3px solid var(--terracotta)" : "1px solid rgba(54,74,53,0.2)",
              }}
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-xs flex items-center justify-center"
              style={{ background: "var(--amanita)" }}
              aria-label="Quitar imagen"
            >
              ✕
            </button>
            {url !== coverUrl && (
              <button
                type="button"
                onClick={() => onSetCover(url)}
                className="absolute bottom-0 left-0 right-0 text-[9px] py-0.5 text-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(54,74,53,0.85)" }}
              >
                Usar como portada
              </button>
            )}
            {url === coverUrl && (
              <span
                className="absolute bottom-0 left-0 right-0 text-[9px] py-0.5 text-center text-white"
                style={{ background: "var(--terracotta)" }}
              >
                Portada
              </span>
            )}
          </div>
        ))}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="self-start text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-black/5 disabled:opacity-60"
        style={{ border: "1px solid rgba(54,74,53,0.25)", color: "var(--moss-dark)" }}
      >
        {uploading ? "Subiendo..." : "+ Agregar fotos"}
      </button>
      <p className="text-xs" style={{ color: "var(--humus)" }}>
        Puedes subir varias a la vez. Pasa el mouse sobre una foto para elegirla como portada.
      </p>
    </div>
  );
}
