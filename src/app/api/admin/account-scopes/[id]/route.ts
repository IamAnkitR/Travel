import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeScope } from "@/lib/partnerSerialize";
import { sendEmail, scopeReviewEmail } from "@/lib/email";

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

  let scope;
  try {
    scope = await prisma.accountScope.update({
      where: { id },
      data: {
        status,
        reviewedAt: new Date(),
        rejectionReason: status === "REJECTED" ? rejectionReason || "Not specified" : null,
      },
      include: { destination: true, account: true },
    });
  } catch {
    return NextResponse.json({ error: "Scope request not found" }, { status: 404 });
  }

  if (status === "APPROVED" || status === "REJECTED") {
    const { subject, html } = scopeReviewEmail({
      contactName: scope.account.contactName,
      destinationName: scope.destination.name,
      category: scope.category,
      type: scope.type,
      status,
      rejectionReason: scope.rejectionReason,
    });
    await sendEmail({ to: scope.account.email, subject, html });
  }

  return NextResponse.json({ scope: serializeScope(scope) });
}
