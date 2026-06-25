"use client";

import { useState } from "react";

export function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const getUrl = () => (typeof window !== "undefined" ? window.location.href : "");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // si el navegador bloquea el clipboard, no hacemos nada más
    }
    setOpen(false);
  };

  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${title} 🍄 ${getUrl()}`)}`;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"
        style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
      >
        🔗 Compartir
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50 overflow-hidden"
          style={{ background: "var(--bone)", border: "1px solid rgba(54,74,53,0.15)" }}
        >
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5"
            style={{ color: "var(--ink)" }}
          >
            💬 WhatsApp
          </a>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-black/5 text-left"
            style={{ color: "var(--ink)" }}
          >
            {copied ? "✅ ¡Copiado!" : "📋 Copiar enlace"}
          </button>
        </div>
      )}
    </div>
  );
}
