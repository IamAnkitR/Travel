"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

type AdminAccount = {
  id: string;
  email: string;
  contactName: string;
  businessName: string;
  phone: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  requestedDestinationName?: string;
  requestedType: string;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminRegistrationsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");

  const load = () => fetch("/api/admin/business-accounts").then((r) => r.json()).then((d) => setAccounts(d.accounts ?? []));

  useEffect(() => {
    load();
  }, []);

  const review = async (account: AdminAccount, status: "APPROVED" | "REJECTED") => {
    let rejectionReason: string | undefined;
    if (status === "REJECTED") {
      rejectionReason = prompt("Reason for rejection (shown to the business):") || undefined;
      if (rejectionReason === undefined) return;
    } else if (!confirm(`Approve "${account.businessName}"? They'll be able to publish listings for ${account.requestedDestinationName} (${account.requestedType}) immediately.`)) {
      return;
    }
    await fetch(`/api/admin/business-accounts/${account.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    load();
  };

  const visible = filter === "ALL" ? accounts : accounts.filter((a) => a.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Registrations</h1>
          <p className="text-stone-500 text-sm">Business partner sign-up requests.</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-full p-1">
          {(["PENDING", "APPROVED", "REJECTED", "ALL"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`h-8 px-3 rounded-full text-xs font-semibold transition ${
                filter === f ? "bg-stone-900 text-white" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {f[0] + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Business</th>
              <th className="px-5 py-3 font-semibold">Contact</th>
              <th className="px-5 py-3 font-semibold">Requested</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Submitted</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((a) => (
              <tr key={a.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-medium">{a.businessName}</td>
                <td className="px-5 py-3 text-stone-500">
                  <div>{a.contactName}</div>
                  <div className="text-xs">{a.email}</div>
                </td>
                <td className="px-5 py-3 text-stone-500">
                  {a.requestedDestinationName} • {a.requestedType}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium border ${STATUS_STYLES[a.status]}`}>{a.status}</span>
                  {a.status === "REJECTED" && a.rejectionReason && (
                    <div className="text-[11px] text-stone-400 mt-1 max-w-[160px]">{a.rejectionReason}</div>
                  )}
                </td>
                <td className="px-5 py-3 text-stone-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  {a.status !== "APPROVED" && (
                    <button
                      onClick={() => review(a, "APPROVED")}
                      className="w-8 h-8 rounded-full hover:bg-emerald-50 text-stone-400 hover:text-emerald-600 inline-flex items-center justify-center"
                      title="Approve"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  {a.status !== "REJECTED" && (
                    <button
                      onClick={() => review(a, "REJECTED")}
                      className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center"
                      title="Reject"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                  No {filter !== "ALL" ? filter.toLowerCase() : ""} registrations.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
