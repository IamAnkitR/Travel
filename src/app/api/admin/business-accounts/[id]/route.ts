import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeAccount } from "@/lib/partnerSerialize";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status, rejectionReason } = body as { status?: "APPROVED" | "REJECTED" | "PENDING"; rejectionReason?: string };

  if (!status || !["APPROVED", "REJECTED", "PENDING"].includes(status)) {
    return NextResponse.json({ error: "status must be APPROVED, REJECTED, or PENDING" }, { status: 400 });
  }

  try {
    const account = await prisma.businessAccount.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason || "Not specified" : null,
      },
      include: { requestedDestination: true },
    });
    return NextResponse.json({ account: serializeAccount(account) });
  } catch {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.businessAccount.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete — this account still owns listings" },
      { status: 409 }
    );
  }
}
