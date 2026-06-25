"use client";

import { useRef, useState, useCallback } from "react";
import { Block, Mushroom } from "@/lib/types";
import { BlockContent } from "./BlockContent";

type Props = {
  block: Block;
  mushroom?: Mushroom;
  selected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<Block>) => void;
  onDoubleClick?: () => void;
};

const HANDLE_SIZE = 12;

export function DraggableBlock({ block, mushroom, selected, onSelect, onChange, onDoubleClick }: Props) {
  const dragState = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
  } | null>(null);
  const resizeState = useRef<{
    startX: number;
    startY: number;
    origW: number;
    origH: number;
    origX: number;
    origY: number;
    handle: string;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const handlePointerDownDrag = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      onSelect();
      (e.target as Element).setPointerCapture(e.pointerId);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: block.x,
        origY: block.y,
      };
      setDragging(true);

      const onMove = (ev: PointerEvent) => {
        if (!dragState.current) return;
        const dx = ev.clientX - dragState.current.startX;
        const dy = ev.clientY - dragState.current.startY;
        onChange({
          x: Math.round(dragState.current.origX + dx),
          y: Math.round(dragState.current.origY + dy),
        });
      };
      const onUp = () => {
        dragState.current = null;
        setDragging(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [block.x, block.y, onChange, onSelect]
  );

  const handlePointerDownResize = useCallback(
    (e: React.PointerEvent, handle: string) => {
      e.stopPropagation();
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      resizeState.current = {
        startX: e.clientX,
        startY: e.clientY,
        origW: block.width,
        origH: block.height,
        origX: block.x,
        origY: block.y,
        handle,
      };

      const onMove = (ev: PointerEvent) => {
        const rs = resizeState.current;
        if (!rs) return;
        const dx = ev.clientX - rs.startX;
        const dy = ev.clientY - rs.startY;
        const updates: Partial<Block> = {};

        if (rs.handle.includes("e")) updates.width = Math.max(40, Math.round(rs.origW + dx));
        if (rs.handle.includes("s")) updates.height = Math.max(30, Math.round(rs.origH + dy));
        if (rs.handle.includes("w")) {
          const newW = Math.max(40, Math.round(rs.origW - dx));
          updates.width = newW;
          updates.x = Math.round(rs.origX + (rs.origW - newW));
        }
        if (rs.handle.includes("n")) {
          const newH = Math.max(30, Math.round(rs.origH - dy));
          updates.height = newH;
          updates.y = Math.round(rs.origY + (rs.origH - newH));
        }
        onChange(updates);
      };
      const onUp = () => {
        resizeState.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [block.width, block.height, block.x, block.y, onChange]
  );

  const handles = ["nw", "ne", "sw", "se"];

  return (
    <div
      onPointerDown={handlePointerDownDrag}
      onDoubleClick={onDoubleClick}
      className="absolute select-none"
      style={{
        left: block.x,
        top: block.y,
        width: block.width,
        height: block.height,
        zIndex: block.zIndex,
        transform: `rotate(${block.rotation || 0}deg)`,
        cursor: dragging ? "grabbing" : "grab",
        outline: selected ? "2px solid var(--terracotta)" : "none",
        outlineOffset: 2,
        touchAction: "none",
      }}
    >
      <BlockContent block={block} mushroom={mushroom} />

      {selected && (
        <>
          {handles.map((h) => (
            <div
              key={h}
              onPointerDown={(e) => handlePointerDownResize(e, h)}
              className="absolute bg-white border-2 rounded-full"
              style={{
                width: HANDLE_SIZE,
                height: HANDLE_SIZE,
                borderColor: "var(--terracotta)",
                top: h.includes("n") ? -HANDLE_SIZE / 2 : undefined,
                bottom: h.includes("s") ? -HANDLE_SIZE / 2 : undefined,
                left: h.includes("w") ? -HANDLE_SIZE / 2 : undefined,
                right: h.includes("e") ? -HANDLE_SIZE / 2 : undefined,
                cursor: `${h}-resize`,
                touchAction: "none",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}
