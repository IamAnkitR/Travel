"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Plus, XCircle } from "lucide-react";

type Account = {
  status: "PENDING" | "APPROVED" | "REJECTED";
  businessName: string;
  requestedDestinationName?: string;
  requestedType: string;
  rejectionReason: string | null;
};

type Business = {
  id: string;
  name: string;
  price: number;
  rating: number;
  leadCount?: number;
};

export default function PartnerDashboardPage() {
  const [account, setAccount] = useState<Account | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => setAccount(d.account));
  }, []);

  useEffect(() => {
    if (account?.status === "APPROVED") {
      fetch("/api/partner/businesses")
        .then((r) => r.json())
        .then((d) => setBusinesses(d.businesses ?? []));
    }
  }, [account?.status]);

  if (!account) return <div className="text-stone-400">Loading…</div>;

  if (account.status === "PENDING") {
    return (
      <div className="bg-white border border-amber-200 rounded-[20px] p-8 text-center max-w-[480px] mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-4">
          <Clock className="w-5 h-5" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-2">Awaiting approval</h1>
        <p className="text-sm text-stone-500">
          Your registration for <strong>{account.businessName}</strong> ({account.requestedDestinationName}, {account.requestedType}) is
          under review. You&apos;ll be able to add listings as soon as an admin approves it.
        </p>
      </div>
    );
  }

  if (account.status === "REJECTED") {
    return (
      <div className="bg-white border border-red-200 rounded-[20px] p-8 text-center max-w-[480px] mx-auto mt-10">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center mb-4">
          <XCircle className="w-5 h-5" />
        </div>
        <h1 className="text-[20px] font-bold tracking-tight mb-2">Registration not approved</h1>
        {account.rejectionReason && <p className="text-sm text-stone-500">{account.rejectionReason}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight">Your listings</h1>
          <p className="text-stone-500 text-sm">
            {account.businessName} — approved for {account.requestedDestinationName} ({account.requestedType})
          </p>
        </div>
        <Link href="/partner/businesses/new" className="h-10 px-4 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New listing
        </Link>
      </div>

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
                ₹{b.price.toLocaleString("en-IN")}/night • {b.leadCount ?? 0} leads
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
  );
}
