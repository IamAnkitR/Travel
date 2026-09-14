import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminBusiness } from "@/lib/adminSerialize";

export async function GET() {
  const businesses = await prisma.business.findMany({
    orderBy: { order: "asc" },
    include: { destination: true, _count: { select: { leads: true } } },
  });
  return NextResponse.json({ businesses: businesses.map(adminBusiness) });
}

type RoomInput = { name: string; price: number; size: string; guests: string };
type AmenityInput = { label: string; icon: string };
type HostInput = { name: string; title: string; yearsOnPlatform: number; responseTime: string } | null;

type BusinessInput = {
  slug?: string;
  name?: string;
  type?: string;
  location?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  tags?: string[];
  order?: number;
  destinationId?: string;
  rooms?: RoomInput[];
  amenities?: AmenityInput[];
  host?: HostInput;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as BusinessInput;
  const {
    slug,
    name,
    type,
    location,
    description,
    rating,
    reviews,
    price,
    originalPrice,
    image,
    tags,
    order,
    destinationId,
    rooms,
    amenities,
    host,
  } = body;

  if (!slug || !name || !type || !destinationId || !location) {
    return NextResponse.json(
      { error: "slug, name, type, location, and destinationId are required" },
      { status: 400 }
    );
  }

  try {
    const business = await prisma.business.create({
      data: {
        slug,
        name,
        type,
        location,
        description: description || "",
        rating: rating ?? 4.5,
        reviews: reviews ?? 0,
        price: price ?? 0,
        originalPrice: originalPrice ?? null,
        image: image || "from-stone-700 to-stone-900",
        tags: JSON.stringify(tags ?? []),
        order: order ?? 0,
        views: 0,
        destinationId,
        rooms: rooms?.length ? { create: rooms.map((r) => ({ name: r.name, price: r.price, size: r.size, guests: r.guests })) } : undefined,
        amenities: amenities?.length
          ? { create: amenities.map((a) => ({ label: a.label, icon: a.icon })) }
          : undefined,
        host: host ? { create: host } : undefined,
      },
      include: { destination: true, rooms: true, amenities: true, host: true },
    });
    return NextResponse.json({ business: adminBusiness(business) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A business with that slug already exists" }, { status: 409 });
  }
}
