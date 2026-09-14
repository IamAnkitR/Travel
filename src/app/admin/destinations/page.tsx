"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal from "@/components/admin/Modal";
import FormField, { inputClass, textareaClass } from "@/components/admin/FormField";

type AdminDestination = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  gradient: string;
  bestTime: string;
  budget: string;
  stay: string;
  altitude: string;
  rating: number;
  description: string;
  whyVisit: string[];
  tags: string[];
  order: number;
  stateId: string;
  stateName?: string;
  businessCount?: number;
};

type AdminState = { id: string; name: string };

const emptyForm = {
  slug: "",
  name: "",
  emoji: "",
  gradient: "",
  bestTime: "",
  budget: "",
  stay: "",
  altitude: "",
  rating: 4.5,
  description: "",
  whyVisit: "",
  tags: "",
  order: 0,
  stateId: "",
};

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<AdminDestination[]>([]);
  const [states, setStates] = useState<AdminState[]>([]);
  const [editing, setEditing] = useState<AdminDestination | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/admin/destinations").then((r) => r.json()).then((d) => setDestinations(d.destinations ?? []));

  useEffect(() => {
    load();
    fetch("/api/admin/states").then((r) => r.json()).then((d) => setStates(d.states ?? []));
  }, []);

  const openCreate = () => {
    setForm({ ...emptyForm, stateId: states[0]?.id ?? "" });
    setError("");
    setCreating(true);
  };

  const openEdit = (d: AdminDestination) => {
    setForm({
      slug: d.slug,
      name: d.name,
      emoji: d.emoji,
      gradient: d.gradient,
      bestTime: d.bestTime,
      budget: d.budget,
      stay: d.stay,
      altitude: d.altitude,
      rating: d.rating,
      description: d.description,
      whyVisit: d.whyVisit.join(", "),
      tags: d.tags.join(", "),
      order: d.order,
      stateId: d.stateId,
    });
    setError("");
    setEditing(d);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        whyVisit: form.whyVisit.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      };
      const url = editing ? `/api/admin/destinations/${editing.id}` : "/api/admin/destinations";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Save failed");
        return;
      }
      await load();
      close();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (d: AdminDestination) => {
    if (!confirm(`Delete destination "${d.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/destinations/${d.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Delete failed");
      return;
    }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Destinations</h1>
          <p className="text-stone-500 text-sm">Hill stations and towns, grouped under a state.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={states.length === 0}
          className="h-10 px-4 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> New destination
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">State</th>
              <th className="px-5 py-3 font-semibold">Rating</th>
              <th className="px-5 py-3 font-semibold">Stays</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {destinations.map((d) => (
              <tr key={d.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-medium whitespace-nowrap">
                  <button onClick={() => openEdit(d)} className="flex items-center gap-2 hover:text-emerald-700">
                    <span>{d.emoji}</span> {d.name}
                  </button>
                </td>
                <td className="px-5 py-3 text-stone-500">{d.stateName}</td>
                <td className="px-5 py-3 text-stone-500">{d.rating}</td>
                <td className="px-5 py-3 text-stone-500">{d.businessCount ?? 0}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(d)} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {destinations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                  No destinations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : "New destination"} onClose={close} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name">
                <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </FormField>
              <FormField label="Slug">
                <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Emoji">
                <input className={inputClass} value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
              </FormField>
              <FormField label="State">
                <select className={inputClass} value={form.stateId} onChange={(e) => setForm((f) => ({ ...f, stateId: e.target.value }))}>
                  {states.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="Rating">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  className={inputClass}
                  value={form.rating}
                  onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                />
              </FormField>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormField label="Best time">
                <input className={inputClass} value={form.bestTime} onChange={(e) => setForm((f) => ({ ...f, bestTime: e.target.value }))} />
              </FormField>
              <FormField label="Budget">
                <input className={inputClass} value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))} />
              </FormField>
              <FormField label="Typical stay">
                <input className={inputClass} value={form.stay} onChange={(e) => setForm((f) => ({ ...f, stay: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Altitude">
                <input className={inputClass} value={form.altitude} onChange={(e) => setForm((f) => ({ ...f, altitude: e.target.value }))} />
              </FormField>
              <FormField label="Order">
                <input
                  type="number"
                  className={inputClass}
                  value={form.order}
                  onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </FormField>
            </div>
            <FormField label="Gradient classes (Tailwind, e.g. from-emerald-800 via-green-700 to-stone-700)">
              <input className={inputClass} value={form.gradient} onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))} />
            </FormField>
            <FormField label="Description">
              <textarea rows={3} className={textareaClass} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </FormField>
            <FormField label="Why visit (comma-separated)">
              <input className={inputClass} value={form.whyVisit} onChange={(e) => setForm((f) => ({ ...f, whyVisit: e.target.value }))} />
            </FormField>
            <FormField label="Tags (comma-separated, e.g. Mountains, Adventure)">
              <input className={inputClass} value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} />
            </FormField>
            {error && <div className="text-xs text-red-600">{error}</div>}
            <button
              onClick={save}
              disabled={saving || !form.name || !form.slug || !form.stateId}
              className="w-full h-10 rounded-full bg-stone-900 text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
