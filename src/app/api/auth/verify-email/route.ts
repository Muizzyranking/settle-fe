import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/settle/auth";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { detail: "Verification token is required." },
      { status: 400 },
    );
  }

  const url = buildBackendUrl(
    `auth/verify-email?token=${encodeURIComponent(token)}`,
  );

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  return NextResponse.json(data ?? {}, { status: response.status });
}
