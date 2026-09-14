import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminState } from "@/lib/adminSerialize";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { slug, name, emoji, gradient, featured, order } = body as {
    slug?: string;
    name?: string;
    emoji?: string;
    gradient?: string;
    featured?: boolean;
    order?: number;
  };

  try {
    const state = await prisma.state.update({
      where: { id },
      data: { slug, name, emoji, gradient, featured, order },
    });
    return NextResponse.json({ state: adminState(state) });
  } catch {
    return NextResponse.json({ error: "State not found or slug already in use" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.state.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Could not delete — remove its destinations first" },
      { status: 409 }
    );
  }
}
