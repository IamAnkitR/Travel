import type { Business, Destination, Host, Room, Amenity } from "@prisma/client";

export function serializeDestination(d: Destination & { businesses?: unknown[] }) {
  return {
    id: d.slug,
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
    businesses: d.businesses ? d.businesses.length : undefined,
  };
}

export function serializeBusiness(
  b: Business & { rooms?: Room[]; amenities?: Amenity[]; host?: Host | null; destination?: Destination }
) {
  return {
    id: b.slug,
    name: b.name,
    type: b.type,
    location: b.location,
    description: b.description,
    rating: b.rating,
    reviews: b.reviews,
    price: `₹${b.price.toLocaleString("en-IN")}`,
    originalPrice: b.originalPrice ? `₹${b.originalPrice.toLocaleString("en-IN")}` : null,
    image: b.image,
    tags: JSON.parse(b.tags) as string[],
    destination: b.destination
      ? { id: b.destination.slug, name: b.destination.name }
      : undefined,
    rooms: b.rooms?.map((r) => ({
      name: r.name,
      price: `₹${r.price.toLocaleString("en-IN")}`,
      size: r.size,
      guests: r.guests,
    })),
    amenities: b.amenities?.map((a) => ({ label: a.label, icon: a.icon })),
    host: b.host
      ? {
          name: b.host.name,
          title: b.host.title,
          yearsOnPlatform: b.host.yearsOnPlatform,
          responseTime: b.host.responseTime,
        }
      : undefined,
  };
}
