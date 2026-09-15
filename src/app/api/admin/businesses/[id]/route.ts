import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminBusiness } from "@/lib/adminSerialize";
import { logAdminBusinessEdit } from "@/lib/auditLog";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      destination: true,
      rooms: true,
      amenities: true,
      host: true,
      owner: true,
      auditLogs: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 });
  return NextResponse.json({ business: adminBusiness(business) });
}

type RoomInput = { name: string; price: number; size: string; guests: string };
type AmenityInput = { label: string; icon: string };
type HostInput = { name: string; title: string; yearsOnPlatform: number; responseTime: string } | null;

type BusinessInput = {
  slug?: string;
  name?: string;
  category?: string;
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const before = await prisma.business.findUnique({ where: { id } });
  if (!before) return NextResponse.json({ error: "Business not found" }, { status: 404 });

  const body = (await request.json().catch(() => ({}))) as BusinessInput;
  const {
    slug,
    name,
    category,
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

  try {
    const business = await prisma.$transaction(async (tx) => {
      if (rooms) {
        await tx.room.deleteMany({ where: { businessId: id } });
      }
      if (amenities) {
        await tx.amenity.deleteMany({ where: { businessId: id } });
      }
      if (host !== undefined) {
        await tx.host.deleteMany({ where: { businessId: id } });
      }

      return tx.business.update({
        where: { id },
        data: {
          slug,
          name,
          category,
          type,
          location,
          description,
          rating,
          reviews,
          price,
          originalPrice: originalPrice === undefined ? undefined : originalPrice,
          image,
          tags: tags ? JSON.stringify(tags) : undefined,
          order,
          destinationId,
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

    if (before.ownerId) {
      await logAdminBusinessEdit(id, before, { name, category, type, location, description, price, originalPrice, destinationId });
    }

    return NextResponse.json({ business: adminBusiness(business) });
  } catch {
    return NextResponse.json({ error: "Business not found or slug already in use" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.business.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Could not delete business" }, { status: 409 });
  }
}
