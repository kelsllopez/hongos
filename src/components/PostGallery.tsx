"use client";

import { useState } from "react";

export function PostGallery({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-3 flex items-center justify-center text-7xl"
        style={{ aspectRatio: "16/9", background: "rgba(54,74,53,0.08)" }}
      >
        🍄
      </div>
    );
  }

  return (
    <div className="mb-3">
      <div
        className="relative w-full rounded-3xl overflow-hidden"
        style={{ aspectRatio: "16/9", background: "rgba(54,74,53,0.08)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[activeIndex]} alt={alt} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setActiveIndex(i)}
              className="shrink-0 rounded-lg overflow-hidden"
              style={{
                width: 64,
                height: 64,
                outline: i === activeIndex ? "3px solid var(--terracotta)" : "1px solid rgba(54,74,53,0.2)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
