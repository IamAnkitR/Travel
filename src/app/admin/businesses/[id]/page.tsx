"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessForm, { type BusinessFormValue } from "@/components/admin/BusinessForm";

export default function EditBusinessPage() {
  const params = useParams<{ id: string }>();
  const [initial, setInitial] = useState<Partial<BusinessFormValue> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/businesses/${params.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        const b = d.business;
        setInitial({
          slug: b.slug,
          name: b.name,
          category: b.category,
          type: b.type,
          location: b.location,
          description: b.description,
          rating: b.rating,
          reviews: b.reviews,
          price: b.price,
          originalPrice: b.originalPrice,
          image: b.image,
          tags: (b.tags as string[]).join(", "),
          order: b.order,
          destinationId: b.destinationId,
          rooms: b.rooms ?? [],
          amenities: b.amenities ?? [],
          host: b.host,
          ownerBusinessName: b.ownerBusinessName,
          auditLogs: b.auditLogs,
        });
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  if (notFound) return <div className="text-stone-500">Business not found.</div>;
  if (!initial) return <div className="text-stone-400">Loading…</div>;

  return (
    <div>
      <h1 className="text-[28px] font-bold tracking-tight mb-1">Edit business</h1>
      <p className="text-stone-500 text-sm mb-6">{initial.name}</p>
      <BusinessForm initial={initial} businessId={params.id} />
    </div>
  );
}
