"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type AdminLead = {
  id: string;
  guestName: string;
  channel: string;
  createdAt: string;
  businessName?: string;
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);

  const load = () => fetch("/api/admin/leads").then((r) => r.json()).then((d) => setLeads(d.leads ?? []));

  useEffect(() => {
    load();
  }, []);

  const remove = async (l: AdminLead) => {
    if (!confirm(`Delete lead from ${l.guestName}?`)) return;
    await fetch(`/api/admin/leads/${l.id}`, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1">Leads</h1>
      <p className="text-stone-500 text-sm mb-6">WhatsApp / Call / Booking leads generated from the site.</p>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Guest</th>
              <th className="px-5 py-3 font-semibold">Business</th>
              <th className="px-5 py-3 font-semibold">Channel</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-medium">{l.guestName}</td>
                <td className="px-5 py-3 text-stone-500">{l.businessName}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                      l.channel === "WhatsApp" ? "bg-[#25D366]/15 text-[#128C7E]" : "bg-stone-100 text-stone-600"
                    }`}
                  >
                    {l.channel}
                  </span>
                </td>
                <td className="px-5 py-3 text-stone-500">{new Date(l.createdAt).toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <button onClick={() => remove(l)} className="w-8 h-8 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 inline-flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-stone-400">
                  No leads yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
