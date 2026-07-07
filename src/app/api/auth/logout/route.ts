import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  buildBackendUrl,
  clearTokenCookies,
} from "@/lib/settle/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const url = buildBackendUrl("auth/logout-all");

  if (url && token) {
    await fetch(url, {
      cache: "no-store",
      headers: { authorization: `Bearer ${token}` },
      method: "POST",
    }).catch(() => null);
  }

  clearTokenCookies(cookieStore);

  return NextResponse.json({ ok: true });
}
