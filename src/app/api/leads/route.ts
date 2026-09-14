import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const FALLBACK_NAMES = ["Aarav M.", "Priya S.", "Rohan K.", "Sarah L.", "Vikram J.", "Neha R."];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { businessSlug, channel } = body as { businessSlug?: string; channel?: string };

  if (!businessSlug || !channel) {
    return NextResponse.json({ error: "businessSlug and channel are required" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { slug: businessSlug } });
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const guestName = FALLBACK_NAMES[Math.floor(Math.random() * FALLBACK_NAMES.length)];

  const lead = await prisma.lead.create({
    data: { businessId: business.id, channel, guestName },
  });

  return NextResponse.json({ lead: { id: lead.id, guestName: lead.guestName, channel: lead.channel } });
}
