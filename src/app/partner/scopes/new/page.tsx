"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FormField, { inputClass } from "@/components/admin/FormField";
import { CATEGORIES, CATEGORY_TYPES } from "@/lib/categories";

type DestinationOption = { id: string; name: string };

export default function NewScopePage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [destinationId, setDestinationId] = useState("");
  const [category, setCategory] = useState("Stay");
  const [type, setType] = useState(CATEGORY_TYPES.Stay[0]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/partner/destinations")
      .then((r) => r.json())
      .then((d) => {
        setDestinations(d.destinations ?? []);
        setDestinationId(d.destinations?.[0]?.id ?? "");
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinationId, category, type }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Request failed");
        return;
      }
      router.push("/partner");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[480px]">
      <h1 className="text-[24px] font-bold tracking-tight mb-1">Request another destination/category</h1>
      <p className="text-stone-500 text-sm mb-6">This needs a separate admin approval before you can publish under it.</p>

      <form onSubmit={submit} className="bg-white border border-stone-200 rounded-[16px] p-6 space-y-4">
        <FormField label="Destination">
          <select className={inputClass} value={destinationId} onChange={(e) => setDestinationId(e.target.value)}>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Category">
            <select
              className={inputClass}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setType(CATEGORY_TYPES[e.target.value][0]);
              }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Type">
            <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
              {CATEGORY_TYPES[category].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        {error && <div className="text-xs text-red-600">{error}</div>}
        <button
          type="submit"
          disabled={loading || !destinationId}
          className="w-full h-11 rounded-full bg-stone-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          {loading ? "Submitting…" : "Submit request"}
        </button>
      </form>
    </div>
  );
}
