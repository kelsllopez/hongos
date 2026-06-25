"use client";

import { useState } from "react";
import { AccordionSection } from "@/lib/types";

export function PostAccordion({ sections }: { sections: AccordionSection[] }) {
  const [openId, setOpenId] = useState<string | null>(sections[0]?.id ?? null);

  const visible = sections.filter((s) => s.title.trim() || s.content.trim());
  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-8">
      {visible.map((section) => {
        const isOpen = openId === section.id;
        return (
          <div
            key={section.id}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid rgba(54,74,53,0.15)", background: "var(--bone)" }}
          >
            <button
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left font-display font-semibold"
              style={{ color: "var(--ink)" }}
            >
              <span>{section.title || "Sin título"}</span>
              <span style={{ color: "var(--moss)" }}>{isOpen ? "−" : "+"}</span>
            </button>
            {isOpen && (
              <div
                className="px-4 pb-4 text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--humus)" }}
              >
                {section.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
