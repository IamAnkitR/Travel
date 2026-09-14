import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDestination } from "@/lib/serialize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get("state");
  const search = searchParams.get("q");
  const tag = searchParams.get("tag");

  const destinations = await prisma.destination.findMany({
    where: {
      state: state ? { slug: state } : undefined,
      name: search ? { contains: search } : undefined,
    },
    orderBy: { order: "asc" },
    include: { businesses: { select: { id: true } } },
  });

  const filtered = tag
    ? destinations.filter((d) => (JSON.parse(d.tags) as string[]).includes(tag))
    : destinations;

  return NextResponse.json({
    destinations: filtered.map((d) => serializeDestination(d)),
  });
}
