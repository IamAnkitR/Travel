import { NextResponse } from "next/server";
import { COOKIE_NAME, MAX_AGE_SECONDS, computeAdminToken, verifyPassword } from "@/lib/adminAuth";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

export async function POST(request: Request) {
  const allowed = await checkRateLimit(`admin-login:${clientIp(request)}`, 8, 10 * 60);
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts — please try again in a few minutes." }, { status: 429 });
  }

  const body = await request.json().catch(() => ({}));
  const { password } = body as { password?: string };

  if (!password || !(await verifyPassword(password))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const token = await computeAdminToken();
  if (!token) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not configured on the server" }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return res;
}
