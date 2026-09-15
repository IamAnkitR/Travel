import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAccount } from "@/lib/partnerSerialize";

export async function GET() {
  const accounts = await prisma.businessAccount.findMany({
    orderBy: { createdAt: "desc" },
    include: { scopes: { include: { destination: true }, orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json({ accounts: accounts.map(serializeAccount) });
}
