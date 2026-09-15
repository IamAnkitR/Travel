"use client";

import { useEffect, useState } from "react";

type Lead = {
  id: string;
  guestName: string;
  channel: string;
  createdAt: string;
  businessName?: string;
};

export default function PartnerLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);

  useEffect(() => {
    fetch("/api/partner/leads")
      .then((r) => r.json())
      .then((d) => setLeads(d.leads ?? []));
  }, []);

  return (
    <div>
      <h1 className="text-[24px] font-bold tracking-tight mb-1">Leads</h1>
      <p className="text-stone-500 text-sm mb-6">WhatsApp / Call leads across your listings.</p>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Guest</th>
              <th className="px-5 py-3 font-semibold">Listing</th>
              <th className="px-5 py-3 font-semibold">Channel</th>
              <th className="px-5 py-3 font-semibold">Date</th>
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
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-stone-400">
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
