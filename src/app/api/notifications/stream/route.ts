import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE, buildBackendUrl } from "@/lib/settle/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = buildBackendUrl(
    "notifications/stream",
    `?token=${encodeURIComponent(token)}`,
  );

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  const upstream = await fetch(url, {
    cache: "no-store",
    headers: { accept: "text/event-stream" },
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "stream_unavailable" },
      { status: upstream.status },
    );
  }

  return new Response(upstream.body, {
    headers: {
      "cache-control": "no-cache, no-transform",
      "content-type": "text/event-stream",
      "x-accel-buffering": "no",
    },
  });
}
