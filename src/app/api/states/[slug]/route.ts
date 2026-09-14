import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const state = await prisma.state.findUnique({
    where: { slug },
    include: { destinations: { include: { _count: { select: { businesses: true } } } } },
  });

  if (!state) {
    return NextResponse.json({ error: "State not found" }, { status: 404 });
  }

  return NextResponse.json({
    state: {
      id: state.slug,
      name: state.name,
      emoji: state.emoji,
      gradient: state.gradient,
      featured: state.featured,
      destinationCount: state.destinations.length,
      businessCount: state.destinations.reduce((sum, d) => sum + d._count.businesses, 0),
    },
  });
}
