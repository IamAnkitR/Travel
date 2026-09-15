import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";
import { adminLead } from "@/lib/adminSerialize";

export async function GET(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    where: { business: { ownerId: accountId } },
    orderBy: { createdAt: "desc" },
    include: { business: true },
    take: 200,
  });
  return NextResponse.json({ leads: leads.map(adminLead) });
}
