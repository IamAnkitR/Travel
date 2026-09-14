import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeDestination } from "@/lib/serialize";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const destination = await prisma.destination.findUnique({
    where: { slug },
    include: { businesses: { select: { id: true } } },
  });

  if (!destination) {
    return NextResponse.json({ error: "Destination not found" }, { status: 404 });
  }

  return NextResponse.json({ destination: serializeDestination(destination) });
}
