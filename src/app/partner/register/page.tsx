"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";
import FormField, { inputClass } from "@/components/admin/FormField";

type DestinationOption = { id: string; name: string };

const TYPES = ["Hotel", "Resort", "Homestay", "Budget"];

const EMPTY = {
  businessName: "",
  contactName: "",
  email: "",
  phone: "",
  password: "",
  destinationId: "",
  type: "Hotel",
};

export default function PartnerRegisterPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<DestinationOption[]>([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/destinations")
      .then((r) => r.json())
      .then((d) => {
        const opts = (d.destinations ?? []).map((x: { id: string; name: string }) => ({ id: x.id, name: x.name }));
        setDestinations(opts);
        setForm((f) => (f.destinationId ? f : { ...f, destinationId: opts[0]?.id ?? "" }));
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      <form onSubmit={submit} className="w-full max-w-[440px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
          <Compass className="w-4 h-4" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-1">List your business</h1>
        <p className="text-sm text-stone-500 mb-5">
          Submit a request to join Overview. An admin will review and approve it before you can publish listings.
        </p>

        <div className="space-y-3">
          <FormField label="Business name">
            <input className={inputClass} required value={form.businessName} onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Your name">
              <input className={inputClass} required value={form.contactName} onChange={(e) => setForm((f) => ({ ...f, contactName: e.target.value }))} />
            </FormField>
            <FormField label="Phone (optional)">
              <input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </FormField>
          </div>
          <FormField label="Email">
            <input type="email" className={inputClass} required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </FormField>
          <FormField label="Password (min 8 characters)">
            <input
              type="password"
              className={inputClass}
              required
              minLength={8}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Destination">
              <select className={inputClass} value={form.destinationId} onChange={(e) => setForm((f) => ({ ...f, destinationId: e.target.value }))}>
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Category">
              <select className={inputClass} value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          <p className="text-xs text-stone-400">
            Your listings will only be allowed in <strong>{destinations.find((d) => d.id === form.destinationId)?.name || "this destination"}</strong>{" "}
            under the <strong>{form.type}</strong> category — this can&apos;t be changed later without admin approval.
          </p>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading || !form.destinationId}
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
