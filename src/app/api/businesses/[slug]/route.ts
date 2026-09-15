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

// Editing a listing now requires authentication — see /api/admin/businesses/[id]
// (site admin) and /api/partner/businesses/[id] (the listing's own owner).
