import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/settle/auth";

export async function GET() {
  const url = buildBackendUrl("auth/google");

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  return NextResponse.redirect(url);
}
