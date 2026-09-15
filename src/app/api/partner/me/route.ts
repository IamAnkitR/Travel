import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PARTNER_ID_HEADER } from "@/lib/partnerAuth";
import { serializeAccount } from "@/lib/partnerSerialize";

export async function GET(request: Request) {
  const accountId = request.headers.get(PARTNER_ID_HEADER);
  if (!accountId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const account = await prisma.businessAccount.findUnique({
    where: { id: accountId },
    include: { requestedDestination: true },
  });
  if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

  return NextResponse.json({ account: serializeAccount(account) });
}
