import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/settle/auth";

function cleanPayload(value: unknown) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => key !== "confirm_password")
      .map(([key, entry]) => [key, entry === "" ? undefined : entry])
      .filter(([, entry]) => entry !== undefined),
  );
}

export async function POST(request: Request) {
  const url = buildBackendUrl("auth/register");

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  const payload = cleanPayload(await request.json().catch(() => ({})));
  const response = await fetch(url, {
    body: JSON.stringify(payload),
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  return NextResponse.json(data ?? {}, { status: response.status });
}
