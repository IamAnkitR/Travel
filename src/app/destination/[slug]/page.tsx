"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Award,
  Calendar,
  Clock,
  Compass,
  Eye,
  Heart,
  MapPin,
  MessageCircle,
  Mountain,
  Navigation2,
  Phone,
  Plane,
  Share2,
  Shield,
  Star,
  Thermometer,
  Wallet,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useToast } from "@/components/ToastProvider";
import { useLeadAction } from "@/lib/useLeadAction";
import type { ApiBusiness, ApiDestination } from "@/lib/types";

const TABS = [
  { label: "Overview" },
  { label: "Where to stay" },
  { label: "Things to do" },
  { label: "Eat" },
  { label: "Packages" },
  { label: "Transport" },
  { label: "Map" },
];

export default function DestinationPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const { showToast } = useToast();
  const sendLead = useLeadAction();

  const [destination, setDestination] = useState<ApiDestination | null>(null);
  const [businesses, setBusinesses] = useState<ApiBusiness[]>([]);
  const [tab, setTab] = useState("Overview");
  const [typeFilter, setTypeFilter] = useState("All");
  const [favorited, setFavorited] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/destinations/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setDestination(data.destination))
      .catch(() => setNotFound(true));
  }, [slug]);

  useEffect(() => {
    fetch(`/api/businesses?destination=${slug}`)
      .then((r) => r.json())
      .then((data) => setBusinesses(data.businesses ?? []))
      .catch(() => setBusinesses([]));
  }, [slug]);

  const filteredBusinesses = useMemo(() => {
    if (typeFilter === "All") return businesses;
    const singular = typeFilter.replace(/s$/, "");
    return businesses.filter((b) => b.type === singular);
  }, [businesses, typeFilter]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-stone-500">
        <p>Destination not found.</p>
        <Link href="/india" className="text-emerald-700 underline">
          Back to explore
        </Link>
      </div>
    );
  }

  if (!destination) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-stone-400">Loading…</div>;
  }

  const d = destination;

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <div className={`h-[52vh] min-h-[420px] bg-gradient-to-br ${d.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="absolute top-0 inset-x-0 z-20">
            <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
              <Breadcrumbs
                items={[
                  { label: "Globe", href: "/", icon: "🌍" },
                  { label: "India", href: "/india", icon: "🇮🇳" },
                  { label: "Uttarakhand", href: "/state/uttarakhand", icon: "🏔️" },
                  { label: d.name, icon: d.emoji },
                ]}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFavorited((f) => !f)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition ${
                    favorited
                      ? "bg-white text-red-500 border-white"
                      : "bg-black/20 glass border-white/20 text-white hover:bg-black/30"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? "fill-current" : ""}`} />
                </button>
                <button
                  onClick={() => showToast("Link copied")}
                  className="w-9 h-9 rounded-full bg-black/20 glass border border-white/20 text-white flex items-center justify-center hover:bg-black/30"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 lg:p-8">
            <div className="max-w-[1280px] mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div>
                  <h1 className="text-[42px] lg:text-[64px] font-bold tracking-tight text-white leading-[0.9] drop-shadow-[0_4px_20px_rgba(0,0,0,0.3)] font-display">
                    {d.name} <span className="font-normal opacity-80 text-[22px] lg:text-[28px] tracking-normal">— Travel Overview</span>
                  </h1>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { icon: Calendar, label: d.bestTime },
                      { icon: Clock, label: d.stay },
                      { icon: Wallet, label: d.budget },
                      { icon: Shield, label: "Safety: High" },
                      { icon: Thermometer, label: "12°C" },
                      { icon: Mountain, label: d.altitude },
                    ].map((m, i) => (
                      <div
                        key={i}
                        className="h-8 px-3 rounded-full bg-black/25 glass border border-white/15 text-white text-xs font-medium flex items-center gap-1.5"
                      >
                        <m.icon className="w-3.5 h-3.5 opacity-80" /> {m.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-4 h-10 rounded-full bg-white text-stone-900 text-sm font-semibold flex items-center gap-2">
                    <Eye className="w-4 h-4" /> {d.businesses ?? 0} verified stays
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-[5%] top-[18%] text-[180px] lg:text-[280px] leading-none opacity-[0.18] select-none pointer-events-none blur-[0.5px]">
            {d.emoji}
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
        <div className="sticky top-0 z-20 bg-white/80 glass border-b border-stone-200 -mx-6 lg:-mx-8 px-6 lg:px-8 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 h-[56px]">
            {TABS.map((t) => (
              <button
                key={t.label}
                onClick={() => setTab(t.label)}
                className={`h-8 px-4 rounded-full text-[13px] font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  tab === t.label ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
                }`}
              >
                {t.label}
                {t.label === "Where to stay" && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[11px] ${tab === t.label ? "bg-white/20" : "bg-stone-100"}`}>
                    {businesses.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8 lg:py-10 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
          <div>
            {tab === "Overview" && (
              <div className="space-y-10">
                <div>
                  <h2 className="text-[22px] font-bold tracking-tight mb-3 font-display">About {d.name}</h2>
                  <p className="text-[15px] leading-relaxed text-stone-600">
                    {d.description} Set at {d.altitude}, it combines local village life with easy access to forests,
                    temples, and Himalayan viewpoints. Ideal for digital nomads seeking altitude without isolation.
                  </p>
                  <div className="mt-6 grid sm:grid-cols-2 gap-3">
                    {d.whyVisit.map((w) => (
                      <div key={w} className="flex gap-2.5 p-3 rounded-[14px] bg-stone-50 border border-stone-200/70">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div className="text-[13px] font-medium leading-snug">{w}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[16px] font-semibold mb-3">How to reach</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { mode: "By Air", detail: "Nearest airport 85-190km away", icon: Plane },
                      { mode: "By Train", detail: "Nearest railhead — taxi 2.5hrs", icon: "🚂" },
                      { mode: "By Road", detail: "Delhi 300-400km", icon: "🚌" },
                    ].map((m) => (
                      <div key={m.mode} className="p-4 rounded-[16px] border border-stone-200 bg-white">
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center mb-2.5 text-sm">
                          {typeof m.icon === "string" ? m.icon : <Plane className="w-4 h-4" />}
                        </div>
                        <div className="text-sm font-semibold">{m.mode}</div>
                        <div className="text-xs text-stone-500 mt-1 leading-snug">{m.detail}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[20px] bg-stone-900 text-white p-6 lg:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="text-[13px] uppercase tracking-widest text-white/50 font-bold">Insider tip</div>
                    <div className="text-[15px] font-medium mt-1 max-w-[520px] leading-relaxed">
                      Visit at sunrise for the clearest Himalayan views, then explore the local temples before the
                      crowds arrive.
                    </div>
                  </div>
                  <button
                    onClick={() => setTab("Where to stay")}
                    className="h-10 px-5 rounded-full bg-white text-stone-900 text-sm font-semibold hover:bg-stone-100 transition"
                  >
                    Find stays →
                  </button>
                </div>
              </div>
            )}

            {tab === "Where to stay" && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {["All", "Hotels", "Homestays", "Resorts", "Budget"].map((m) => (
                    <button
                      key={m}
                      onClick={() => setTypeFilter(m)}
                      className={`h-8 px-4 rounded-full text-[13px] font-medium border whitespace-nowrap ${
                        typeFilter === m ? "bg-stone-900 text-white border-stone-900" : "bg-white border-stone-200 hover:border-stone-300"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                <div className="grid gap-4">
                  {filteredBusinesses.map((b) => (
                    <div
                      key={b.id}
                      className="group bg-white border border-stone-200 rounded-[20px] overflow-hidden flex flex-col sm:flex-row hover:shadow-[0_12px_32px_-12px_rgba(0,0,0,0.12)] hover:border-stone-300 transition"
                    >
                      <div className={`sm:w-[220px] h-[180px] sm:h-auto bg-gradient-to-br ${b.image} relative shrink-0`}>
                        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-bold">
                          {b.type}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                          <span className="px-2 py-1 rounded-full bg-black/40 glass text-white text-[11px] font-medium border border-white/15">
                            {b.tags[0]}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                            <Heart className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-[15px] leading-tight group-hover:text-emerald-700 transition">
                              {b.name}
                            </div>
                            <div className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {b.location}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <Star className="w-3 h-3 fill-emerald-600" /> {b.rating}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {b.tags.map((t) => (
                            <span key={t} className="px-2 py-1 rounded-full bg-stone-100 text-[11px] font-medium text-stone-600">
                              {t}
                            </span>
                          ))}
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div>
                            <span className="text-[16px] font-bold">{b.price}</span>
                            <span className="text-xs text-stone-500">/night</span>{" "}
                            {b.originalPrice && (
                              <span className="ml-2 text-xs line-through text-stone-400">{b.originalPrice}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => sendLead(b.id, "WhatsApp")}
                              className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:brightness-110"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => sendLead(b.id, "Call")}
                              className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/business/${b.id}`)}
                              className="h-8 px-4 rounded-full bg-white border border-stone-200 text-xs font-semibold hover:bg-stone-50"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "Map" && (
              <div className="rounded-[20px] border border-stone-200 overflow-hidden h-[520px] bg-stone-50 relative">
                <div className="absolute inset-0 grid place-items-center">
                  <div className="w-full h-full relative bg-[#eef2f1]">
                    <div
                      className="absolute inset-0 opacity-40"
                      style={{ backgroundImage: "radial-gradient(#cbd5d1 1px, transparent 1px)", backgroundSize: "24px 24px" }}
                    />
                    {businesses.map((b, i) => (
                      <div key={b.id} className="absolute" style={{ left: `${18 + i * 14}%`, top: `${22 + (i % 3) * 18}%` }}>
                        <div className="w-8 h-8 rounded-full bg-stone-900 text-white grid place-items-center shadow-lg border-2 border-white">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <div className="mt-1 px-2 py-1 rounded-full bg-white shadow text-[11px] font-semibold whitespace-nowrap border">
                          {b.name.split(" ")[0]}
                        </div>
                      </div>
                    ))}
                    <div className="absolute bottom-4 left-4 right-4 p-3 rounded-[14px] bg-white border shadow-lg flex items-center justify-between">
                      <div className="text-sm font-semibold flex items-center gap-2">
                        <Navigation2 className="w-4 h-4" /> {d.name} center • {businesses.length} pins
                      </div>
                      <button
                        onClick={() => showToast("Mapbox integration live in production")}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-stone-900 text-white"
                      >
                        Open in Maps
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {["Things to do", "Eat", "Packages", "Transport"].includes(tab) && (
              <div className="py-16 text-center border border-dashed border-stone-200 rounded-[20px] bg-stone-50/50">
                <div className="w-12 h-12 rounded-full bg-white border shadow-sm mx-auto grid place-items-center mb-3">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="font-semibold">{tab} • Curated list coming soon</div>
                <div className="text-sm text-stone-500 mt-1 max-w-[320px] mx-auto">
                  We verify every {tab.toLowerCase()} partner manually. Experiences in {d.name} are under review.
                </div>
              </div>
            )}
          </div>

          <div className="lg:sticky lg:top-[88px] h-fit space-y-4">
            <div className="rounded-[20px] border border-stone-200 overflow-hidden bg-[#fafaf8]">
              <div className="h-[180px] bg-stone-100 relative">
                <div className="absolute inset-0 bg-[#e8efe9] grid place-items-center">
                  <div className="text-[11px] font-bold tracking-widest text-stone-400">
                    MAP PREVIEW • {d.name.toUpperCase()}
                  </div>
                </div>
                <div className="absolute inset-0 p-3">
                  <div className="w-full h-full rounded-[14px] border border-stone-300/60 bg-white/70 glass relative overflow-hidden">
                    <div
                      className="absolute inset-0 opacity-50"
                      style={{ backgroundImage: "radial-gradient(#cbd5d1 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                    />
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 border-4 border-white shadow-xl grid place-items-center text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold">Stay near center</div>
                <div className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Most stays cluster around the main viewpoints — a short walk from the center.
                </div>
                <button onClick={() => setTab("Map")} className="mt-3 w-full h-9 rounded-full bg-stone-900 text-white text-sm font-semibold">
                  View larger map
                </button>
              </div>
            </div>

            <div className="rounded-[20px] border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
                <Award className="w-4 h-4" /> Verified by Overview
              </div>
              <div className="text-xs text-emerald-900/70 mt-2 leading-relaxed">
                Every listing is visited, photos verified, and WhatsApp response tested. No paid ranking.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
