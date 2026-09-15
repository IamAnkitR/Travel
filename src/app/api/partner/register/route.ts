import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { COOKIE_NAME, MAX_AGE_SECONDS, createPartnerToken } from "@/lib/partnerAuth";
import { serializeAccount, BUSINESS_TYPES } from "@/lib/partnerSerialize";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { businessName, contactName, email, phone, password, destinationId, type } = body as {
    businessName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    password?: string;
    destinationId?: string;
    type?: string;
  };

  if (!businessName || !contactName || !email || !password || !destinationId || !type) {
    return NextResponse.json(
      { error: "businessName, contactName, email, password, destinationId, and type are all required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (!(BUSINESS_TYPES as readonly string[]).includes(type)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const destination = await prisma.destination.findUnique({ where: { id: destinationId } });
  if (!destination) {
    return NextResponse.json({ error: "Invalid destination" }, { status: 400 });
  }

  const existing = await prisma.businessAccount.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const account = await prisma.businessAccount.create({
    data: {
      businessName,
      contactName,
      email: email.toLowerCase(),
      phone: phone || null,
      passwordHash,
      requestedDestinationId: destinationId,
      requestedType: type,
    },
    include: { requestedDestination: true },
  });

  const token = await createPartnerToken(account.id);
  const res = NextResponse.json({ account: serializeAccount(account) }, { status: 201 });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
