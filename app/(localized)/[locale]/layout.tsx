import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, localeLabels, type Locale } from "@/i18n/routing";
import { getSettings, SETTING_DEFAULTS } from "@/lib/settings";
import "../../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

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
  // Translate tagline when admin hasn't overridden the schema default
  let tagline = s?.tagline ?? SETTING_DEFAULTS.tagline;
  if (tagline === SETTING_DEFAULTS.tagline) {
    try {
      const t = await getTranslations({ locale, namespace: "common" });
      tagline = t("tagline");
    } catch {
      /* fall back to default if translations unavailable */
    }
  }
  return {
    title: { default: `${brand} — ${tagline}`, template: `%s — ${brand}` },
    description: tagline,
    icons: { icon: s?.faviconUrl || "/brand/favicon.svg" },
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
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
