"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Building2, Clock, Star } from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { ApiDestination, ApiState } from "@/lib/types";

export default function StatePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;

  const [state, setState] = useState<ApiState | null>(null);
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/states/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setState(data.state))
      .catch(() => setState(null));
  }, [slug]);

  useEffect(() => {
    const search = new URLSearchParams({ state: slug });
    if (query) search.set("q", query);
    if (activeTag) search.set("tag", activeTag);
    fetch(`/api/destinations?${search}`)
      .then((r) => r.json())
      .then((data) => setDestinations(data.destinations ?? []))
      .catch(() => setDestinations([]));
  }, [slug, query, activeTag]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => d.tags.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [destinations]);

  if (!state) {
    return <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center text-stone-400">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <div className="sticky top-0 z-30 bg-[#fcfbf8]/80 glass border-b border-stone-200/60">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/india" className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Breadcrumbs
              items={[
                { label: "Globe", href: "/", icon: "🌍" },
                { label: "India", href: "/india", icon: "🇮🇳" },
                { label: state.name, icon: state.emoji },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-stone-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${state.destinationCount} destinations`}
                className="h-9 pl-9 pr-4 rounded-full bg-white border border-stone-200 text-sm w-[220px] outline-none focus:border-stone-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
          <div className="lg:w-[320px] shrink-0">
            <div className="lg:sticky lg:top-[96px]">
              <h1 className="text-[36px] lg:text-[44px] font-bold tracking-tight leading-[0.9] mb-3 font-display">
                {state.name}
              </h1>
              <p className="text-stone-600 text-[14px] leading-relaxed mb-6">
                {state.destinationCount} curated destinations with {state.businessCount}+ verified stays, from
                Himalayan treks to colonial hill towns.
              </p>
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { k: "Best time", v: "Mar-Jun\nSep-Nov" },
                  { k: "Dests", v: String(state.destinationCount) },
                  { k: "Businesses", v: `${state.businessCount}+` },
                ].map((m) => (
                  <div key={m.k} className="bg-white border border-stone-200 rounded-[14px] p-3">
                    <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">{m.k}</div>
                    <div className="text-[13px] font-bold mt-1 whitespace-pre-line leading-tight">{m.v}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                      activeTag === t
                        ? "bg-stone-900 text-white border-stone-900"
                        : "bg-white border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
              {destinations.map((d) => (
                <Link
                  key={d.id}
                  href={`/destination/${d.id}`}
                  className="group text-left bg-white rounded-[22px] border border-stone-200 overflow-hidden hover:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-all duration-300 block"
                >
                  <div className={`h-[168px] bg-gradient-to-br ${d.gradient} relative overflow-hidden`}>
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span className="px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold tracking-wide">
                        {d.budget}
                      </span>
                      <span className="px-2.5 py-1 rounded-full bg-black/20 glass text-white text-[11px] font-medium border border-white/10">
                        {d.stay}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <div className="text-[36px] leading-none drop-shadow-lg">{d.emoji}</div>
                      <div className="px-2.5 py-1 rounded-full bg-black/30 glass text-white text-[11px] font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {d.businesses ?? 0}
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-[16px] leading-tight">{d.name}</div>
                      <div className="flex items-center gap-1 text-[12px] font-semibold bg-stone-900 text-white px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3 fill-white" /> {d.rating}
                      </div>
                    </div>
                    <div className="text-[12px] text-stone-500 mt-1.5 flex items-center gap-1.5">
                      <Clock className="w-3 h-3" /> {d.bestTime} • {d.altitude}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
