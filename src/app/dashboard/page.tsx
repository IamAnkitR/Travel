"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChartColumn, Eye, MessageCircle, Phone, TrendingUp } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import type { ApiDashboard, ApiBusiness } from "@/lib/types";

export default function DashboardPage() {
  const { showToast } = useToast();
  const [dashboard, setDashboard] = useState<ApiDashboard | null>(null);
  const [business, setBusiness] = useState<ApiBusiness | null>(null);
  const [form, setForm] = useState({ name: "", price: "", type: "", description: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((data: ApiDashboard) => {
        setDashboard(data);
        setForm({
          name: data.business.name,
          price: String(data.business.price),
          type: data.business.type,
          description: data.business.description,
        });
      })
      .catch(() => setDashboard(null));
  }, []);

  useEffect(() => {
    if (!dashboard) return;
    fetch(`/api/businesses/${dashboard.business.id}`)
      .then((r) => r.json())
      .then((data) => setBusiness(data.business))
      .catch(() => setBusiness(null));
  }, [dashboard]);

  const save = async () => {
    if (!dashboard) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/businesses/${dashboard.business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          type: form.type,
          description: form.description,
        }),
      });
      if (res.ok) showToast("Listing updated");
    } finally {
      setSaving(false);
    }
  };

  if (!dashboard) {
    return <div className="min-h-screen bg-[#fcfbf8] flex items-center justify-center text-stone-400">Loading…</div>;
  }

  const stats = [
    { label: "Profile views", value: dashboard.stats.profileViews.toLocaleString("en-IN"), change: "+18%", icon: Eye },
    { label: "WhatsApp leads", value: String(dashboard.stats.whatsappLeads), change: "+12%", icon: MessageCircle },
    { label: "Calls", value: String(dashboard.stats.calls), change: "+4%", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-[#fcfbf8]">
      <div className="sticky top-0 z-30 bg-white border-b border-stone-200">
        <div className="max-w-[1080px] mx-auto px-6 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 grid place-items-center">
                <ChartColumn className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Overview for Business</span>
            </div>
          </div>
          <div className="px-3 h-7 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center">
            {dashboard.business.name} • Verified
          </div>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((m) => (
            <div key={m.label} className="bg-white border border-stone-200 rounded-[20px] p-5">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-full bg-stone-100 grid place-items-center">
                  <m.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">{m.change}</span>
              </div>
              <div className="mt-4 text-[28px] font-bold tracking-tight">{m.value}</div>
              <div className="text-sm text-stone-500">{m.label} • last 30 days</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          <div className="bg-white border border-stone-200 rounded-[20px] p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold">Listing editor</h3>
              <span className="text-xs px-2.5 py-1 rounded-full bg-stone-900 text-white font-medium">Live</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">Business name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="mt-1.5 w-full h-10 px-3 rounded-[12px] border border-stone-200 bg-white text-sm font-medium outline-none focus:border-stone-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">Price/night</label>
                  <input
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value.replace(/[^0-9]/g, "") }))}
                    className="mt-1.5 w-full h-10 px-3 rounded-[12px] border border-stone-200 bg-white text-sm outline-none focus:border-stone-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="mt-1.5 w-full h-10 px-3 rounded-[12px] border border-stone-200 bg-white text-sm outline-none focus:border-stone-400"
                  >
                    {["Hotel", "Resort", "Homestay", "Budget"].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-stone-400">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="mt-1.5 w-full p-3 rounded-[12px] border border-stone-200 bg-white text-sm leading-relaxed text-stone-600 outline-none focus:border-stone-400"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={save}
                  disabled={saving}
                  className="h-10 px-5 rounded-full bg-stone-900 text-white text-sm font-semibold disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                  onClick={() => business && showToast(`Previewing ${business.name}`)}
                  className="h-10 px-5 rounded-full border border-stone-200 text-sm font-medium"
                >
                  Preview
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-stone-900 text-white rounded-[20px] p-5">
              <div className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Growth tip
              </div>
              <div className="text-sm text-white/70 mt-2 leading-relaxed">
                Add 3 more photos of rooms — listings with 8+ photos get 2.3x more WhatsApp leads.
              </div>
              <button
                onClick={() => showToast("Photo upload coming soon")}
                className="mt-4 h-9 px-4 rounded-full bg-white text-stone-900 text-sm font-semibold"
              >
                Upload photos
              </button>
            </div>
            <div className="bg-white border border-stone-200 rounded-[20px] p-5">
              <div className="text-sm font-semibold">Recent leads</div>
              <div className="mt-4 space-y-3">
                {dashboard.recentLeads.length === 0 && (
                  <div className="text-xs text-stone-400">No leads yet</div>
                )}
                {dashboard.recentLeads.map((l) => (
                  <div key={l.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-stone-100 grid place-items-center text-xs font-bold">
                        {l.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{l.name}</div>
                        <div className="text-xs text-stone-500">{new Date(l.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                        l.type === "WhatsApp" ? "bg-[#25D366]/15 text-[#128C7E]" : "bg-stone-100 text-stone-600"
                      }`}
                    >
                      {l.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
