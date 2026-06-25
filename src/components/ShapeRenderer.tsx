import { ShapeKind } from "@/lib/types";

export function ShapeRenderer({
  kind,
  color,
  borderRadius,
}: {
  kind: ShapeKind;
  color: string;
  borderRadius?: number;
}) {
  switch (kind) {
    case "circle":
      return <div className="w-full h-full" style={{ background: color, borderRadius: "9999px" }} />;

    case "square":
      return (
        <div
          className="w-full h-full"
          style={{ background: color, borderRadius: `${borderRadius ?? 8}px` }}
        />
      );

    case "triangle":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,6 96,94 4,94" fill={color} />
        </svg>
      );

    case "star": {
      const points = Array.from({ length: 10 }, (_, i) => {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? 46 : 19;
        return `${50 + Math.cos(angle) * r},${50 + Math.sin(angle) * r}`;
      }).join(" ");
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points={points} fill={color} />
        </svg>
      );
    }

    case "heart":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M50 88C20 66 6 48 6 30A22 22 0 0150 18 22 22 0 0194 30c0 18-14 36-44 58z"
            fill={color}
          />
        </svg>
      );

    case "blob":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M30 12C50 4 78 14 86 36c8 20 2 42-18 52-22 11-46 4-58-16C-2 52 8 22 30 12z"
            fill={color}
          />
        </svg>
      );

    case "hexagon":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" fill={color} />
        </svg>
      );

    case "diamond":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon points="50,4 96,50 50,96 4,50" fill={color} />
        </svg>
      );

    case "ring":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="44" fill="none" stroke={color} strokeWidth="14" />
        </svg>
      );

    case "arch":
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M6 96V50a44 44 0 0188 0v46z" fill={color} />
        </svg>
      );

    default:
      return <div className="w-full h-full" style={{ background: color, borderRadius: "9999px" }} />;
  }
}
