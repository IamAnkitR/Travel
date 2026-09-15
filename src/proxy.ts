import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME as ADMIN_COOKIE, computeAdminToken } from "@/lib/adminAuth";
import { COOKIE_NAME as PARTNER_COOKIE, PARTNER_ID_HEADER, verifyPartnerToken } from "@/lib/partnerAuth";

const PARTNER_PUBLIC_PATHS = new Set([
  "/partner/login",
  "/partner/register",
  "/partner/forgot-password",
  "/partner/reset-password",
  "/api/partner/login",
  "/api/partner/register",
  "/api/partner/destinations",
  "/api/partner/forgot-password",
  "/api/partner/reset-password",
]);

async function handleAdmin(request: NextRequest, pathname: string) {
  const isApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";

  if (isLoginPage || isLoginApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  const expected = await computeAdminToken();
  const authed = !!expected && token === expected;

  if (authed) return NextResponse.next();

  if (isApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

async function handlePartner(request: NextRequest, pathname: string) {
  const isApi = pathname.startsWith("/api/partner");

  if (PARTNER_PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const token = request.cookies.get(PARTNER_COOKIE)?.value;
  const accountId = await verifyPartnerToken(token);

  if (!accountId) {
    if (isApi) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const loginUrl = new URL("/partner/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the verified account id to route handlers; strip any client-supplied value first.
  const headers = new Headers(request.headers);
  headers.delete(PARTNER_ID_HEADER);
  headers.set(PARTNER_ID_HEADER, accountId);
  return NextResponse.next({ request: { headers } });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    return handleAdmin(request, pathname);
  }

  if (pathname.startsWith("/partner") || pathname.startsWith("/api/partner")) {
    return handlePartner(request, pathname);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/partner/:path*", "/api/partner/:path*"],
};
