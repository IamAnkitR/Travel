import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeBusiness } from "@/lib/serialize";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const destination = searchParams.get("destination");
  const type = searchParams.get("type");

  const businesses = await prisma.business.findMany({
    where: {
      destination: destination ? { slug: destination } : undefined,
      type: type && type !== "All" ? type.replace(/s$/, "") : undefined,
    },
    orderBy: { order: "asc" },
    include: { destination: true },
  });

  return NextResponse.json({
    businesses: businesses.map((b) => serializeBusiness(b)),
  });
}
