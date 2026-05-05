"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

type Cat = { id: string; slug: string; name: string };

export function MobileMenu({ brand, categories }: { brand: string; categories: Cat[] }) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when the drawer is open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2"
      >
        <Menu size={18} />
      </button>

      {open ? (
        <div className="md:hidden fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
          />
          <aside className="absolute top-0 right-0 bottom-0 w-80 max-w-[88vw] bg-white border-l border-border p-5 flex flex-col">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2"
              >
                <svg viewBox="0 0 64 64" fill="currentColor" className="h-5 w-5 text-foreground">
                  <path d="M32 8 L38 18 L49 15 L46 26 L56 32 L46 38 L49 49 L38 46 L32 56 L26 46 L15 49 L18 38 L8 32 L18 26 L15 15 L26 18 Z" />
                </svg>
                <span className="font-semibold tracking-tight">{brand}</span>
              </Link>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2"
              >
                <X size={18} />
              </button>
            </div>

            <Link
              href="/catalog"
              onClick={() => setOpen(false)}
              className="mt-6 btn btn-primary w-full justify-center"
            >
              Browse the catalog →
            </Link>

            {categories.length > 0 ? (
              <>
                <p className="mt-7 text-[11px] uppercase tracking-wider text-muted">
                  Categories
                </p>
                <nav className="mt-2 space-y-0.5">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-muted-2 hover:text-foreground"
                    >
                      <span>{c.name}</span>
                      <span className="text-muted">→</span>
                    </Link>
                  ))}
                </nav>
              </>
            ) : null}

            <p className="mt-7 text-[11px] uppercase tracking-wider text-muted">
              Account
            </p>
            <nav className="mt-2 space-y-0.5">
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-muted-2 hover:text-foreground"
              >
                <span>Cart</span>
                <span className="text-muted">→</span>
              </Link>
              <Link
                href="/p/about"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-muted-2 hover:text-foreground"
              >
                <span>How it works</span>
                <span className="text-muted">→</span>
              </Link>
            </nav>
          </aside>
        </div>
      ) : null}
    </>
  );
}
