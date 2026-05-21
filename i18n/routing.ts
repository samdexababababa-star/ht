import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fr";

export const localeLabels: Record<Locale, { native: string; flag: string; dir: "ltr" | "rtl" }> = {
  fr: { native: "Français", flag: "🇫🇷", dir: "ltr" },
  en: { native: "English", flag: "🇬🇧", dir: "ltr" },
  ar: { native: "العربية", flag: "🇸🇦", dir: "rtl" },
};

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localeDetection: true,
  localePrefix: "always",
});
