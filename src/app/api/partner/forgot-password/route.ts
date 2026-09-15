import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken, RESET_TOKEN_TTL_MS } from "@/lib/passwordReset";
import { sendEmail, passwordResetEmail } from "@/lib/email";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

// Always returns a generic success message — never reveals whether an
// email is registered, to avoid leaking account existence to an attacker.
const GENERIC_RESPONSE = { message: "If that email is registered, we've sent a password reset link." };

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`partner-forgot-password:${clientIp(request)}`, 5, 10 * 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts — please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { email } = body as { email?: string };
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const account = await prisma.businessAccount.findUnique({ where: { email: email.toLowerCase() } });

  if (account) {
    // Invalidate any earlier unused tokens before issuing a new one.
    await prisma.passwordResetToken.deleteMany({ where: { accountId: account.id, usedAt: null } });

    const { token, tokenHash } = generateResetToken();
    await prisma.passwordResetToken.create({
      data: { accountId: account.id, tokenHash, expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS) },
    });

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/partner/reset-password?token=${token}`;
    const { subject, html } = passwordResetEmail({ contactName: account.contactName, resetUrl });
    await sendEmail({ to: account.email, subject, html });
  }

  return NextResponse.json(GENERIC_RESPONSE);
}
