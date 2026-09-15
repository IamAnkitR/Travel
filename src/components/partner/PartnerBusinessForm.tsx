"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import FormField, { inputClass, textareaClass } from "@/components/admin/FormField";

type RoomForm = { name: string; price: number; size: string; guests: string };
type AmenityForm = { label: string; icon: string };
type HostForm = { name: string; title: string; yearsOnPlatform: number; responseTime: string };

export type PartnerBusinessFormValue = {
  slug: string;
  name: string;
  location: string;
  description: string;
  price: number;
  originalPrice: number | null;
  image: string;
  tags: string;
  rooms: RoomForm[];
  amenities: AmenityForm[];
  host: HostForm | null;
};

const EMPTY: PartnerBusinessFormValue = {
  slug: "",
  name: "",
  location: "",
  description: "",
  price: 0,
  originalPrice: null,
  image: "",
  tags: "",
  rooms: [],
  amenities: [],
  host: null,
};

const AMENITY_ICON_OPTIONS = ["Mountain", "Wifi", "Utensils", "ParkingSquare", "Flame", "PawPrint"];

export default function PartnerBusinessForm({
  initial,
  businessId,
  lockedLabel,
}: {
  initial?: Partial<PartnerBusinessFormValue>;
  businessId?: string;
  lockedLabel: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<PartnerBusinessFormValue>({ ...EMPTY, ...initial });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean) };
      const url = businessId ? `/api/partner/businesses/${businessId}` : "/api/partner/businesses";
      const res = await fetch(url, {
        method: businessId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Save failed");
        return;
      }
      router.push("/partner");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!businessId) return;
    if (!confirm(`Delete "${form.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/partner/businesses/${businessId}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    router.push("/partner");
    router.refresh();
  };

  return (
    <div className="space-y-6 max-w-[640px]">
      <div className="bg-emerald-50 border border-emerald-200 rounded-[14px] px-4 py-2.5 text-sm text-emerald-800">
        This listing is locked to <strong>{lockedLabel}</strong>.
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Name">
            <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </FormField>
          <FormField label="Slug">
            <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} disabled={!!businessId} />
          </FormField>
        </div>
        <FormField label="Location">
          <input className={inputClass} value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
        </FormField>
        <FormField label="Description">
          <textarea rows={3} className={textareaClass} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price/night (₹)">
            <input
              type="number"
              className={inputClass}
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
            />
          </FormField>
          <FormField label="Original price (optional)">
            <input
              type="number"
              className={inputClass}
              value={form.originalPrice ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, originalPrice: e.target.value ? Number(e.target.value) : null }))}
            />
          </FormField>
        </div>
        <FormField label="Image gradient classes (Tailwind, e.g. from-emerald-900 to-stone-800)">
          <input className={inputClass} value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
        </FormField>
        <FormField label="Tags (comma-separated)">
          <input className={inputClass} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
        </FormField>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Rooms</h3>
          <button
            onClick={() => setForm((f) => ({ ...f, rooms: [...f.rooms, { name: "", price: form.price, size: "", guests: "" }] }))}
            className="text-xs font-semibold text-emerald-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add room
          </button>
        </div>
        <div className="space-y-2">
          {form.rooms.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_100px_100px_100px_32px] gap-2 items-center">
              <input
                className={inputClass}
                placeholder="Room name"
                value={r.name}
                onChange={(e) => setForm((f) => ({ ...f, rooms: f.rooms.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))}
              />
              <input
                type="number"
                className={inputClass}
                placeholder="Price"
                value={r.price}
                onChange={(e) => setForm((f) => ({ ...f, rooms: f.rooms.map((x, j) => (j === i ? { ...x, price: Number(e.target.value) } : x)) }))}
              />
              <input
                className={inputClass}
                placeholder="Size"
                value={r.size}
                onChange={(e) => setForm((f) => ({ ...f, rooms: f.rooms.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)) }))}
              />
              <input
                className={inputClass}
                placeholder="Guests"
                value={r.guests}
                onChange={(e) => setForm((f) => ({ ...f, rooms: f.rooms.map((x, j) => (j === i ? { ...x, guests: e.target.value } : x)) }))}
              />
              <button onClick={() => setForm((f) => ({ ...f, rooms: f.rooms.filter((_, j) => j !== i) }))} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {form.rooms.length === 0 && <div className="text-xs text-stone-400">No rooms added.</div>}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Amenities</h3>
          <button
            onClick={() => setForm((f) => ({ ...f, amenities: [...f.amenities, { label: "", icon: "Wifi" }] }))}
            className="text-xs font-semibold text-emerald-700 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Add amenity
          </button>
        </div>
        <div className="space-y-2">
          {form.amenities.map((a, i) => (
            <div key={i} className="grid grid-cols-[1fr_140px_32px] gap-2 items-center">
              <input
                className={inputClass}
                placeholder="Label"
                value={a.label}
                onChange={(e) => setForm((f) => ({ ...f, amenities: f.amenities.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) }))}
              />
              <select
                className={inputClass}
                value={a.icon}
                onChange={(e) => setForm((f) => ({ ...f, amenities: f.amenities.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)) }))}
              >
                {AMENITY_ICON_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <button onClick={() => setForm((f) => ({ ...f, amenities: f.amenities.filter((_, j) => j !== i) }))} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 flex items-center justify-center">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {form.amenities.length === 0 && <div className="text-xs text-stone-400">No amenities added.</div>}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Host</h3>
          {form.host ? (
            <button onClick={() => setForm((f) => ({ ...f, host: null }))} className="text-xs font-semibold text-red-600">
              Remove host
            </button>
          ) : (
            <button
              onClick={() => setForm((f) => ({ ...f, host: { name: "", title: "Host", yearsOnPlatform: 1, responseTime: "Response in 1 hour" } }))}
              className="text-xs font-semibold text-emerald-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add host
            </button>
          )}
        </div>
        {form.host && (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name">
              <input className={inputClass} value={form.host.name} onChange={(e) => setForm((f) => ({ ...f, host: f.host && { ...f.host, name: e.target.value } }))} />
            </FormField>
            <FormField label="Title">
              <input className={inputClass} value={form.host.title} onChange={(e) => setForm((f) => ({ ...f, host: f.host && { ...f.host, title: e.target.value } }))} />
            </FormField>
            <FormField label="Years on platform">
              <input
                type="number"
                className={inputClass}
                value={form.host.yearsOnPlatform}
                onChange={(e) => setForm((f) => ({ ...f, host: f.host && { ...f.host, yearsOnPlatform: Number(e.target.value) } }))}
              />
            </FormField>
            <FormField label="Response time">
              <input
                className={inputClass}
                value={form.host.responseTime}
                onChange={(e) => setForm((f) => ({ ...f, host: f.host && { ...f.host, responseTime: e.target.value } }))}
              />
            </FormField>
          </div>
        )}
        {!form.host && <div className="text-xs text-stone-400">No host set.</div>}
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center gap-2">
        <button
          onClick={save}
          disabled={saving || !form.name || !form.slug}
          className="h-11 px-6 rounded-full bg-stone-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {businessId && (
          <button onClick={remove} className="h-11 px-6 rounded-full border border-red-200 text-red-600 text-sm font-semibold">
            Delete listing
          </button>
        )}
      </div>
    </div>
  );
}
