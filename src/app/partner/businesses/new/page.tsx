"use client";

import { useEffect, useState } from "react";
import PartnerBusinessForm, { type ApprovedScopeOption } from "@/components/partner/PartnerBusinessForm";

type Scope = { id: string; category: string; type: string; status: string; destinationName?: string };
type Account = { scopes: Scope[] };

export default function NewPartnerBusinessPage() {
  const [scopes, setScopes] = useState<ApprovedScopeOption[] | null>(null);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => {
        const account = d.account as Account;
        setScopes(account.scopes.filter((s) => s.status === "APPROVED"));
      });
  }, []);

  return (
    <div>
      <h1 className="text-[24px] font-bold tracking-tight mb-1">New listing</h1>
      <p className="text-stone-500 text-sm mb-6">Add a listing to your account.</p>
      {scopes && <PartnerBusinessForm approvedScopes={scopes} />}
    </div>
  );
}
