import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";
import { adminBusiness } from "@/lib/adminSerialize";

export async function GET(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const businesses = await prisma.business.findMany({
    where: { ownerId: accountId },
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
  location?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  image?: string;
  tags?: string[];
  rooms?: RoomInput[];
  amenities?: AmenityInput[];
  host?: HostInput;
};

export async function POST(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.businessAccount.findUnique({ where: { id: accountId } });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (account.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Your account is not approved yet — you can't publish listings until an admin approves your registration." },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as BusinessInput;
  const { slug, name, location, description, price, originalPrice, image, tags, rooms, amenities, host } = body;

  if (!slug || !name || !location) {
    return NextResponse.json({ error: "slug, name, and location are required" }, { status: 400 });
  }

  try {
    const business = await prisma.business.create({
      data: {
        slug,
        name,
        // Locked to what was approved at registration — never taken from client input.
        type: account.requestedType,
        destinationId: account.requestedDestinationId,
        ownerId: account.id,
        location,
        description: description || "",
        rating: 0,
        reviews: 0,
        price: price ?? 0,
        originalPrice: originalPrice ?? null,
        image: image || "from-stone-700 to-stone-900",
        tags: JSON.stringify(tags ?? []),
        order: 0,
        views: 0,
        rooms: rooms?.length ? { create: rooms.map((r) => ({ name: r.name, price: r.price, size: r.size, guests: r.guests })) } : undefined,
        amenities: amenities?.length ? { create: amenities.map((a) => ({ label: a.label, icon: a.icon })) } : undefined,
        host: host ? { create: host } : undefined,
      },
      include: { destination: true, rooms: true, amenities: true, host: true },
    });
    return NextResponse.json({ business: adminBusiness(business) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A listing with that slug already exists" }, { status: 409 });
  }
}
