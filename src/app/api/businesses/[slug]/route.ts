import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBusiness } from "@/lib/serialize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const business = await prisma.business.findUnique({
    where: { slug },
    include: { rooms: true, amenities: true, host: true, destination: true },
  });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  return NextResponse.json({ business: serializeBusiness(business) });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json().catch(() => ({}));
  const { name, price, type, description } = body as {
    name?: string;
    price?: number;
    type?: string;
    description?: string;
  };

  const existing = await prisma.business.findUnique({ where: { slug } });
  if (!existing) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const updated = await prisma.business.update({
    where: { slug },
    data: {
      name: name ?? undefined,
      price: typeof price === "number" ? price : undefined,
      type: type ?? undefined,
      description: description ?? undefined,
    },
    include: { rooms: true, amenities: true, host: true, destination: true },
  });

  return NextResponse.json({ business: serializeBusiness(updated) });
}
