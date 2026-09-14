import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminLead } from "@/lib/adminSerialize";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { business: true },
    take: 200,
  });
  return NextResponse.json({ leads: leads.map(adminLead) });
}
