import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminState } from "@/lib/adminSerialize";

export async function GET() {
  const states = await prisma.state.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { destinations: true } } },
  });
  return NextResponse.json({ states: states.map(adminState) });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { slug, name, emoji, gradient, featured, order } = body as {
    slug?: string;
    name?: string;
    emoji?: string;
    gradient?: string;
    featured?: boolean;
    order?: number;
  };

  if (!slug || !name || !emoji || !gradient) {
    return NextResponse.json({ error: "slug, name, emoji, and gradient are required" }, { status: 400 });
  }

  try {
    const state = await prisma.state.create({
      data: { slug, name, emoji, gradient, featured: !!featured, order: order ?? 0 },
    });
    return NextResponse.json({ state: adminState(state) }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "A state with that slug already exists" }, { status: 409 });
  }
}
