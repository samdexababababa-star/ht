"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { Globe, Check } from "lucide-react";

type Variant = "header" | "footer" | "drawer";

export function LanguageSwitcher({ variant = "header" }: { variant?: Variant }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  function pick(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    start(() => {
      // useRouter from next-intl rewrites the URL with the new locale.
      // params provides any [slug] segments so dynamic routes are preserved.
      router.replace(
        // @ts-expect-error - dynamic params are passed through verbatim
        { pathname, params },
        { locale: next },
      );
    });
  }

  if (variant === "drawer") {
    return (
      <div className="mt-1 flex flex-col gap-1">
        {locales.map((l) => {
          const meta = localeLabels[l];
          const isActive = l === locale;
          return (
            <button
              key={l}
              type="button"
              onClick={() => pick(l)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] transition ${
                isActive
                  ? "bg-foreground text-white"
                  : "text-foreground/80 hover:bg-white/60 hover:text-foreground"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span aria-hidden>{meta.flag}</span>
                {meta.native}
              </span>
              {isActive ? <Check size={14} /> : null}
            </button>
          );
        })}
      </div>
    );
  }

  const meta = localeLabels[locale];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "footer"
            ? "inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground"
            : "h-9 px-2.5 inline-flex items-center gap-1.5 rounded-full text-sm text-foreground/80 hover:bg-muted-2"
        }
      >
        <Globe size={14} />
        <span aria-hidden>{meta.flag}</span>
        <span className="hidden sm:inline">{meta.native}</span>
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute z-50 ${
            variant === "footer" ? "bottom-full mb-2" : "top-full mt-2"
          } end-0 min-w-[160px] bg-white border border-border rounded-xl shadow-lg p-1`}
        >
          {locales.map((l) => {
            const m = localeLabels[l];
            const isActive = l === locale;
            return (
              <button
                key={l}
                role="menuitem"
                type="button"
                onClick={() => pick(l)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-muted-2 text-foreground"
                    : "text-foreground/80 hover:bg-muted-2 hover:text-foreground"
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <span aria-hidden>{m.flag}</span>
                  {m.native}
                </span>
                {isActive ? <Check size={14} /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
