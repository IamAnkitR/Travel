"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PartnerBusinessForm, { type PartnerBusinessFormValue } from "@/components/partner/PartnerBusinessForm";

export default function EditPartnerBusinessPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<PartnerBusinessFormValue> | null>(null);
  const [lockedLabel, setLockedLabel] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/partner/businesses/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const b = d.business;
        setLockedLabel(`${b.destinationName} • ${b.type}`);
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
      <PartnerBusinessForm initial={initial} businessId={params.id} lockedLabel={lockedLabel} />
    </div>
  );
}
