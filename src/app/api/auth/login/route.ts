import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildBackendUrl, setTokenCookies } from "@/lib/settle/auth";

export async function POST(request: Request) {
  const url = buildBackendUrl("auth/login");

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  const body = await request.text();
  const response = await fetch(url, {
    body,
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return NextResponse.json(data ?? { error: "login_failed" }, {
      status: response.status,
    });
  }

  if (!data?.access_token || !data?.refresh_token) {
    return NextResponse.json(
      { error: "invalid_login_response" },
      { status: 502 },
    );
  }

  const cookieStore = await cookies();
  setTokenCookies(cookieStore, data.access_token, data.refresh_token);

  return NextResponse.json({ tenant: data.tenant ?? null });
}
