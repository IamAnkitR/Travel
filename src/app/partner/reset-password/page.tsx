"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass } from "lucide-react";
import FormField, { inputClass } from "@/components/admin/FormField";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/partner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Reset failed");
        return;
      }
      router.push("/partner");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 text-center">
        <div className="w-full max-w-[360px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
          <h1 className="text-[20px] font-bold tracking-tight mb-2">Missing reset link</h1>
          <p className="text-sm text-stone-500 mb-4">Use the link from your password reset email, or request a new one.</p>
          <Link href="/partner/forgot-password" className="text-sm font-semibold text-emerald-700">
            Request a reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[360px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
          <Compass className="w-4 h-4" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-1">Set a new password</h1>
        <p className="text-sm text-stone-500 mb-5">This link works once and expires in 1 hour.</p>
        <div className="space-y-3">
          <FormField label="New password (min 8 characters)">
            <input
              type="password"
              autoFocus
              className={inputClass}
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormField>
          <FormField label="Confirm password">
            <input type="password" className={inputClass} minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </FormField>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading || password.length < 8 || !confirm}
            className="w-full h-11 rounded-full bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Saving…" : "Reset password"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
