import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user, pass },
    });
  }
  return transporter;
}

/**
 * Minimal transactional email sender via SMTP (nodemailer) — configured for
 * Gmail with an app password by default. No-ops with a console log when
 * SMTP_USER/SMTP_PASS aren't set, so the rest of the app works without an
 * email provider configured.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER || "Overview <no-reply@overview.app>";
  const client = getTransporter();

  if (!client) {
    console.log(`[email:skipped — SMTP_USER/SMTP_PASS not set] to=${to} subject="${subject}"`);
    return { skipped: true };
  }

  try {
    await client.sendMail({ from, to, subject, html });
    return { skipped: false, ok: true };
  } catch (err) {
    console.error("[email:error]", err);
    return { skipped: false, ok: false };
  }
}

export function scopeReviewEmail(params: {
  contactName: string;
  destinationName: string;
  category: string;
  type: string;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string | null;
}) {
  const { contactName, destinationName, category, type, status, rejectionReason } = params;
  const scopeLabel = `${destinationName} • ${category} / ${type}`;

  if (status === "APPROVED") {
    return {
      subject: `You're approved to publish on Overview — ${scopeLabel}`,
      html: `<p>Hi ${contactName},</p><p>Your request to publish <strong>${scopeLabel}</strong> listings on Overview has been <strong>approved</strong>. You can now log in and create listings for it.</p>`,
    };
  }

  return {
    subject: `Update on your Overview registration — ${scopeLabel}`,
    html: `<p>Hi ${contactName},</p><p>Your request to publish <strong>${scopeLabel}</strong> listings on Overview was <strong>not approved</strong>.${
      rejectionReason ? ` Reason: ${rejectionReason}` : ""
    }</p>`,
  };
}

export function passwordResetEmail(params: { contactName: string; resetUrl: string }) {
  const { contactName, resetUrl } = params;
  return {
    subject: "Reset your Overview partner password",
    html: `<p>Hi ${contactName},</p><p>Someone requested a password reset for your Overview partner account. Click below to set a new password — this link expires in 1 hour and can only be used once.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p>`,
  };
}
