"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Eye, MessageCircle, Plus, TrendingUp, XCircle } from "lucide-react";

type Scope = {
  id: string;
  category: string;
  type: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason: string | null;
  destinationName?: string;
};

type Account = {
  businessName: string;
  scopes: Scope[];
};

type Business = {
  id: string;
  name: string;
  price: number;
  leadCount?: number;
  destinationName?: string;
  type: string;
};

type Summary = {
  totalViews: number;
  listingCount: number;
  leads: { current: number; previous: number; changePct: number | null; whatsapp: number; calls: number };
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED: "bg-red-50 text-red-700 border-red-200",
};

export default function PartnerDashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => setAccount(d.account));
  }, []);

  const approvedScopes = account?.scopes.filter((s) => s.status === "APPROVED") ?? [];

  useEffect(() => {
    if (!account) return;
    fetch("/api/partner/businesses")
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses ?? []));
    fetch("/api/partner/summary")
      .then((r) => r.json())
      .then(setSummary);
  }, [account]);

  if (!account) return <div className="text-stone-400">Loading…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">{account.businessName}</h1>
          <p className="text-stone-500 text-sm">Your listings, leads, and destination/category approvals.</p>
        </div>
        {approvedScopes.length > 0 && (
          <Link href="/partner/businesses/new" className="h-10 px-4 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New listing
          </Link>
        )}
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white border border-stone-200 rounded-[16px] p-4">
            <div className="w-8 h-8 rounded-full bg-stone-100 grid place-items-center mb-2">
              <Eye className="w-3.5 h-3.5" />
            </div>
            <div className="text-[22px] font-bold tracking-tight">{summary.totalViews.toLocaleString("en-IN")}</div>
            <div className="text-xs text-stone-500">Profile views (all-time)</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-[16px] p-4">
            <div className="w-8 h-8 rounded-full bg-stone-100 grid place-items-center mb-2">
              <MessageCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-[22px] font-bold tracking-tight">{summary.leads.current}</div>
            <div className="text-xs text-stone-500">Leads (30 days)</div>
          </div>
          <div className="bg-white border border-stone-200 rounded-[16px] p-4">
            <div className="w-8 h-8 rounded-full bg-stone-100 grid place-items-center mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
            <div className={`text-[22px] font-bold tracking-tight ${summary.leads.changePct !== null && summary.leads.changePct < 0 ? "text-red-600" : "text-emerald-600"}`}>
              {summary.leads.changePct === null ? "—" : `${summary.leads.changePct > 0 ? "+" : ""}${summary.leads.changePct}%`}
            </div>
            <div className="text-xs text-stone-500">vs. previous 30 days</div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-sm">Destinations & categories</h2>
          <Link href="/partner/scopes/new" className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Request another
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-2">
          {account.scopes.map((s) => (
            <div key={s.id} className="bg-white border border-stone-200 rounded-[14px] p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">
                  {s.destinationName} • {s.category} / {s.type}
                </div>
                {s.status === "REJECTED" && s.rejectionReason && <div className="text-xs text-stone-400 mt-0.5">{s.rejectionReason}</div>}
                {s.status === "PENDING" && (
                  <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Awaiting approval
                  </div>
                )}
              </div>
              <span className={`text-[11px] px-2 py-1 rounded-full font-medium border shrink-0 ${STATUS_STYLES[s.status]}`}>{s.status}</span>
            </div>
          ))}
        </div>
      </div>

      {approvedScopes.length === 0 ? (
        <div className="bg-white border border-dashed border-stone-200 rounded-[16px] p-8 text-center text-stone-400 text-sm flex flex-col items-center gap-2">
          <XCircle className="w-5 h-5" />
          You need at least one approved destination/category before you can create listings.
        </div>
      ) : (
        <div>
          <h2 className="font-semibold text-sm mb-3">Your listings</h2>
          <div className="grid gap-3">
            {businesses.map((b) => (
              <Link
                key={b.id}
                href={`/partner/businesses/${b.id}`}
                className="bg-white border border-stone-200 rounded-[16px] p-4 flex items-center justify-between hover:shadow-sm transition"
              >
                <div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-stone-500 mt-1">
                    {b.destinationName} • {b.type} • ₹{b.price.toLocaleString("en-IN")}/night • {b.leadCount ?? 0} leads
                  </div>
                </div>
                <div className="text-xs text-stone-400">Edit →</div>
              </Link>
            ))}
            {businesses.length === 0 && (
              <div className="bg-white border border-dashed border-stone-200 rounded-[16px] p-8 text-center text-stone-400 text-sm">
                No listings yet — create your first one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
