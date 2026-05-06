"use client";
import { useEffect, useRef, useState } from "react";
import { X, Tag } from "lucide-react";

// Exit-intent popup. Two trigger modes:
//   • Desktop: mouse leaves the top of the viewport (classic exit-intent)
//   • Mobile: detected via a hard scroll *up* near the very top of the page
//     (≥80px upward in <300ms while scrollY < 100). This is the closest
//     analogue to "looking like you're about to leave" on touch.
//
// Once dismissed, we suppress for 24h via localStorage so it isn't annoying.
// Master toggle: Settings.exitIntentEnabled.

const STORAGE_KEY = "salma:exit-intent-dismissed-at";
const QUIET_MS = 24 * 60 * 60 * 1000;

export function ExitIntentPopup({
  text,
  code,
}: {
  text: string;
  code?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const armed = useRef(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(STORAGE_KEY) ?? "0");
      if (last && Date.now() - last < QUIET_MS) {
        armed.current = false;
        return;
      }
    } catch {
      /* noop */
    }

    let lastY = 0;
    let lastT = 0;
    function onMouseLeave(e: MouseEvent) {
      if (!armed.current) return;
      // Only fire when leaving via the TOP edge (towards the URL bar).
      if (e.clientY <= 0) {
        armed.current = false;
        setOpen(true);
      }
    }
    function onTouchScroll() {
      if (!armed.current) return;
      const y = window.scrollY;
      const t = performance.now();
      // Hard upward swipe near the top of the page.
      if (lastT && y < 100 && lastY - y > 80 && t - lastT < 300) {
        armed.current = false;
        setOpen(true);
      }
      lastY = y;
      lastT = t;
    }
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onTouchScroll, { passive: true });
    return () => {
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onTouchScroll);
    };
  }, []);

  function close() {
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    setOpen(false);
  }

  function copy() {
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4 exit-intent-fade"
    >
      <div className="w-full sm:max-w-sm bg-white rounded-3xl shadow-2xl p-6 relative">
        <button
          type="button"
          aria-label="Close"
          onClick={close}
          className="absolute right-3 top-3 h-8 w-8 inline-flex items-center justify-center rounded-full text-muted hover:text-foreground hover:bg-muted-2 transition"
        >
          <X size={16} />
        </button>
        <div className="h-10 w-10 rounded-full bg-primary-soft flex items-center justify-center text-primary">
          <Tag size={18} />
        </div>
        <h2 className="mt-3 text-xl tracking-tight font-medium leading-tight">
          {text}
        </h2>
        {code ? (
          <>
            <p className="mt-2 text-sm text-muted">
              Use this code at checkout. Tap to copy.
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-3 w-full h-12 rounded-2xl border-2 border-dashed border-primary text-primary text-base font-semibold tracking-[0.16em] uppercase hover:bg-primary-soft transition"
            >
              {copied ? "Copied!" : code}
            </button>
          </>
        ) : null}
        <button
          type="button"
          onClick={close}
          className="mt-3 w-full text-xs text-muted hover:text-foreground"
        >
          No thanks, keep browsing
        </button>
      </div>
    </div>
  );
}
