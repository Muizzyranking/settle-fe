import { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "settle_access_token";
export const REFRESH_TOKEN_COOKIE = "settle_refresh_token";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export function getSettleApiBaseUrl() {
  return process.env.SETTLE_API_URL?.replace(/\/+$/, "") ?? null;
}

export function getSettleAppOrigin() {
  return (
    process.env.SETTLE_APP_ORIGIN ??
    process.env.NEXT_PUBLIC_SETTLE_APP_ORIGIN ??
    null
  );
}

export function getSettleMarketingOrigin() {
  return (
    process.env.SETTLE_MARKETING_ORIGIN ??
    process.env.NEXT_PUBLIC_SETTLE_MARKETING_ORIGIN ??
    null
  );
}

export function buildBackendUrl(path: string, search = "") {
  const baseUrl = getSettleApiBaseUrl();

  if (!baseUrl) {
    return null;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const queryIndex = normalizedPath.indexOf("?");
  const pathname =
    queryIndex >= 0 ? normalizedPath.slice(0, queryIndex) : normalizedPath;
  const inlineSearch = queryIndex >= 0 ? normalizedPath.slice(queryIndex) : "";
  const url = new URL(`/v1/${pathname}`, `${baseUrl}/`);
  url.search = search || inlineSearch;

  return url;
}

function tokenCookieOptions(maxAge: number) {
  const domain = process.env.SETTLE_COOKIE_DOMAIN;
  const options = {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  return domain ? { ...options, domain } : options;
}

export function setTokenCookies(
  cookieStore: CookieStore,
  accessToken: string,
  refreshToken?: string | null,
) {
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    tokenCookieOptions(60 * 60 * 24),
  );

  if (refreshToken) {
    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      refreshToken,
      tokenCookieOptions(60 * 60 * 24 * 30),
    );
  }
}

export function clearTokenCookies(cookieStore: CookieStore) {
  cookieStore.set(ACCESS_TOKEN_COOKIE, "", tokenCookieOptions(0));
  cookieStore.set(REFRESH_TOKEN_COOKIE, "", tokenCookieOptions(0));
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}
