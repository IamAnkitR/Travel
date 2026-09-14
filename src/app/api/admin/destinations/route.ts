import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminDestination } from "@/lib/adminSerialize";

export async function GET() {
  const destinations = await prisma.destination.findMany({
    orderBy: { order: "asc" },
    include: { state: true, _count: { select: { businesses: true } } },
  });
  return NextResponse.json({ destinations: destinations.map(adminDestination) });
}

type DestinationInput = {
  slug?: string;
  name?: string;
  emoji?: string;
  gradient?: string;
  bestTime?: string;
  budget?: string;
  stay?: string;
  altitude?: string;
  rating?: number;
  description?: string;
  whyVisit?: string[];
  tags?: string[];
  order?: number;
  stateId?: string;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DestinationInput;
  const { slug, name, emoji, gradient, bestTime, budget, stay, altitude, rating, description, whyVisit, tags, order, stateId } =
    body;

  if (!slug || !name || !stateId || !description) {
    return NextResponse.json({ error: "slug, name, stateId, and description are required" }, { status: 400 });
  }

  try {
    const destination = await prisma.destination.create({
      data: {
        slug,
        name,
        emoji: emoji || "📍",
        gradient: gradient || "from-stone-700 to-stone-900",
        bestTime: bestTime || "",
        budget: budget || "",
        stay: stay || "",
        altitude: altitude || "",
        rating: rating ?? 4.5,
        description,
        whyVisit: JSON.stringify(whyVisit ?? []),
        tags: JSON.stringify(tags ?? []),
        order: order ?? 0,
        stateId,
      },
      include: { state: true },
    });
    return NextResponse.json({ destination: adminDestination(destination) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A destination with that slug already exists" }, { status: 409 });
  }
}
