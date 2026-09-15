"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, ChevronRight, Heart, MapPin, MessageCircle, Navigation2, Phone, Share2, Star, Users } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { useLeadAction } from "@/lib/useLeadAction";
import { AmenityIcon } from "@/lib/amenityIcons";
import type { ApiBusiness } from "@/lib/types";

export default function BusinessPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;
  const { showToast } = useToast();
  const sendLead = useLeadAction();

  const [business, setBusiness] = useState<ApiBusiness | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/businesses/${slug}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setBusiness(data.business))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center text-stone-500">
        Listing not found.
      </div>
    );
  }

  if (!business) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-stone-400">Loading…</div>;
  }

  const b = business;

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-30 bg-white/80 glass border-b border-stone-200">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (b.destination ? router.push(`/destination/${b.destination.id}`) : router.back())}
              className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-[13px] font-medium text-stone-500">
              <span className="px-2.5 py-1 rounded-full bg-stone-100">Business</span> <ChevronRight className="w-3 h-3" /> {b.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => showToast("Link copied")} className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFavorited((f) => !f)}
              className={`w-9 h-9 rounded-full border flex items-center justify-center ${
                favorited ? "bg-stone-900 text-white border-stone-900" : "border-stone-200"
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? "fill-white" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-3 rounded-[24px] overflow-hidden">
          <div className={`h-[380px] lg:h-[460px] bg-gradient-to-br ${b.image} relative`}>
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/40 glass border border-white/15 text-white text-xs font-medium">
              1 / 4 • Verified photos
            </div>
            <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-emerald-500 text-white text-[11px] font-bold tracking-widest flex items-center gap-1">
              <Award className="w-3 h-3" /> VERIFIED BY OVERVIEW
            </div>
          </div>
          <div className="grid grid-rows-2 gap-3">
            <div className="h-[180px] lg:h-[224px] bg-gradient-to-br from-stone-200 to-stone-300 grid place-items-center text-stone-400 text-xs font-bold tracking-widest">
              GALLERY 2
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-zinc-700 to-stone-800 grid place-items-center text-white/50 text-xs font-bold">
                GALLERY 3
              </div>
              <div className="bg-gradient-to-br from-emerald-900 to-stone-900 grid place-items-center text-white/60 text-xs font-bold relative">
                <span>+12 more</span>
                <div className="absolute inset-0 bg-black/40" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 lg:gap-10">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-[28px] lg:text-[34px] font-bold tracking-tight leading-tight font-display">{b.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {b.location}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-stone-300" />
                  <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <Star className="w-4 h-4 fill-emerald-600" /> {b.rating} ({b.reviews})
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[22px] font-bold">
                  {b.price}
                  <span className="text-sm font-normal text-stone-500">/night</span>
                </div>
                <div className="text-xs text-stone-500">incl. taxes • Free cancellation</div>
              </div>
            </div>

            <div className="mt-8 space-y-8">
              <div>
                <h3 className="font-semibold mb-3">About this stay</h3>
                <p className="text-[14px] leading-relaxed text-stone-600">{b.description}</p>
              </div>

              {b.amenities && b.amenities.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {b.amenities.map((a) => (
                      <div key={a.label} className="h-10 px-3 rounded-full border border-stone-200 bg-white flex items-center gap-2 text-[13px] font-medium">
                        <span className="w-6 h-6 rounded-full bg-stone-100 grid place-items-center text-[12px]">
                          <AmenityIcon icon={a.icon} className="w-3.5 h-3.5" />
                        </span>{" "}
                        {a.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {b.rooms && b.rooms.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Rooms</h3>
                  <div className="grid gap-3">
                    {b.rooms.map((r) => (
                      <div key={r.name} className="p-4 rounded-[16px] border border-stone-200 flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{r.name}</div>
                          <div className="text-xs text-stone-500 mt-1">
                            {r.size} • {r.guests} • Free breakfast
                          </div>
                        </div>
                        <div className="text-sm font-bold">{r.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {b.host && (
                <div className="rounded-[16px] border border-stone-200 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-stone-900 text-white grid place-items-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold">Hosted by {b.host.name}</div>
                    <div className="text-xs text-stone-500">
                      {b.host.title} • {b.host.yearsOnPlatform} years on Overview • {b.host.responseTime}
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
            </div>
          </div>

          <div className="lg:sticky lg:top-[88px] h-fit space-y-4">
            <div className="rounded-[20px] border border-stone-200 p-5 bg-white shadow-[0_12px_32px_-16px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold">Check availability</div>
                <div className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Verified</div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="p-3 rounded-[12px] bg-stone-50 border border-stone-200">
                  <div className="text-[11px] uppercase tracking-widest text-stone-400 font-bold">Check-in</div>
                  <div className="text-sm font-semibold mt-1">12 Mar</div>
                </div>
                <div className="p-3 rounded-[12px] bg-stone-50 border border-stone-200">
                  <div className="text-[11px] uppercase tracking-widest text-stone-400 font-bold">Guests</div>
                  <div className="text-sm font-semibold mt-1">2 guests</div>
                </div>
              </div>
              <button
                onClick={() => sendLead(b.id, "Call")}
                className="w-full h-11 rounded-full bg-stone-900 text-white font-semibold text-sm hover:bg-black transition"
              >
                Request Booking
              </button>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => sendLead(b.id, "WhatsApp")}
                  className="h-10 rounded-full bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </button>
                <button
                  onClick={() => sendLead(b.id, "Call")}
                  className="h-10 rounded-full border border-stone-200 font-semibold text-sm flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-4 h-4" /> Call
                </button>
              </div>
              <div className="mt-3 text-[11px] text-stone-500 text-center">No booking fees • Direct to owner • Overview verifies response</div>
            </div>

            <div className="rounded-[20px] border border-stone-200 bg-stone-50 p-4">
              <div className="text-sm font-semibold flex items-center gap-2">
                <Navigation2 className="w-4 h-4" /> Location
              </div>
              <div className="mt-3 h-[140px] rounded-[14px] bg-white border border-stone-200 grid place-items-center text-[11px] font-bold tracking-widest text-stone-400">
                MAP • {b.location.toUpperCase()}
              </div>
              <button
                onClick={() => showToast("Directions opened in maps")}
                className="mt-3 w-full h-9 rounded-full bg-white border border-stone-200 text-sm font-medium"
              >
                Get Directions
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 p-3 bg-white/90 glass border-t border-stone-200 flex gap-2">
        <button onClick={() => showToast("Directions opened")} className="flex-1 h-11 rounded-full border border-stone-200 bg-white font-semibold text-sm">
          Directions
        </button>
        <button onClick={() => sendLead(b.id, "WhatsApp")} className="flex-1 h-11 rounded-full bg-[#25D366] text-white font-semibold text-sm">
          WhatsApp
        </button>
        <button onClick={() => sendLead(b.id, "Call")} className="flex-1 h-11 rounded-full bg-stone-900 text-white font-semibold text-sm">
          Book
        </button>
      </div>

      <div className="border-t border-stone-200 bg-white mt-12">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-semibold">Overview</span>
            <span className="text-stone-400 ml-2">Explore anywhere. Understand everything.</span>
          </Link>
          <div className="flex items-center gap-5 text-stone-500">
            <Link href="/partner" className="hover:text-stone-900 font-medium">
              For Businesses
            </Link>
            <Link href="/" className="hover:text-stone-900">
              Globe
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
