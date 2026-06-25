export type BlockType = "title" | "text" | "image" | "mushroom-card" | "shape" | "icon";

export type ShapeKind = "circle" | "square" | "triangle" | "blob" | "star" | "heart" | "hexagon" | "diamond" | "ring" | "arch";

export type IconName =
  | "mushroom"
  | "leaf"
  | "sun"
  | "raindrop"
  | "star"
  | "moon"
  | "cloud"
  | "tree"
  | "acorn"
  | "butterfly"
  | "snail"
  | "flower"
  | "bee"
  | "frog"
  | "magnifier"
  | "book"
  | "mug"
  | "heart-deco";

export type Block = {
  id: string;
  type: BlockType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  bgColor?: string;
  textColor?: string;
  fontSize?: number;
  fontFamily?: string;
  borderRadius?: number;
  content?: string;
  imageUrl?: string;
  mushroomId?: string;
  shapeKind?: ShapeKind;
  iconName?: IconName;
};

export type InfoTableRow = {
  id: string;
  label: string;
  value: string;
};

export type AccordionSection = {
  id: string;
  title: string;
  content: string;
};

export type Mushroom = {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  imageUrl?: string;
  images?: string[]; // galería completa (imageUrl se mantiene como portada/compatibilidad)
  edible?: "comestible" | "no-comestible" | "toxico" | "desconocido";
  habitat?: string;
  season?: string;
  infoTable?: InfoTableRow[];
  sections?: AccordionSection[];
  createdAt: number;
  viewCount?: number;
};

export type Comment = {
  id: string;
  mushroomId: string | null;
  author: string;
  text: string;
  status: "approved" | "rejected" | "pending";
  moderationReason?: string;
  createdAt: number;
};

export type SiteConfig = {
  siteName: string;
  // Fondo de la página "Sobre el bosque" (el lienzo libre)
  backgroundColor: string;
  backgroundImage?: string;
  // Fondo del feed principal (la portada con las tarjetas de hongos)
  feedBackgroundColor?: string;
  feedBackgroundImage?: string;
  fontFamily: string;
};
