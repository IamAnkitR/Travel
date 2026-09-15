"use client";

import { useEffect, useState } from "react";
import { Check, Trash2, X } from "lucide-react";

type Scope = {
  id: string;
  category: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  destinationName?: string;
};

type AdminAccount = {
  id: string;
  email: string;
  contactName: string;
  businessName: string;
  createdAt: string;
  scopes: Scope[];
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminRegistrationsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [filter, setFilter] = useState<"PENDING" | "ALL">("PENDING");

  const load = () => fetch("/api/admin/business-accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));

  useEffect(() => {
    load();
  }, []);

  const reviewScope = async (scope: Scope, status: "APPROVED" | "REJECTED") => {
    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      rejectionReason = prompt("Reason for rejection (emailed to the business):") || undefined;
      if (rejectionReason === undefined) return;
    }
    await fetch(`/api/admin/account-scopes/${scope.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    load();
  };

  const deleteAccount = async (account: AdminAccount) => {
    if (!confirm(`Delete "${account.businessName}" entirely? This removes all their scope requests.`)) return;
    const res = await fetch(`/api/admin/business-accounts/${account.id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      alert(d.error || "Delete failed");
      return;
    }
    load();
  };

  const visible = accounts
    .map((a) => ({ ...a, scopes: filter === "PENDING" ? a.scopes.filter((s) => s.status === "PENDING") : a.scopes }))
    .filter((a) => filter === "ALL" || a.scopes.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Registrations</h1>
          <p className="text-stone-500 text-sm">Business partner sign-ups — each destination/category needs its own approval.</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-full p-1">
          {(["PENDING", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition ${
                filter === f ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {f === "PENDING" ? "Pending" : "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {visible.map((a) => (
          <div key={a.id} className="bg-white border border-stone-200 rounded-[16px] overflow-hidden">
            <div className="px-5 py-3 border-b border-stone-100 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{a.businessName}</div>
                <div className="text-xs text-stone-500">
                  {a.contactName} • {a.email}
                </div>
              </div>
              <button onClick={() => deleteAccount(a)} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-stone-100">
              {a.scopes.map((s) => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium">
                      {s.destinationName} • {s.category} / {s.type}
                    </div>
                    <div className="text-xs text-stone-400 mt-0.5">
                      Requested {new Date(s.createdAt).toLocaleDateString()}
                      {s.status === "REJECTED" && s.rejectionReason ? ` — ${s.rejectionReason}` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium border ${STATUS_STYLES[s.status]}`}>{s.status}</span>
                    {s.status !== "APPROVED" && (
                      <button onClick={() => reviewScope(s, "APPROVED")} className="w-8 h-8 rounded-full hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 inline-flex items-center justify-center" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {s.status !== "REJECTED" && (
                      <button onClick={() => reviewScope(s, "REJECTED")} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center" title="Reject">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-[16px] px-5 py-8 text-center text-stone-400 text-sm">
            No {filter === "PENDING" ? "pending" : ""} registrations.
          </div>
        )}
      </div>
    </div>
  );
}
