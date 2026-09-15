import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";
import { serializeScope } from "@/lib/partnerSerialize";
import { isValidCategoryType } from "@/lib/categories";

export async function POST(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { destinationId, category, type } = body as { destinationId?: string; category?: string; type?: string };

  if (!destinationId || !category || !type || !isValidCategoryType(category, type)) {
    return NextResponse.json({ error: "destinationId, category, and type are required and must be valid" }, { status: 400 });
  }

  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  const duplicate = await prisma.accountScope.findFirst({
    where: { accountId, destinationId, category, type, status: { not: "REJECTED" } },
  });
  if (duplicate) {
    return NextResponse.json({ error: "You already have a request (or approval) for that combination" }, { status: 409 });
  }

  const scope = await prisma.accountScope.create({
    data: { accountId, destinationId, category, type },
    include: { destination: true },
  });

  return NextResponse.json({ scope: serializeScope(scope) }, { status: 201 });
}
