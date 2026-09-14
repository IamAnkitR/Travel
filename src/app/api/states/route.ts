import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const states = await prisma.state.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { destinations: true } }, destinations: { include: { _count: { select: { businesses: true } } } } },
  });

  const data = states.map((s) => ({
    id: s.slug,
    name: s.name,
    emoji: s.emoji,
    gradient: s.gradient,
    featured: s.featured,
    stays: s.destinations.reduce((sum, d) => sum + d._count.businesses, 0),
    destinationCount: s._count.destinations,
  }));

  return NextResponse.json({ states: data });
}
