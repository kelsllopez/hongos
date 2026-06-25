import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4 paper-texture"
      style={{ background: "var(--spore-cream)" }}
    >
      <span className="text-6xl">🍄</span>
      <h1 className="font-display font-bold text-2xl" style={{ color: "var(--ink)" }}>
        Por aquí no hay ningún hongo
      </h1>
      <p style={{ color: "var(--humus)" }}>
        La página que buscas no existe o se movió de lugar.
      </p>
      <Link
        href="/"
        className="mt-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
        style={{ background: "var(--terracotta)" }}
      >
        Volver al bosque
      </Link>
    </div>
  );
}
