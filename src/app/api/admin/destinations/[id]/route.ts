import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminDestination } from "@/lib/adminSerialize";

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as DestinationInput;
  const { slug, name, emoji, gradient, bestTime, budget, stay, altitude, rating, description, whyVisit, tags, order, stateId } =
    body;

  try {
    const destination = await prisma.destination.update({
      where: { id },
      data: {
        slug,
        name,
        emoji,
        gradient,
        bestTime,
        budget,
        stay,
        altitude,
        rating,
        description,
        whyVisit: whyVisit ? JSON.stringify(whyVisit) : undefined,
        tags: tags ? JSON.stringify(tags) : undefined,
        order,
        stateId,
      },
      include: { state: true },
    });
    return NextResponse.json({ destination: adminDestination(destination) });
  } catch {
    return NextResponse.json({ error: "Destination not found or slug already in use" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.destination.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete — remove its businesses first" },
      { status: 409 }
    );
  }
}
