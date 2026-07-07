import { type NextRequest, NextResponse } from "next/server";

const accessTokenCookie = "settle_access_token";
const appHostname = process.env.SETTLE_APP_HOSTNAME ?? "app.settle.ng";
const rootHostname = process.env.SETTLE_ROOT_HOSTNAME ?? "settle.ng";

const dashboardPrefixes = [
  "/dashboard",
  "/collections",
  "/accounts",
  "/transactions",
  "/reports",
  "/finance",
  "/notifications",
  "/settings",
  "/developers",
];

function hostnameWithoutPort(hostname: string) {
  return hostname.split(":")[0] ?? hostname;
}

function isDashboardPath(pathname: string) {
  return dashboardPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function absoluteUrl(pathname: string, origin: string, request: NextRequest) {
  return new URL(pathname, origin || request.url);
}

export function proxy(request: NextRequest) {
  const hostname = hostnameWithoutPort(
    request.headers.get("host") ?? request.nextUrl.hostname,
  );
  const pathname = request.nextUrl.pathname;
  const hasToken = request.cookies.has(accessTokenCookie);
  const appOrigin = process.env.SETTLE_APP_ORIGIN ?? `https://${appHostname}`;
  const rootOrigin =
    process.env.SETTLE_MARKETING_ORIGIN ?? `https://${rootHostname}`;

  if (hostname === appHostname) {
    if (!hasToken && pathname !== "/" && isDashboardPath(pathname)) {
      return NextResponse.redirect(
        absoluteUrl("/auth/login", rootOrigin, request),
      );
    }

    if (pathname === "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.rewrite(url);
    }

    if (hasToken && pathname.startsWith("/auth")) {
      return NextResponse.redirect(
        absoluteUrl("/dashboard", appOrigin, request),
      );
    }

    return NextResponse.next();
  }

  if (hostname === rootHostname) {
    if (isDashboardPath(pathname)) {
      return NextResponse.redirect(absoluteUrl(pathname, appOrigin, request));
    }

    if (hasToken && ["/auth/login", "/auth/register"].includes(pathname)) {
      return NextResponse.redirect(
        absoluteUrl("/dashboard", appOrigin, request),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json|.*\\.(?:png|jpg|jpeg|gif|svg|ico|woff2?|ttf)).*)",
  ],
};
