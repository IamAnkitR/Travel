"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { ApiState } from "@/lib/types";

export default function IndiaPage() {
  const [states, setStates] = useState<ApiState[]>([]);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((data) => setStates(data.states ?? []))
      .catch(() => setStates([]));
  }, []);

  const totalStays = states.reduce((s, st) => s + st.stays, 0);

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <div className="sticky top-0 z-30 bg-[#fcfbf8]/80 glass border-b border-stone-200/60">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Breadcrumbs items={[{ label: "Globe", href: "/", icon: "🌍" }, { label: "India", icon: "🇮🇳" }]} />
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 h-8 rounded-full bg-stone-900 text-white text-xs font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> {totalStays} live stays
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-[40px] lg:text-[56px] font-bold tracking-tight leading-[0.9] mb-4 font-display">
              India
              <br />
              Travel Overview
            </h1>
            <p className="text-stone-500 text-[15px] max-w-[480px] leading-relaxed">
              From Himalayan peaks to tropical beaches — discover states and verified stays curated for slow,
              meaningful travel.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            {[
              { k: "Best time", v: "Oct-Mar" },
              { k: "States", v: String(states.length) },
              { k: "Currency", v: "INR ₹" },
            ].map((m) => (
              <div key={m.k} className="bg-white border border-stone-200 rounded-[16px] px-4 py-3 min-w-[92px]">
                <div className="text-[11px] uppercase tracking-widest text-stone-400 font-semibold mb-1">{m.k}</div>
                <div className="text-[16px] font-bold">{m.v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
          {states.map((s) => (
            <Link
              key={s.id}
              href={s.destinationCount > 0 ? `/state/${s.id}` : "#"}
              className={`group text-left rounded-[20px] overflow-hidden border relative block ${
                s.featured
                  ? "col-span-2 md:col-span-2 lg:col-span-2 border-emerald-500/30 ring-2 ring-emerald-500/20"
                  : "border-stone-200 bg-white"
              } hover:shadow-lg hover:-translate-y-0.5 transition-all`}
            >
              {s.featured && (
                <div className="absolute top-3 left-3 z-10 bg-emerald-500 text-white text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full">
                  FEATURED
                </div>
              )}
              <div className={`h-[120px] bg-gradient-to-br ${s.gradient} relative`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
                <div className="absolute bottom-3 left-4 text-[32px]">{s.emoji}</div>
              </div>
              <div className="p-4">
                <div className="font-semibold text-[15px]">{s.name}</div>
                <div className="text-xs text-stone-500 mt-1">
                  {s.destinationCount > 0 ? `${s.stays} stays • Best Oct-Mar` : "Coming soon"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
