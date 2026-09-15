"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Menu, Search, X, ChevronRight } from "lucide-react";
import Globe from "@/components/Globe";
import type { ApiDestination } from "@/lib/types";

const CATEGORIES = [
  { label: "Mountains", icon: "🏔️" },
  { label: "Beaches", icon: "🏖️" },
  { label: "Cities", icon: "🏙️" },
  { label: "Culture", icon: "🛕" },
  { label: "Adventure", icon: "🎢" },
  { label: "Food", icon: "🍜" },
];

export default function HomePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<ApiDestination[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((data) => setDestinations(data.destinations ?? []))
      .catch(() => setDestinations([]));
  }, []);

  const filtered = useMemo(() => {
    let list = destinations;
    if (query) list = list.filter((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    if (activeTag) list = list.filter((d) => d.tags.includes(activeTag));
    return list;
  }, [destinations, query, activeTag]);

  const handleSearch = () => {
    if (!query.trim()) {
      setFeedback("Search: please type a destination");
      return;
    }
    const match = destinations.find((d) => d.name.toLowerCase().includes(query.toLowerCase()));
    if (match) {
      setFeedback(`Search: opening ${match.name}`);
      router.push(`/destination/${match.id}`);
    } else {
      setFeedback(`Search: no exact match for "${query}" — ${filtered.length} results`);
    }
  };

  const toggleTag = (label: string) => {
    const next = activeTag === label ? null : label;
    setActiveTag(next);
    if (next) {
      const count = destinations.filter((d) => d.tags.includes(next)).length;
      setFeedback(`Filter: ${next} • ${count} places found`);
    } else {
      setFeedback("Filter cleared — all destinations");
    }
  };

  return (
    <div className="relative w-full h-[100svh] bg-[#0B1220] overflow-hidden">
      <Globe onSelectIndia={() => router.push("/india")} searchActive={!!query} />

      <div className="absolute top-0 inset-x-0 z-20">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold tracking-tight text-[17px] font-display">
              Overview
            </span>
            <span className="hidden md:inline text-white/40 text-xs ml-2 font-medium">
              Explore anywhere. Understand everything.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/partner"
              className="hidden md:flex text-white/70 hover:text-white text-sm font-medium px-3 py-1.5 rounded-full hover:bg-white/10 transition"
            >
              For Businesses
            </Link>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[640px] flex flex-col items-center">
          <h1 className="text-[40px] md:text-[56px] font-bold tracking-tight text-white text-center leading-[0.95] mb-3 font-display">
            Where do you
            <br />
            want to go?
          </h1>
          <p className="text-white/50 text-[14px] md:text-[15px] font-medium mb-8 text-center">
            Drag to explore • Scroll to zoom • {destinations.reduce((s, d) => s + (d.businesses ?? 0), 0)}+ verified
            stays
          </p>

          <div className="w-full relative group">
            <div className="absolute inset-0 bg-emerald-500/20 blur-[20px] rounded-[20px] opacity-0 group-focus-within:opacity-100 transition" />
            <div className="relative flex items-center bg-white rounded-full h-[56px] px-2 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)]">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center ml-1 mr-2">
                <Search className="w-4 h-4 text-stone-500" />
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search destinations, hotels, experiences..."
                className="flex-1 bg-transparent outline-none text-[15px] placeholder:text-stone-400 font-medium"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="h-10 px-6 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-black transition relative z-20"
              >
                Search
              </button>
            </div>
            {query && filtered.length > 0 && (
              <div className="absolute top-[64px] inset-x-0 bg-white rounded-[16px] shadow-2xl p-2 border border-stone-100 max-h-[280px] overflow-auto">
                {filtered.slice(0, 5).map((d) => (
                  <Link
                    key={d.id}
                    href={`/destination/${d.id}`}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 text-left"
                  >
                    <div
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${d.gradient} flex items-center justify-center text-white text-[16px]`}
                    >
                      {d.emoji}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{d.name}</div>
                      <div className="text-xs text-stone-500">
                        {d.altitude} • {d.businesses ?? 0} stays
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col items-center gap-3">
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => toggleTag(c.label)}
                  className={`px-4 h-9 rounded-full text-[13px] font-medium border transition flex items-center gap-1.5 relative z-20 ${
                    activeTag === c.label
                      ? "bg-white text-stone-900 border-white"
                      : "bg-white/10 text-white/80 border-white/15 hover:bg-white/15 hover:text-white glass"
                  }`}
                >
                  <span>{c.icon}</span> {c.label}
                </button>
              ))}
            </div>

            <div className="min-h-[28px] flex flex-col items-center gap-2">
              <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/70 text-xs font-medium min-h-[24px] flex items-center">
                {feedback ||
                  (activeTag
                    ? `Filtering: ${activeTag} • ${filtered.length} places`
                    : query
                    ? `${filtered.length} results for "${query}"`
                    : "Select a category or search")}
              </div>
              {activeTag && (
                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Filtering: {activeTag} •{" "}
                  {filtered.length} places
                  <button onClick={() => toggleTag(activeTag)} className="ml-1 text-white/70 hover:text-white underline">
                    clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 z-20 p-6 lg:p-8">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
          <Link
            href="/india"
            className="group flex items-center gap-3 bg-white/10 glass border border-white/10 rounded-full p-1.5 pr-5 hover:bg-white/15 transition pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 via-white to-emerald-600 flex items-center justify-center text-[18px] shadow-inner">
              🇮🇳
            </div>
            <div className="text-left">
              <div className="text-white text-[13px] font-semibold leading-none flex items-center gap-1.5">
                India <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
              </div>
              <div className="text-white/60 text-[11px] font-medium">Featured • 28 states • 1500+ stays</div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-0.5 transition" />
          </Link>
          <div className="hidden md:flex items-center gap-2 text-white/30 text-[11px] font-medium tracking-wide">
            <span>© 2026 Overview</span>
            <span>•</span>
            <span>Globe data: Natural Earth</span>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="absolute inset-0 z-50 bg-[#0B1220]/90 glass p-6 flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-white font-semibold">
              <Compass className="w-5 h-5 text-emerald-400" /> Overview
            </div>
            <button onClick={() => setMenuOpen(false)} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-10 space-y-4">
            <Link
              href="/partner"
              onClick={() => setMenuOpen(false)}
              className="w-full text-left text-white text-lg font-medium py-3 border-b border-white/10 block"
            >
              For Businesses
            </Link>
            <Link
              href="/india"
              onClick={() => setMenuOpen(false)}
              className="w-full text-left text-white text-lg font-medium py-3 border-b border-white/10 block"
            >
              Explore India
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
