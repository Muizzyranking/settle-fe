import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  buildBackendUrl,
  getSettleAppOrigin,
  setTokenCookies,
} from "@/lib/settle/auth";

function loginRedirect(request: NextRequest, reason = "google_failed") {
  return NextResponse.redirect(
    new URL(`/auth/login?error=${reason}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code || request.nextUrl.searchParams.get("error")) {
    return loginRedirect(request);
  }

  const url = buildBackendUrl("auth/google/exchange");

  if (!url) {
    return loginRedirect(request, "api_not_configured");
  }

  const response = await fetch(`${url}?code=${code}`, {
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.access_token || !data?.refresh_token) {
    return loginRedirect(request);
  }

  const cookieStore = await cookies();
  setTokenCookies(cookieStore, data.access_token, data.refresh_token);

  return NextResponse.redirect(
    new URL("/dashboard", getSettleAppOrigin() ?? request.url),
  );
}
