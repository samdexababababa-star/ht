import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { auth } from "@/auth";
import { getSettings } from "@/lib/settings";
import { Mail, ChevronLeft } from "lucide-react";
import { signInWithEmail, signInWithGoogle } from "./actions";
import { GoogleSignInButton } from "./google-button";
import { SignInForm } from "./sign-in-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.page" });
  return { title: t("title") };
}

type SearchParams = Promise<{
  sent?: string;
  email?: string;
  error?: string;
  callbackUrl?: string;
}>;

export default async function SignInPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const [{ locale }, sp, session, settings] = await Promise.all([
    params,
    searchParams,
    auth(),
    getSettings(),
  ]);

  // Already signed in → bounce to account (respecting any callbackUrl).
  if (session?.user) {
    const target = sp.callbackUrl && sp.callbackUrl.startsWith("/")
      ? sp.callbackUrl
      : "/account";
    redirect({ href: target, locale });
  }

  const t = await getTranslations("auth");
  const tPage = await getTranslations("auth.page");
  const tErrors = await getTranslations("auth.errors");
  const tVerify = await getTranslations("auth.verify");

  const errorKey = sp.error
    ? // Auth.js v5 sends URL params like "OAuthAccountNotLinked", "Verification", etc.
      // We have first-class translations for the common ones; the rest fall
      // back to a generic message.
      ["OAuthAccountNotLinked", "AccessDenied", "Verification", "emailInvalid", "emailRequired"].includes(sp.error)
      ? sp.error
      : "Default"
    : null;

  const sent = sp.sent === "1" && sp.email;

  return (
    <main className="min-h-[calc(100vh-7rem)] flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-4 transition"
        >
          <ChevronLeft size={14} className="rtl-mirror" />
          <span>{tPage("backHome")}</span>
        </Link>

        <div className="card p-7 md:p-9">
          <div className="text-center">
            <h1 className="text-2xl md:text-[28px] tracking-tight">
              {sent ? tVerify("title") : tPage("title")}
            </h1>
            <p className="mt-2 text-sm text-muted">
              {sent ? null : tPage("subtitle")}
            </p>
          </div>

          {sent ? (
            <VerifyRequest email={String(sp.email)} locale={locale} tVerify={tVerify} />
          ) : (
            <>
              <div className="mt-6 space-y-3">
                <form action={signInWithGoogle}>
                  <input type="hidden" name="locale" value={locale} />
                  {sp.callbackUrl ? (
                    <input type="hidden" name="callbackUrl" value={sp.callbackUrl} />
                  ) : null}
                  <GoogleSignInButton label={t("withGoogle")} />
                </form>

                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center" aria-hidden>
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                    <span className="bg-card px-3 text-muted">{t("or")}</span>
                  </div>
                </div>

                <SignInForm
                  locale={locale}
                  callbackUrl={sp.callbackUrl}
                  labels={{
                    emailLabel: tPage("emailLabel"),
                    emailHint: tPage("emailHint"),
                    placeholder: t("emailPlaceholder"),
                    submit: t("sendMagicLink"),
                    submitting: t("sending"),
                  }}
                  action={signInWithEmail}
                />
              </div>

              {errorKey ? (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {tErrors(errorKey as never)}
                </div>
              ) : null}

              <p className="mt-6 text-[11px] leading-relaxed text-muted text-center">
                {tPage("legal")}
              </p>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted">
          <Mail size={11} className="inline-block me-1 align-[-1px]" />
          {settings.supportEmail || "support@salma.local"}
        </p>
      </div>
    </main>
  );
}

function VerifyRequest({
  email,
  locale,
  tVerify,
}: {
  email: string;
  locale: string;
  tVerify: Awaited<ReturnType<typeof getTranslations<"auth.verify">>>;
}) {
  return (
    <div className="mt-6 text-center space-y-4">
      <p
        className="text-sm text-foreground/80"
        dangerouslySetInnerHTML={{
          __html: tVerify("body", { email: escapeHtml(email) }) as unknown as string,
        }}
      />
      <p className="text-xs text-muted">{tVerify("hint")}</p>
      <div className="pt-2 flex flex-col items-center gap-2">
        <Link
          href={`/sign-in?email=${encodeURIComponent(email)}`}
          className="text-sm text-foreground underline-offset-4 hover:underline"
          locale={locale as never}
        >
          {tVerify("resend")}
        </Link>
        <Link
          href="/sign-in"
          className="text-xs text-muted hover:text-foreground"
          locale={locale as never}
        >
          {tVerify("different")}
        </Link>
      </div>
    </div>
  );
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
