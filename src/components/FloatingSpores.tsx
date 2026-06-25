"use client";

export function FloatingSpores({ count = 14 }: { count?: number }) {
  const spores = Array.from({ length: count }, (_, i) => i);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {spores.map((i) => {
        const left = (i * 137.5) % 100; // distribución pseudoaleatoria pero estable
        const size = 3 + (i % 4);
        const duration = 14 + (i % 6) * 3;
        const delay = (i % 7) * 1.8;
        return (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: "-20px",
              width: size,
              height: size,
              borderRadius: "50%",
              background: i % 3 === 0 ? "var(--terracotta)" : "var(--moss)",
              opacity: 0.35,
              animation: `spore-rise ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </div>
  );
}
