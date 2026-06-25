import { IconName } from "@/lib/types";

type IconProps = {
  color?: string;
};

// Cada ícono es un SVG simple, de trazo orgánico, pensado para verse bien
// como "sticker" decorativo sobre el lienzo. Todos comparten viewBox 0 0 100 100
// para que el bloque contenedor los escale de forma consistente.

function MushroomIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 12c-22 0-36 14-36 28 0 4 3 6 7 6h58c4 0 7-2 7-6 0-14-14-28-36-28z"
        fill={color}
      />
      <circle cx="34" cy="28" r="4" fill="#fdfbf4" opacity="0.85" />
      <circle cx="58" cy="22" r="3" fill="#fdfbf4" opacity="0.85" />
      <circle cx="68" cy="34" r="3.5" fill="#fdfbf4" opacity="0.85" />
      <rect x="40" y="44" width="20" height="38" rx="9" fill="#f4efe2" />
    </svg>
  );
}

function LeafIcon({ color = "#4f6b4a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M20 80C15 50 35 18 78 14c4 38-22 64-58 66z"
        fill={color}
      />
      <path d="M24 78C32 56 48 38 74 18" stroke="#fdfbf4" strokeWidth="3" fill="none" opacity="0.6" />
    </svg>
  );
}

function SunIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="50" cy="50" r="22" fill={color} />
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI) / 4;
        const x1 = 50 + Math.cos(angle) * 30;
        const y1 = 50 + Math.sin(angle) * 30;
        const x2 = 50 + Math.cos(angle) * 42;
        const y2 = 50 + Math.sin(angle) * 42;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function RaindropIcon({ color = "#4f6b4a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 10C50 10 25 45 25 64a25 25 0 0050 0C75 45 50 10 50 10z"
        fill={color}
      />
      <ellipse cx="42" cy="60" rx="5" ry="8" fill="#fdfbf4" opacity="0.45" />
    </svg>
  );
}

