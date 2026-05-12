"use server";

import { AuthError } from "next-auth";
import { redirect } from "@/i18n/navigation";
import { signIn } from "@/auth";
import { locales, type Locale } from "@/i18n/routing";

function safeLocale(input: unknown): Locale {
  return (locales as readonly string[]).includes(String(input))
    ? (input as Locale)
    : "fr";
}

function safeCallbackUrl(input: unknown): string | undefined {
  if (typeof input !== "string" || !input) return undefined;
  // Only allow same-origin relative URLs. This blocks `//evil.com` and absolute
  // URLs which Auth.js would otherwise honor.
  if (!input.startsWith("/") || input.startsWith("//")) return undefined;
  return input;
}

/**
 * Email magic link sign-in.
 *
 * On success, Auth.js sends the email and redirects to `redirectTo`. We send
 * the user back to `/{locale}/sign-in?sent=1&email=...` so they stay on the
 * same locale and see the "check your inbox" UI.
 */
export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const locale = safeLocale(formData.get("locale"));
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect({
      href: { pathname: "/sign-in", query: { error: "emailInvalid", ...(callbackUrl ? { callbackUrl } : {}) } },
      locale,
    });
  }

  const redirectTo = `/${locale}/sign-in?sent=1&email=${encodeURIComponent(email)}${
    callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
  }`;

  try {
    await signIn("resend", { email, redirectTo });
  } catch (e) {
    // `redirect()` inside next-auth throws a NEXT_REDIRECT we must rethrow.
    if (isRedirectError(e)) throw e;
    if (e instanceof AuthError) {
      redirect({
        href: { pathname: "/sign-in", query: { error: e.type ?? "generic" } },
        locale,
      });
    }
    redirect({
      href: { pathname: "/sign-in", query: { error: "generic" } },
      locale,
    });
  }
}

/**
 * Google OAuth sign-in.
 */
export async function signInWithGoogle(formData: FormData) {
  const locale = safeLocale(formData.get("locale"));
  const callbackUrl = safeCallbackUrl(formData.get("callbackUrl"));
  const redirectTo = callbackUrl ?? `/${locale}/account`;

  try {
    await signIn("google", { redirectTo });
  } catch (e) {
    if (isRedirectError(e)) throw e;
    if (e instanceof AuthError) {
      redirect({
        href: { pathname: "/sign-in", query: { error: e.type ?? "generic" } },
        locale,
      });
    }
    redirect({
      href: { pathname: "/sign-in", query: { error: "generic" } },
      locale,
    });
  }
}

function isRedirectError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { digest?: unknown };
  return typeof err.digest === "string" && err.digest.startsWith("NEXT_REDIRECT");
}
