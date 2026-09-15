"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { History } from "lucide-react";
import PartnerBusinessForm, { type PartnerBusinessFormValue } from "@/components/partner/PartnerBusinessForm";

type AuditEntry = { id: string; field: string; oldValue: string | null; newValue: string | null; createdAt: string };

export default function EditPartnerBusinessPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<PartnerBusinessFormValue> | null>(null);
  const [lockedLabel, setLockedLabel] = useState("");
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/partner/businesses/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const b = d.business;
        setLockedLabel(`${b.destinationName} • ${b.category} / ${b.type}`);
        setAuditLogs(b.auditLogs ?? []);
        setInitial({
          slug: b.slug,
          name: b.name,
          location: b.location,
          description: b.description,
          price: b.price,
          originalPrice: b.originalPrice,
          image: b.image,
          tags: (b.tags as string[]).join(", "),
          rooms: b.rooms ?? [],
          amenities: b.amenities ?? [],
          host: b.host,
        });
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <div className="text-stone-500">Listing not found.</div>;
  if (!initial) return <div className="text-stone-400">Loading…</div>;

  return (
    <div>
      <h1 className="text-[24px] font-bold tracking-tight mb-1">Edit listing</h1>
      <p className="text-stone-500 text-sm mb-6">{initial.name}</p>
      {auditLogs.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-[14px] p-4 max-w-[640px]">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
            <History className="w-4 h-4" /> Edited by an admin
          </div>
          <div className="space-y-1 text-xs text-amber-800/80">
            {auditLogs.map((l) => (
              <div key={l.id}>
                {new Date(l.createdAt).toLocaleString()} — <strong>{l.field}</strong>: {l.oldValue ?? "—"} → {l.newValue ?? "—"}
              </div>
            ))}
          </div>
        </div>
      )}
      <PartnerBusinessForm initial={initial} businessId={params.id} lockedLabel={lockedLabel} />
    </div>
  );
}
