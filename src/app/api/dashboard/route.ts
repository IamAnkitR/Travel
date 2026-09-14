import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessSlug = searchParams.get("business");

  const business = businessSlug
    ? await prisma.business.findUnique({ where: { slug: businessSlug } })
    : await prisma.business.findFirst({ orderBy: { order: "asc" } });

  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [whatsappLeads, calls, recentLeads] = await Promise.all([
    prisma.lead.count({ where: { businessId: business.id, channel: "WhatsApp", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { businessId: business.id, channel: "Call", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.findMany({
      where: { businessId: business.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    business: {
      id: business.slug,
      name: business.name,
      type: business.type,
      price: business.price,
      description: business.description,
    },
    stats: {
      profileViews: business.views,
      whatsappLeads,
      calls,
    },
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      name: l.guestName,
      type: l.channel,
      createdAt: l.createdAt,
    })),
  });
}
