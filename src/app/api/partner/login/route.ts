import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { COOKIE_NAME, MAX_AGE_SECONDS, createPartnerToken } from "@/lib/partnerAuth";
import { serializeAccount } from "@/lib/partnerSerialize";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const account = await prisma.businessAccount.findUnique({
    where: { email: email.toLowerCase() },
    include: { requestedDestination: true },
  });

  if (!account || !(await verifyPassword(password, account.passwordHash))) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  const token = await createPartnerToken(account.id);
  const res = NextResponse.json({ account: serializeAccount(account) });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
