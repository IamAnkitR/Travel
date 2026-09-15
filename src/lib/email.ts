/**
 * Minimal transactional email sender via the Resend HTTP API (no SDK
 * dependency — plain fetch). No-ops with a console log when RESEND_API_KEY
 * isn't set, so the rest of the app works without an email provider
 * configured; set RESEND_API_KEY and EMAIL_FROM to enable delivery.
 */
export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Overview <onboarding@resend.dev>";

  if (!apiKey) {
    console.log(`[email:skipped — RESEND_API_KEY not set] to=${to} subject="${subject}"`);
    return { skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) {
      console.error(`[email:failed] ${res.status} ${await res.text().catch(() => "")}`);
      return { skipped: false, ok: false };
    }
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
