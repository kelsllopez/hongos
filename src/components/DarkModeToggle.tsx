"use client";

import { useEffect, useState } from "react";

export function DarkModeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("hongos_theme");
    const prefersDark = stored
      ? stored === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- leemos la preferencia real del navegador/localStorage al montar, no hay alternativa sin efecto
    setDark(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("hongos_theme", next ? "dark" : "light");
  };

  // Evita un parpadeo de hidratación: no renderizamos hasta saber el tema real
  if (!mounted) return <div className="w-8 h-8" />;

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      className="w-8 h-8 flex items-center justify-center rounded-full text-sm"
      style={{ border: "1px solid rgba(54,74,53,0.2)", color: "var(--moss-dark)" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
