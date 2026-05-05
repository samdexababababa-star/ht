"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";

type NavItem = { href: string; label: string };

export function AdminMobileNav({ items, email }: { items: NavItem[]; email: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-muted-2 ml-auto"
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
          <aside className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white border-r border-border p-4 flex flex-col">
            <div className="flex items-center justify-between">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 px-2 py-1"
              >
                <svg viewBox="0 0 64 64" fill="currentColor" className="h-5 w-5 text-foreground">
                  <path d="M32 8 L38 18 L49 15 L46 26 L56 32 L46 38 L49 49 L38 46 L32 56 L26 46 L15 49 L18 38 L8 32 L18 26 L15 15 L26 18 Z" />
                </svg>
                <span className="font-semibold tracking-tight">Salma admin</span>
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
            <nav className="mt-6 space-y-0.5">
              {items.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-muted-2 hover:text-foreground"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="mt-auto pt-4 border-t border-border flex items-center gap-3 text-xs text-muted">
              <div className="flex-1 truncate">{email}</div>
              <LogoutButton />
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
