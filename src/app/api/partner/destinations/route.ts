import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public (unauthenticated) — used by /partner/register to populate the
// destination picker. Returns real database ids (unlike /api/destinations,
// which substitutes the slug as "id" for the rest of the public site).
export async function GET() {
  const destinations = await prisma.destination.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true },
  });
  return NextResponse.json({ destinations });
}
