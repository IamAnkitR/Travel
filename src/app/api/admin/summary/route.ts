import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [states, destinations, businesses, leads, pendingRegistrations, recentLeads] = await Promise.all([
    prisma.state.count(),
    prisma.destination.count(),
    prisma.business.count(),
    prisma.lead.count(),
    prisma.accountScope.count({ where: { status: "PENDING" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { business: true } }),
  ]);

  return NextResponse.json({
    counts: { states, destinations, businesses, leads, pendingRegistrations },
    recentLeads: recentLeads.map((l) => ({
      id: l.id,
      guestName: l.guestName,
      channel: l.channel,
      createdAt: l.createdAt,
      businessName: l.business.name,
    })),
  });
}