function StarIcon({ color = "#b5562f" }: IconProps) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const r = i % 2 === 0 ? 40 : 17;
    return `${50 + Math.cos(angle) * r},${50 + Math.sin(angle) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points={points} fill={color} />
    </svg>
  );
}

function MoonIcon({ color = "#364a35" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M65 15a38 38 0 100 70 30 30 0 010-70z"
        fill={color}
      />
    </svg>
  );
}

function CloudIcon({ color = "#9a9182" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M28 65a16 16 0 010-32 20 20 0 0138-7 17 17 0 0114 17 14 14 0 01-2 22z"
        fill={color}
      />
    </svg>
  );
}

function TreeIcon({ color = "#364a35" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <polygon points="50,10 72,45 28,45" fill={color} />
      <polygon points="50,28 78,62 22,62" fill={color} />
      <rect x="44" y="62" width="12" height="26" fill="#5c4632" />
    </svg>
  );
}

function AcornIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M30 35 Q50 15 70 35 L66 42 H34 Z" fill="#5c4632" />
      <ellipse cx="50" cy="62" rx="22" ry="26" fill={color} />
    </svg>
  );
}

function ButterflyIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="30" cy="38" rx="20" ry="16" fill={color} />
      <ellipse cx="70" cy="38" rx="20" ry="16" fill={color} />
      <ellipse cx="32" cy="62" rx="15" ry="13" fill={color} opacity="0.85" />
      <ellipse cx="68" cy="62" rx="15" ry="13" fill={color} opacity="0.85" />
      <rect x="47" y="28" width="6" height="48" rx="3" fill="#364a35" />
    </svg>
  );
}

function SnailIcon({ color = "#4f6b4a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="62" cy="45" r="22" fill={color} />
      <circle cx="62" cy="45" r="13" fill="#fdfbf4" opacity="0.5" />
      <path
        d="M18 75c0-14 12-20 24-20 18 0 26 10 26 10"
        stroke={color}
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <line x1="22" y1="55" x2="16" y2="42" stroke={color} strokeWidth="4" strokeLinecap="round" />
      <line x1="32" y1="52" x2="28" y2="38" stroke={color} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function FlowerIcon({ color = "#b8392a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {Array.from({ length: 5 }, (_, i) => {
        const angle = (i * 2 * Math.PI) / 5;
        const cx = 50 + Math.cos(angle) * 20;
        const cy = 50 + Math.sin(angle) * 20;
        return <circle key={i} cx={cx} cy={cy} r="16" fill={color} />;
      })}
      <circle cx="50" cy="50" r="14" fill="#e8dcc4" />
    </svg>
  );
}

function BeeIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="58" cy="50" rx="14" ry="22" transform="rotate(20 58 50)" fill="#2b2620" />
      <rect x="48" y="34" width="20" height="6" rx="3" fill={color} transform="rotate(20 58 50)" />
      <rect x="50" y="48" width="20" height="6" rx="3" fill={color} transform="rotate(20 58 50)" />
      <rect x="52" y="62" width="20" height="6" rx="3" fill={color} transform="rotate(20 58 50)" />
      <ellipse cx="34" cy="38" rx="14" ry="9" fill="#fdfbf4" opacity="0.6" transform="rotate(-15 34 38)" />
      <ellipse cx="36" cy="54" rx="14" ry="9" fill="#fdfbf4" opacity="0.6" transform="rotate(15 36 54)" />
      <circle cx="30" cy="28" r="7" fill="#2b2620" />
    </svg>
  );
}

function FrogIcon({ color = "#4f6b4a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <ellipse cx="50" cy="58" rx="34" ry="26" fill={color} />
      <circle cx="32" cy="32" r="13" fill={color} />
      <circle cx="68" cy="32" r="13" fill={color} />
      <circle cx="32" cy="30" r="6" fill="#2b2620" />
      <circle cx="68" cy="30" r="6" fill="#2b2620" />
      <ellipse cx="50" cy="64" rx="16" ry="8" fill="#e8dcc4" opacity="0.7" />
    </svg>
  );
}

function MagnifierIcon({ color = "#5c4632" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <circle cx="42" cy="42" r="28" fill="none" stroke={color} strokeWidth="9" />
      <line x1="62" y1="62" x2="88" y2="88" stroke={color} strokeWidth="11" strokeLinecap="round" />
    </svg>
  );
}

function BookIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M14 18h32a10 10 0 0110 10v54a8 8 0 00-8-8H14z" fill={color} />
      <path d="M86 18H54a10 10 0 00-10 10v54a8 8 0 018-8h34z" fill="#4f6b4a" />
      <line x1="50" y1="28" x2="50" y2="82" stroke="#2b2620" strokeWidth="2" opacity="0.3" />
    </svg>
  );
}

function MugIcon({ color = "#b5562f" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path d="M22 30h46v34a18 18 0 01-18 18H40a18 18 0 01-18-18z" fill={color} />
      <path
        d="M68 38c12-2 20 4 20 14s-8 16-20 14"
        fill="none"
        stroke={color}
        strokeWidth="8"
      />
      <path d="M28 22h34v8H28z" fill="#5c4632" opacity="0.6" />
    </svg>
  );
}

function HeartDecoIcon({ color = "#b8392a" }: IconProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <path
        d="M50 86C24 68 10 52 10 34A20 20 0 0150 22 20 20 0 0190 34c0 18-14 34-40 52z"
        fill={color}
      />
      <path
        d="M30 30c4-4 10-4 14 0"
        stroke="#fdfbf4"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.5"
        fill="none"
      />
    </svg>
  );
}

const ICONS: Record<IconName, (props: IconProps) => React.ReactElement> = {
  mushroom: MushroomIcon,
  leaf: LeafIcon,
  sun: SunIcon,
  raindrop: RaindropIcon,
  star: StarIcon,
  moon: MoonIcon,
  cloud: CloudIcon,
  tree: TreeIcon,
  acorn: AcornIcon,
  butterfly: ButterflyIcon,
  snail: SnailIcon,
  flower: FlowerIcon,
  bee: BeeIcon,
  frog: FrogIcon,
  magnifier: MagnifierIcon,
  book: BookIcon,
  mug: MugIcon,
  "heart-deco": HeartDecoIcon,
};

export const ICON_NAMES: IconName[] = Object.keys(ICONS) as IconName[];

export const ICON_LABELS: Record<IconName, string> = {
  mushroom: "Hongo",
  leaf: "Hoja",
  sun: "Sol",
  raindrop: "Gota",
  star: "Estrella",
  moon: "Luna",
  cloud: "Nube",
  tree: "Árbol",
  acorn: "Bellota",
  butterfly: "Mariposa",
  snail: "Caracol",
  flower: "Flor",
  bee: "Abeja",
  frog: "Rana",
  magnifier: "Lupa",
  book: "Libro",
  mug: "Taza",
  "heart-deco": "Corazón",
};

export function StickerIcon({ name, color }: { name: IconName; color?: string }) {
  const Cmp = ICONS[name] || MushroomIcon;
  return <Cmp color={color} />;
}
