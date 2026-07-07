import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  buildBackendUrl,
  clearTokenCookies,
  REFRESH_TOKEN_COOKIE,
  setTokenCookies,
} from "@/lib/settle/auth";

type SettleRouteContext = {
  params: Promise<{ path: string[] }>;
};

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function filteredResponseHeaders(response: Response) {
  const headers = new Headers();

  response.headers.forEach((value, key) => {
    if (!hopByHopHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  return headers;
}

function forwardedRequestHeaders(
  request: NextRequest,
  accessToken?: string | null,
) {
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const accept = request.headers.get("accept");

  if (contentType) {
    headers.set("content-type", contentType);
  }

  if (accept) {
    headers.set("accept", accept);
  }

  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }

  return headers;
}

async function refreshAccessToken() {
  const url = buildBackendUrl("auth/refresh");

  if (!url) {
    return null;
  }

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) {
    return null;
  }

  const response = await fetch(url, {
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.access_token) {
    return null;
  }

  setTokenCookies(cookieStore, data.access_token, data.refresh_token);

  return data.access_token as string;
}

async function forwardRequest(
  request: NextRequest,
  path: string,
  accessToken?: string | null,
  body?: ArrayBuffer,
) {
  const url = buildBackendUrl(path, request.nextUrl.search);

  if (!url) {
    return NextResponse.json(
      { error: "SETTLE_API_URL is not configured." },
      { status: 500 },
    );
  }

  return fetch(url, {
    body,
    cache: "no-store",
    headers: forwardedRequestHeaders(request, accessToken),
    method: request.method,
  });
}

async function handler(request: NextRequest, context: SettleRouteContext) {
  const { path } = await context.params;
  const cookieStore = await cookies();
  const requestBody = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  let accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  let response = await forwardRequest(
    request,
    path.join("/"),
    accessToken,
    requestBody,
  );

  if (response.status === 401) {
    const refreshedAccessToken = await refreshAccessToken();

    if (refreshedAccessToken) {
      accessToken = refreshedAccessToken;
      response = await forwardRequest(
        request,
        path.join("/"),
        accessToken,
        requestBody,
      );
    } else {
      clearTokenCookies(cookieStore);

      return NextResponse.json({ error: "session_expired" }, { status: 401 });
    }
  }

  return new Response(response.body, {
    headers: filteredResponseHeaders(response),
    status: response.status,
    statusText: response.statusText,
  });
}

export {
  handler as DELETE,
  handler as GET,
  handler as HEAD,
  handler as OPTIONS,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
