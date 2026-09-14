"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

type AdminBusiness = {
  id: string;
  name: string;
  type: string;
  destinationName?: string;
  price: number;
  rating: number;
  leadCount?: number;
};

export default function AdminBusinessesPage() {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);

  useEffect(() => {
    fetch("/api/admin/businesses")
      .then((r) => r.json())
      .then((d) => setBusinesses(d.businesses ?? []));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Businesses</h1>
          <p className="text-stone-500 text-sm">Stays / listings, each tied to a destination.</p>
        </div>
        <Link href="/admin/businesses/new" className="h-10 px-4 rounded-full bg-stone-900 text-white text-sm font-semibold flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New business
        </Link>
      </div>

      <div className="bg-white border border-stone-200 rounded-[16px] overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-widest text-stone-400 border-b border-stone-200">
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Destination</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Rating</th>
              <th className="px-5 py-3 font-semibold">Leads</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                <td className="px-5 py-3 font-medium whitespace-nowrap">
                  <Link href={`/admin/businesses/${b.id}`} className="hover:text-emerald-700">
                    {b.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-stone-500">{b.destinationName}</td>
                <td className="px-5 py-3 text-stone-500">{b.type}</td>
                <td className="px-5 py-3 text-stone-500">₹{b.price.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-stone-500">{b.rating}</td>
                <td className="px-5 py-3 text-stone-500">{b.leadCount ?? 0}</td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                  No businesses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
