import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { COOKIE_NAME, MAX_AGE_SECONDS, createPartnerToken } from "@/lib/partnerAuth";
import { serializeAccount } from "@/lib/partnerSerialize";
import { isValidCategoryType } from "@/lib/categories";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

type ScopeInput = { destinationId?: string; category?: string; type?: string };

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`partner-register:${clientIp(request)}`, 5, 10 * 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts — please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { businessName, contactName, email, phone, password, scopes } = body as {
    businessName?: string;
    contactName?: string;
    email?: string;
    phone?: string;
    password?: string;
    scopes?: ScopeInput[];
  };

  if (!businessName || !contactName || !email || !password || !scopes?.length) {
    return NextResponse.json(
      { error: "businessName, contactName, email, password, and at least one destination/category are required" },
      { status: 400 }
    );
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  for (const s of scopes) {
    if (!s.destinationId || !s.category || !s.type || !isValidCategoryType(s.category, s.type)) {
      return NextResponse.json({ error: "One of the destination/category rows is invalid" }, { status: 400 });
    }
  }

  const destinationIds = [...new Set(scopes.map((s) => s.destinationId!))];
  const found = await prisma.destination.findMany({ where: { id: { in: destinationIds } } });
  if (found.length !== destinationIds.length) {
    return NextResponse.json({ error: "One of the selected destinations is invalid" }, { status: 400 });
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
      scopes: {
        create: scopes.map((s) => ({
          destinationId: s.destinationId!,
          category: s.category!,
          type: s.type!,
        })),
      },
    },
    include: { scopes: { include: { destination: true } } },
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
