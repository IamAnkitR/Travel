"use client";

import { useState } from "react";
import Link from "next/link";
import { Compass, MailCheck } from "lucide-react";
import FormField, { inputClass } from "@/components/admin/FormField";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/partner/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error || "Something went wrong");
        return;
      }
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="w-full max-w-[360px] bg-white border border-stone-200 rounded-[20px] p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-4">
          <Compass className="w-4 h-4" />
        </div>

        {sent ? (
          <>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <MailCheck className="w-5 h-5" />
            </div>
            <h1 className="text-[20px] font-bold tracking-tight mb-1">Check your email</h1>
            <p className="text-sm text-stone-500">
              If <strong>{email}</strong> is registered, we&apos;ve sent a link to reset your password. It expires in 1
              hour.
            </p>
            <Link href="/partner/login" className="inline-block mt-5 text-sm font-semibold text-emerald-700">
              Back to login
            </Link>
          </>
        ) : (
          <form onSubmit={submit}>
            <h1 className="text-[20px] font-bold tracking-tight mb-1">Forgot password</h1>
            <p className="text-sm text-stone-500 mb-5">Enter your account email and we&apos;ll send a reset link.</p>
            <div className="space-y-3">
              <FormField label="Email">
                <input type="email" autoFocus className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
              </FormField>
              {error && <div className="text-xs text-red-600">{error}</div>}
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 rounded-full bg-stone-900 text-white font-semibold text-sm disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>
              <div className="text-center text-xs text-stone-500">
                <Link href="/partner/login" className="font-semibold text-emerald-700">
                  Back to login
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
