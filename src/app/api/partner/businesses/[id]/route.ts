import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";
import { adminBusiness } from "@/lib/adminSerialize";

async function loadOwned(id: string, accountId: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { destination: true, rooms: true, amenities: true, host: true },
  });
  if (!business || business.ownerId !== accountId) return null;
  return business;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const business = await loadOwned(id, accountId);
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ business: adminBusiness(business) });
}

type RoomInput = { name: string; price: number; size: string; guests: string };
type AmenityInput = { label: string; icon: string };
type HostInput = { name: string; title: string; yearsOnPlatform: number; responseTime: string } | null;

type BusinessInput = {
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await loadOwned(id, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as BusinessInput;
  // destinationId and type are intentionally not accepted here — they stay
  // locked to what the partner's account was approved for.
  const { name, location, description, price, originalPrice, image, tags, rooms, amenities, host } = body;

  try {
    const business = await prisma.$transaction(async (tx) => {
      if (rooms) await tx.room.deleteMany({ where: { businessId: id } });
      if (amenities) await tx.amenity.deleteMany({ where: { businessId: id } });
      if (host !== undefined) await tx.host.deleteMany({ where: { businessId: id } });

      return tx.business.update({
        where: { id },
        data: {
          name,
          location,
          description,
          price,
          originalPrice: originalPrice === undefined ? undefined : originalPrice,
          image,
          tags: tags ? JSON.stringify(tags) : undefined,
          rooms: rooms?.length
            ? { create: rooms.map((r) => ({ name: r.name, price: r.price, size: r.size, guests: r.guests })) }
            : undefined,
          amenities: amenities?.length
            ? { create: amenities.map((a) => ({ label: a.label, icon: a.icon })) }
            : undefined,
          host: host ? { create: host } : undefined,
        },
        include: { destination: true, rooms: true, amenities: true, host: true },
      });
    });
    return NextResponse.json({ business: adminBusiness(business) });
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await loadOwned(id, accountId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.business.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
