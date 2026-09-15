import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function GET(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const businesses = await prisma.business.findMany({
    where: { ownerId: accountId },
    select: { id: true, views: true },
  });
  const businessIds = businesses.map((b) => b.id);
  const totalViews = businesses.reduce((sum, b) => sum + b.views, 0);

  if (businessIds.length === 0) {
    return NextResponse.json({
      totalViews: 0,
      listingCount: 0,
      leads: { current: 0, previous: 0, changePct: null, whatsapp: 0, calls: 0 },
    });
  }

  const [currentLeads, previousLeads, currentWhatsapp, currentCalls] = await Promise.all([
    prisma.lead.count({ where: { businessId: { in: businessIds }, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { businessId: { in: businessIds }, createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { businessId: { in: businessIds }, channel: "WhatsApp", createdAt: { gte: thirtyDaysAgo } } }),
    prisma.lead.count({ where: { businessId: { in: businessIds }, channel: "Call", createdAt: { gte: thirtyDaysAgo } } }),
  ]);

  return NextResponse.json({
    totalViews,
    listingCount: businesses.length,
    leads: {
      current: currentLeads,
      previous: previousLeads,
      changePct: pctChange(currentLeads, previousLeads),
      whatsapp: currentWhatsapp,
      calls: currentCalls,
    },
  });
}
