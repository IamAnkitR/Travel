"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string; icon?: string };

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <div className="flex items-center gap-1.5 text-[13px] font-medium text-stone-500 overflow-x-auto whitespace-nowrap no-scrollbar">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-stone-300 shrink-0" />}
          {c.href ? (
            <Link
              href={c.href}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full transition hover:bg-stone-100 text-stone-700"
            >
              {c.icon && <span>{c.icon}</span>} {c.label}
            </Link>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 text-white">
              {c.icon && <span>{c.icon}</span>} {c.label}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}
