import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing, localeLabels, type Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/settings";
import { LocaleHtmlAttrs } from "@/components/site/LocaleHtmlAttrs";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  let s;
  try {
    s = await getSettings();
  } catch {
    s = null;
  }
  const brand = s?.brandName ?? "Salma";
  const tagline = s?.tagline ?? "Premium digital subscriptions, services & boosts.";
  return {
    title: { default: `${brand} — ${tagline}`, template: `%s — ${brand}` },
    description: tagline,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}`]),
      ),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const dir = localeLabels[locale as Locale].dir;

  return (
    <NextIntlClientProvider>
      <LocaleHtmlAttrs locale={locale} dir={dir} />
      {children}
    </NextIntlClientProvider>
  );
}
