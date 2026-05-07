"use client";

import { useEffect } from "react";

export function LocaleHtmlAttrs({
  locale,
  dir,
}: {
  locale: string;
  dir: "ltr" | "rtl";
}) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);
  return null;
}
