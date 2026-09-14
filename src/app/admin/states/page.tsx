"use client";

import { useEffect, useState } from "react";
import { Plus, Star, Trash2 } from "lucide-react";
import Modal from "@/components/admin/Modal";
import FormField, { inputClass } from "@/components/admin/FormField";

type AdminState = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  gradient: string;
  featured: boolean;
  order: number;
  destinationCount?: number;
};

const emptyForm = { slug: "", name: "", emoji: "", gradient: "", featured: false, order: 0 };

export default function AdminStatesPage() {
  const [states, setStates] = useState<AdminState[]>([]);
  const [editing, setEditing] = useState<AdminState | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/admin/states").then((r) => r.json()).then((d) => setStates(d.states ?? []));

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setCreating(true);
  };

  const openEdit = (s: AdminState) => {
    setForm({ slug: s.slug, name: s.name, emoji: s.emoji, gradient: s.gradient, featured: s.featured, order: s.order });
    setError("");
    setEditing(s);
  };

  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const url = editing ? `/api/admin/states/${editing.id}` : "/api/admin/states";
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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

  const remove = async (s: AdminState) => {
    if (!confirm(`Delete state "${s.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/states/${s.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed");
      return;
    }
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">States</h1>
          <p className="text-stone-500 text-sm">Top-level regions shown on the India page.</p>
        </div>
        <button onClick={openCreate} className="h-10 px-4 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New state
        </button>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Slug</th>
              <th className="px-5 py-3 font-semibold">Destinations</th>
              <th className="px-5 py-3 font-semibold">Featured</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr key={s.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-medium">
                  <button onClick={() => openEdit(s)} className="flex items-center gap-2 hover:text-emerald-700">
                    <span>{s.emoji}</span> {s.name}
                  </button>
                </td>
                <td className="px-5 py-3 text-stone-500">{s.slug}</td>
                <td className="px-5 py-3 text-stone-500">{s.destinationCount ?? 0}</td>
                <td className="px-5 py-3">
                  {s.featured && <Star className="w-4 h-4 fill-emerald-600 text-emerald-600" />}
                </td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(s)} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {states.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                  No states yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <Modal title={editing ? `Edit ${editing.name}` : "New state"} onClose={close}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Name">
                <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </FormField>
              <FormField label="Slug">
                <input className={inputClass} value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Emoji">
                <input className={inputClass} value={form.emoji} onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))} />
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
            <FormField label="Gradient classes (Tailwind)">
              <input
                className={inputClass}
                placeholder="from-emerald-700 to-green-900"
                value={form.gradient}
                onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
              />
            </FormField>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} />
              Featured on India page
            </label>
            {error && <div className="text-xs text-red-600">{error}</div>}
            <button
              onClick={save}
              disabled={saving || !form.name || !form.slug}
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
