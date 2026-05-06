"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// Pinned-to-top promo strip. Shows the operator's chosen text and (optionally)
// links somewhere. Persists a "dismissed" flag in localStorage so visitors who
// have closed it once aren't badgered every page-load.
//
// Master toggle: Settings.stickyPromoEnabled (admin/growth → Trust).

const STORAGE_KEY = "salma:promo-dismissed";

export function StickyPromoBanner({
  text,
  href,
}: {
  text: string;
  href?: string | null;
}) {
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    function read() {
      try {
        setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
      } catch {
        setDismissed(false);
      }
    }
    read();
  }, []);

  if (dismissed !== false) return null;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
    setDismissed(true);
  }

  const content = (
    <span className="block truncate text-[12px] tracking-[0.04em]">{text}</span>
  );

  return (
    <div className="bg-primary text-white relative">
      <div className="max-w-6xl mx-auto px-10 py-2 text-center">
        {href ? (
          <Link
            href={href}
            className="block hover:underline focus:outline-none"
          >
            {content}
          </Link>
        ) : (
          content
        )}
      </div>
      <button
        type="button"
        aria-label="Dismiss banner"
        onClick={dismiss}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 inline-flex items-center justify-center rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
          <path
            d="M2 2l6 6M8 2l-6 6"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        </svg>
      </button>
    </div>
  );
}
