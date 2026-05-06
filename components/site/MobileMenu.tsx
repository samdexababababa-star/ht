"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { LogoMark } from "./LogoMark";

type Cat = { id: string; slug: string; name: string };

export function MobileMenu({ brand, categories }: { brand: string; categories: Cat[] }) {
  const [open, setOpen] = useState(false);
  // Track when we're mounted on the client so the portal target (document.body)
  // is available and we don't trip a hydration mismatch. The setState-in-effect
  // pattern is intentional here — it's the standard SSR-safe portal idiom.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Lock body scroll when the drawer is open.
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Items rendered as a single ordered list so we can stagger their entry
  // with a uniform animation-delay step. Pairing nav links into one cascade
  // gives the drawer a deliberate, choreographed feel on mobile rather than
  // a single hard cut.
  type Item = { kind: "header" } | { kind: "cta" } | { kind: "section"; label: string } | { kind: "link"; href: string; label: string };
  const items: Item[] = [
    { kind: "header" },
    { kind: "cta" },
    ...(categories.length
      ? ([{ kind: "section", label: "Categories" }, ...categories.map<Item>((c) => ({ kind: "link", href: `/category/${c.slug}`, label: c.name }))] as Item[])
      : []),
    { kind: "section", label: "Account" },
    { kind: "link", href: "/cart", label: "Cart" },
    { kind: "link", href: "/p/about", label: "How it works" },
  ];

  // The drawer is rendered through a portal directly under <body> so it
  // escapes any ancestor stacking context (like the sticky header's
  // backdrop-filter context, which otherwise traps the drawer below the page
  // content and breaks the backdrop-blur behind it).
  const drawer = open ? (
    <div className="md:hidden fixed inset-0 z-[100]">
      {/* Dimming + heavy blur backdrop — pushes the page far behind
          so nothing competes with drawer content. */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0 drawer-backdrop"
        style={{
          background: "rgba(15, 17, 21, 0.42)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      {/* Drawer itself: iOS-style "liquid glass" — heavy frosted white that
          keeps drawer text fully readable while letting a faint hint of the
          page color/imagery come through, with subtle edge highlights.
          Spring-in from the right (drawer-spring), then items cascade
          inside with a small per-item delay. */}
      <aside
        className="absolute top-0 right-0 bottom-0 w-80 max-w-[88vw] p-5 flex flex-col drawer-spring"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 0 80px -20px rgba(0,0,0,0.35)",
        }}
      >
        {items.map((it, i) => {
          const delay = `${0.06 + i * 0.04}s`;
          if (it.kind === "header") {
            return (
              <div
                key={`h-${i}`}
                className="flex items-center justify-between drawer-item"
                style={{ animationDelay: delay }}
              >
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2"
                >
                  <LogoMark className="h-5 w-5 text-foreground" />
                  <span className="font-semibold tracking-tight">{brand}</span>
                </Link>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setOpen(false)}
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-white/60 active:scale-95 transition"
                >
                  <X size={18} />
                </button>
              </div>
            );
          }
          if (it.kind === "cta") {
            return (
              <Link
                key={`cta-${i}`}
                href="/catalog"
                onClick={() => setOpen(false)}
                className="mt-6 btn btn-primary w-full justify-center drawer-item"
                style={{ animationDelay: delay }}
              >
                Browse the catalog →
              </Link>
            );
          }
          if (it.kind === "section") {
            return (
              <p
                key={`s-${i}`}
                className="mt-7 text-[11px] uppercase tracking-wider text-muted drawer-item"
                style={{ animationDelay: delay }}
              >
                {it.label}
              </p>
            );
          }
          return (
            <Link
              key={`l-${i}`}
              href={it.href}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-white/60 hover:text-foreground active:scale-[0.98] active:bg-white/80 transition drawer-item"
              style={{ animationDelay: delay }}
            >
              <span>{it.label}</span>
              <span className="text-muted">→</span>
            </Link>
          );
        })}
      </aside>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2 active:scale-90 transition"
      >
        <Menu size={18} />
      </button>
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
