import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { hashResetToken } from "@/lib/passwordReset";
import { COOKIE_NAME, MAX_AGE_SECONDS, createPartnerToken } from "@/lib/partnerAuth";
import { serializeAccount } from "@/lib/partnerSerialize";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`partner-reset-password:${clientIp(request)}`, 10, 10 * 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts — please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { token, password } = body as { token?: string; password?: string };

  if (!token || !password) {
    return NextResponse.json({ error: "token and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const tokenHash = hashResetToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { account: { include: { scopes: { include: { destination: true } } } } },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.businessAccount.update({ where: { id: resetToken.accountId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    // Any other outstanding reset links for this account are now moot.
    prisma.passwordResetToken.deleteMany({ where: { accountId: resetToken.accountId, usedAt: null } }),
  ]);

  // Log the partner straight in for a smooth post-reset experience.
  const sessionToken = await createPartnerToken(resetToken.accountId);
  const res = NextResponse.json({ account: serializeAccount(resetToken.account) });
  res.cookies.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
