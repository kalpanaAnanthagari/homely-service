import { NextRequest, NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";

const isProtectedPath = (pathname: string) =>
  pathname.startsWith("/maids") || pathname.startsWith("/bookings");

/**
 * Next.js 16 can pass requests where `nextUrl.pathname` is missing until a full URL
 * exists. Auth0's handler calls `pathname.startsWith` on that value — normalize first.
 */
function ensureNextRequest(request: NextRequest): NextRequest {
  try {
    if (typeof request.nextUrl?.pathname === "string") {
      return request;
    }
  } catch {
    // nextUrl can throw in edge cases
  }

  const url =
    request.url ||
    (() => {
      const host = request.headers.get("host") ?? "localhost:3000";
      const proto =
        request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
        "http";
      return `${proto}://${host}/`;
    })();

  const init: ConstructorParameters<typeof NextRequest>[1] = {
    method: request.method,
    headers: request.headers,
  };
  if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
    init.body = request.body;
    init.duplex = "half";
  }
  return new NextRequest(url, init);
}

export async function proxy(request: NextRequest) {
  const req = ensureNextRequest(request);

  const authRes = await auth0.middleware(req);

  if (req.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  if (!isProtectedPath(req.nextUrl.pathname)) {
    return authRes;
  }

  const session = await auth0.getSession(req);
  if (!session) {
    const login = new URL("/auth/login", req.nextUrl.origin);
    const returnTo = `${req.nextUrl.pathname}${req.nextUrl.search}`;
    login.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(login);
  }

  return authRes;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
