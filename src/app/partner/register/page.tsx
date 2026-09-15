"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass, Plus, Trash2 } from "lucide-react";
import FormField, { inputClass } from "@/components/admin/FormField";
import { CATEGORIES, CATEGORY_TYPES } from "@/lib/categories";

type DestinationOption = { id: string; name: string };
type ScopeRow = { destinationId: string; category: string; type: string };

const EMPTY_ACCOUNT = { businessName: "", contactName: "", email: "", phone: "", password: "" };

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [scopes, setScopes] = useState<ScopeRow[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/partner/destinations")
      .then((r) => r.json())
      .then((d) => {
        const opts: DestinationOption[] = d.destinations ?? [];
        setDestinations(opts);
        setScopes([{ destinationId: opts[0]?.id ?? "", category: "Stay", type: CATEGORY_TYPES.Stay[0] }]);
      });
  }, []);

  const addScope = () => {
    setScopes((s) => [...s, { destinationId: destinations[0]?.id ?? "", category: "Stay", type: CATEGORY_TYPES.Stay[0] }]);
  };

  const updateScope = (i: number, patch: Partial<ScopeRow>) => {
    setScopes((s) =>
      s.map((row, j) => {
        if (j !== i) return row;
        const next = { ...row, ...patch };
        if (patch.category && !CATEGORY_TYPES[patch.category].includes(next.type)) {
          next.type = CATEGORY_TYPES[patch.category][0];
        }
        return next;
      })
    );
  };

  const removeScope = (i: number) => setScopes((s) => s.filter((_, j) => j !== i));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...account, scopes }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Registration failed");
        return;
      }
      router.push("/partner");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-[520px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
          <Compass className="w-4 h-4" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-1">List your business</h1>
        <p className="text-sm text-stone-500 mb-5">
          Submit a request to join Overview. An admin reviews and approves each destination/category before you can
          publish listings for it.
        </p>

        <div className="space-y-3">
          <FormField label="Business name">
            <input className={inputClass} required value={account.businessName} onChange={(e) => setAccount((f) => ({ ...f, businessName: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Your name">
              <input className={inputClass} required value={account.contactName} onChange={(e) => setAccount((f) => ({ ...f, contactName: e.target.value }))} />
            </FormField>
            <FormField label="Phone (optional)">
              <input className={inputClass} value={account.phone} onChange={(e) => setAccount((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Email">
            <input type="email" className={inputClass} required value={account.email} onChange={(e) => setAccount((f) => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label="Password (min 8 characters)">
            <input
              type="password"
              className={inputClass}
              required
              minLength={8}
              value={account.password}
              onChange={(e) => setAccount((f) => ({ ...f, password: e.target.value }))}
            />
          </FormField>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                Destinations & categories
              </span>
              <button type="button" onClick={addScope} className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add another
              </button>
            </div>
            <div className="space-y-2">
              {scopes.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_28px] gap-2 items-center">
                  <select className={inputClass} value={row.destinationId} onChange={(e) => updateScope(i, { destinationId: e.target.value })}>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <select className={inputClass} value={row.category} onChange={(e) => updateScope(i, { category: e.target.value })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <select className={inputClass} value={row.type} onChange={(e) => updateScope(i, { type: e.target.value })}>
                    {CATEGORY_TYPES[row.category].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {scopes.length > 1 && (
                    <button type="button" onClick={() => removeScope(i)} className="w-7 h-7 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 flex items-center justify-center">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-2">
              Each row needs separate admin approval. You can request more later from your dashboard.
            </p>
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading || scopes.some((s) => !s.destinationId)}
            className="w-full h-11 rounded-full bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Submitting…" : "Submit registration"}
          </button>
          <div className="text-center text-xs text-stone-500">
            Already registered?{" "}
            <Link href="/partner/login" className="font-semibold text-emerald-700">
              Log in
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
