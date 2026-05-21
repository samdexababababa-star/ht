import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  // Match every path EXCEPT:
  // - /admin/*  (admin panel stays in English, no locale prefix)
  // - /api/*  (API routes don't need i18n)
  // - /_next/*  (Next.js internals)
  // - any path with a file extension (favicon, /brand/*, /robots.txt, etc.)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
