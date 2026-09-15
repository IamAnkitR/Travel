import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Per-scope approval now lives at PATCH /api/admin/account-scopes/[id].
// This route only handles removing an account entirely.
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
