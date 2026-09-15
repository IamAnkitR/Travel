"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, ChartColumn, MapPin, MessageCircle, UserCheck } from "lucide-react";

type Summary = {
  counts: { states: number; destinations: number; businesses: number; leads: number; pendingRegistrations: number };
  recentLeads: { id: string; guestName: string; channel: string; createdAt: string; businessName: string }[];
};

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary(null));
  }, []);

  const cards = [
    {
      label: "Pending registrations",
      value: summary?.counts.pendingRegistrations,
      href: "/admin/registrations",
      icon: UserCheck,
      highlight: !!summary?.counts.pendingRegistrations,
    },
    { label: "States", value: summary?.counts.states, href: "/admin/states", icon: MapPin },
    { label: "Destinations", value: summary?.counts.destinations, href: "/admin/destinations", icon: ChartColumn },
    { label: "Businesses", value: summary?.counts.businesses, href: "/admin/businesses", icon: Building2 },
    { label: "Leads", value: summary?.counts.leads, href: "/admin/leads", icon: MessageCircle },
  ];

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1">Overview</h1>
      <p className="text-stone-500 text-sm mb-8">Manage everything on the site from here.</p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`border rounded-[16px] p-5 hover:shadow-md transition ${
              c.highlight ? "bg-amber-50 border-amber-200" : "bg-white border-stone-200"
            }`}
          >
            <div className={`w-9 h-9 rounded-full grid place-items-center mb-3 ${c.highlight ? "bg-amber-100" : "bg-stone-100"}`}>
              <c.icon className="w-4 h-4" />
            </div>
            <div className="text-[26px] font-bold tracking-tight">{c.value ?? "—"}</div>
            <div className="text-sm text-stone-500">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] p-5">
        <h2 className="font-semibold mb-4">Recent leads</h2>
        <div className="space-y-3">
          {summary?.recentLeads.length === 0 && <div className="text-sm text-stone-400">No leads yet.</div>}
          {summary?.recentLeads.map((l) => (
            <div key={l.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="font-medium">{l.guestName}</span>{" "}
                <span className="text-stone-400">→ {l.businessName}</span>
              </div>
              <div className="flex items-center gap-3 text-stone-500">
                <span>{l.channel}</span>
                <span>{new Date(l.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        <Link href="/admin/leads" className="inline-block mt-4 text-sm font-semibold text-emerald-700">
          View all leads →
        </Link>
      </div>
    </div>
  );
}
