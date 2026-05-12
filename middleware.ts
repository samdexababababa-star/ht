import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";

import authConfig, { isProtectedPath } from "./auth.config";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Combined middleware:
 *  1. Run next-intl to resolve / rewrite the locale prefix.
 *  2. For protected paths (`/{locale}/account/*`), check the Auth.js JWT
 *     session and redirect unauthenticated users to `/{locale}/sign-in`
 *     with a `?callbackUrl=` so we can return them after sign-in.
 *
 * `/api/*` and `/admin/*` are excluded by the matcher below — they have
 * their own auth flows.
 */
export default auth((req) => {
  const intlResponse = intlMiddleware(req as unknown as NextRequest);

  if (isProtectedPath(req.nextUrl.pathname) && !req.auth) {
    const locale = detectLocale(req.nextUrl.pathname);
    const signInUrl = new URL(`/${locale}/sign-in`, req.nextUrl);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(signInUrl);
  }

  return intlResponse;
});

function detectLocale(pathname: string): string {
  const match = pathname.match(/^\/(fr|en|ar)(?=\/|$)/);
  if (match) return match[1];
  return routing.defaultLocale;
}

export const config = {
  // Match every path EXCEPT:
  // - /api/*     (API routes — Auth.js handlers + admin auth)
  // - /admin/*   (legacy admin panel — its own JWT cookie auth)
  // - /_next/*   (Next internals)
  // - any path with a file extension (favicon, /brand/*, /robots.txt…)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
