"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";
import FormField, { inputClass } from "@/components/admin/FormField";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Login failed");
        return;
      }
      router.push(params.get("next") || "/partner");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
          <Compass className="w-4 h-4" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-1">Partner login</h1>
        <p className="text-sm text-stone-500 mb-5">Manage your listings and leads.</p>
        <div className="space-y-3">
          <FormField label="Email">
            <input type="email" autoFocus className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
          <FormField label="Password">
            <input type="password" className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
          </FormField>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full h-11 rounded-full bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <div className="text-center text-xs text-stone-500">
            New here?{" "}
            <Link href="/partner/register" className="font-semibold text-emerald-700">
              Register your business
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function PartnerLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
