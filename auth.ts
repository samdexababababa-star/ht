import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Resend from "next-auth/providers/resend";

import authConfig from "./auth.config";
import { prisma } from "./lib/db";
// PrismaAdapter's published types don't match the Prisma 7 generated client
// (it expects a non-namespaced client type). Cast through unknown so we don't
// have to fork the adapter types.
import type { PrismaClient } from "./app/generated/prisma/client";

const adapter = PrismaAdapter(prisma as unknown as PrismaClient);

/**
 * Full Auth.js config — adds the Prisma adapter and the Node-only providers
 * (Resend email magic link) to the Edge-compatible base from `auth.config.ts`.
 *
 * Env vars (auto-detected by Auth.js v5 unless noted):
 * - AUTH_SECRET           — JWT signing key (required)
 * - AUTH_TRUST_HOST=true  — required outside Vercel
 * - AUTH_RESEND_KEY       — Resend API key (auto-detected)
 * - AUTH_EMAIL_FROM       — sender address for magic links (we pass it
 *                           explicitly because Auth.js defaults to a name
 *                           that won't match the Resend verified domain)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter,
  providers: [
    ...authConfig.providers,
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: process.env.AUTH_EMAIL_FROM ?? "Salma <onboarding@resend.dev>",
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account, profile }) {
      // Block sign-in for the legacy bootstrap admin via the customer flow —
      // the admin uses its own bcrypt-based form at /admin/login.
      if (user?.email && account?.provider === "google" && profile?.email_verified === false) {
        return false;
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      // Newly-created customers default to role="customer" via the Prisma
      // schema default. Nothing to do here yet — kept as an extension point
      // for welcome emails, affiliate cookie attribution (Phase C), etc.
      void user;
    },
  },
});
