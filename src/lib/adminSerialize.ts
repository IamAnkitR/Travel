import type { Business, Destination, State, Room, Amenity, Host, Lead, BusinessAccount } from "@prisma/client";

export function adminState(s: State & { _count?: { destinations: number } }) {
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    emoji: s.emoji,
    gradient: s.gradient,
    featured: s.featured,
    order: s.order,
    destinationCount: s._count?.destinations,
  };
}

export function adminDestination(
  d: Destination & { state?: State; _count?: { businesses: number } }
) {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    emoji: d.emoji,
    gradient: d.gradient,
    bestTime: d.bestTime,
    budget: d.budget,
    stay: d.stay,
    altitude: d.altitude,
    rating: d.rating,
    description: d.description,
    whyVisit: JSON.parse(d.whyVisit) as string[],
    tags: JSON.parse(d.tags) as string[],
    order: d.order,
    stateId: d.stateId,
    stateName: d.state?.name,
    businessCount: d._count?.businesses,
  };
}

export function adminBusiness(
  b: Business & {
    destination?: Destination;
    rooms?: Room[];
    amenities?: Amenity[];
    host?: Host | null;
    owner?: BusinessAccount | null;
    _count?: { leads: number };
  }
) {
  return {
    id: b.id,
    slug: b.slug,
    name: b.name,
    type: b.type,
    location: b.location,
    description: b.description,
    rating: b.rating,
    reviews: b.reviews,
    price: b.price,
    originalPrice: b.originalPrice,
    image: b.image,
    tags: JSON.parse(b.tags) as string[],
    order: b.order,
    views: b.views,
    destinationId: b.destinationId,
    destinationName: b.destination?.name,
    leadCount: b._count?.leads,
    ownerId: b.ownerId,
    ownerBusinessName: b.owner?.businessName,
    ownerEmail: b.owner?.email,
    rooms: b.rooms?.map((r) => ({ id: r.id, name: r.name, price: r.price, size: r.size, guests: r.guests })),
    amenities: b.amenities?.map((a) => ({ id: a.id, label: a.label, icon: a.icon })),
    host: b.host
      ? { name: b.host.name, title: b.host.title, yearsOnPlatform: b.host.yearsOnPlatform, responseTime: b.host.responseTime }
      : null,
  };
}

export function adminLead(l: Lead & { business?: Business }) {
  return {
    id: l.id,
    guestName: l.guestName,
    channel: l.channel,
    createdAt: l.createdAt,
    businessId: l.businessId,
    businessName: l.business?.name,
  };
}
