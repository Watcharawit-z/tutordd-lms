"use client";

import { useState } from "react";
import type { PortfolioPost } from "@/lib/types";

// กริดรูปผลงานแบบ Instagram + lightbox
export default function PortfolioGrid({ posts }: { posts: PortfolioPost[] }) {
  const [active, setActive] = useState<PortfolioPost | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3">
        {posts.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActive(p)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-brand-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.imageUrl}
              alt={p.caption ?? p.studentName ?? "ผลงานนักเรียน"}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              loading="lazy"
            />
            {/* overlay ตอน hover */}
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent p-4 opacity-0 transition group-hover:opacity-100">
              {p.resultLabel && (
                <span className="mb-1 w-fit rounded-full bg-accent-500 px-2.5 py-1 text-xs font-bold text-brand-950">
                  {p.resultLabel}
                </span>
              )}
              {p.studentName && <p className="text-sm font-bold text-white">{p.studentName}</p>}
              {p.caption && <p className="line-clamp-2 text-xs text-white/80">{p.caption}</p>}
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {active && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-950/80 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label="ปิด"
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-900 shadow hover:bg-white"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active.imageUrl} alt={active.caption ?? ""} className="max-h-[65vh] w-full object-contain bg-brand-50" />
            <div className="p-5">
              {active.resultLabel && (
                <span className="badge bg-accent-500/15 text-accent-600">{active.resultLabel}</span>
              )}
              {active.studentName && (
                <p className="mt-2 text-lg font-bold text-brand-900">{active.studentName}</p>
              )}
              {active.caption && <p className="mt-1 text-brand-900/70">{active.caption}</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
