import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /chat route - require presence of session cookie.
  // IMPORTANT: Middleware runs in the Edge runtime and must not import
  // server-only modules (like Prisma / Node APIs). We only check for the
  // presence of the session cookie here. Full verification (DB lookup)
  // should happen in server-side handlers where Node APIs are allowed.
  if (pathname.startsWith("/chat")) {
    const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session";
    const cookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!cookie || !cookie.value) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

    if (pathname.startsWith("/login" ) || pathname.startsWith("/register")) {
    const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session";
    const cookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (cookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
