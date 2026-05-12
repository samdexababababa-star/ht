import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible Auth.js config — providers that don't require Node-only deps
 * go here. The Prisma adapter and the Resend Email provider both pull
 * Node-only modules (better-sqlite3, nodemailer), so they live in `./auth.ts`
 * instead. The `middleware.ts` imports from this file directly so the auth
 * check stays in the Edge runtime.
 *
 * Env vars (all auto-detected by Auth.js v5):
 * - AUTH_SECRET           — JWT signing key (required)
 * - AUTH_GOOGLE_ID        — Google OAuth client id
 * - AUTH_GOOGLE_SECRET    — Google OAuth client secret
 * - AUTH_TRUST_HOST=true  — required outside Vercel
 */
export default {
  pages: {
    // We intentionally don't set `signIn` here. The locale prefix means
    // every sign-in URL is `/{locale}/sign-in`, which `auth()` can't infer
    // statically. We handle the redirect in middleware with the active locale.
    error: "/sign-in",
  },
  providers: [
    Google({
      // Always show the account chooser even if the user is already
      // signed in to a single Google account — avoids the silent
      // re-login UX that confuses people.
      authorization: { params: { prompt: "select_account" } },
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    authorized({ auth, request }) {
      // We only enforce auth on protected routes here. The matcher in
      // middleware.ts narrows further to `/account/*`.
      const isProtected = isProtectedPath(request.nextUrl.pathname);
      if (!isProtected) return true;
      return !!auth?.user;
    },
    async jwt({ token, user, account }) {
      // On first sign-in, copy user id and role onto the JWT so we don't
      // have to hit the DB on every request.
      if (user) {
        token.uid = user.id;
        // role comes from the Prisma user record (default: "customer")
        const role = (user as { role?: string }).role;
        if (role) token.role = role;
      }
      if (account?.provider) token.provider = account.provider;
      return token;
    },
    async session({ session, token }) {
      if (token.uid && session.user) {
        session.user.id = token.uid as string;
        if (token.role) {
          (session.user as { role?: string }).role = token.role as string;
        }
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
} satisfies NextAuthConfig;

/**
 * Single source of truth for which routes require an authenticated customer.
 * Kept locale-agnostic — middleware strips the leading `/fr|/en|/ar` before
 * calling this.
 */
export function isProtectedPath(pathname: string) {
  const stripped = pathname.replace(/^\/(fr|en|ar)(?=\/|$)/, "");
  return stripped.startsWith("/account");
}
