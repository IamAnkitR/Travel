"use client";

import { useEffect, useState } from "react";
import PartnerBusinessForm from "@/components/partner/PartnerBusinessForm";

type Account = { requestedDestinationName?: string; requestedType: string };

export default function NewPartnerBusinessPage() {
  const [account, setAccount] = useState<Account | null>(null);

  useEffect(() => {
    fetch("/api/partner/me")
      .then((r) => r.json())
      .then((d) => setAccount(d.account));
  }, []);

  return (
    <div>
      <h1 className="text-[24px] font-bold tracking-tight mb-1">New listing</h1>
      <p className="text-stone-500 text-sm mb-6">Add a stay to your account.</p>
      {account && (
        <PartnerBusinessForm lockedLabel={`${account.requestedDestinationName ?? "your destination"} • ${account.requestedType}`} />
      )}
    </div>
  );
}
