"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
import { LogoutButton } from "./LogoutButton";
import { LogoMark } from "@/components/site/LogoMark";

type NavItem = { href: string; label: string };

export function AdminMobileNav({ items, email }: { items: NavItem[]; email: string }) {
  const [open, setOpen] = useState(false);
  // Track when we're mounted on the client so document.body is available for
  // the portal and we don't trip a hydration mismatch. The setState-in-effect
  // pattern is intentional here — it's the standard SSR-safe portal idiom.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const drawer = open ? (
    <div className="md:hidden fixed inset-0 z-[100]">
      <button
        type="button"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
        className="absolute inset-0"
        style={{
          background: "rgba(15, 17, 21, 0.42)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      />
      <aside
        className="absolute top-0 left-0 bottom-0 w-72 max-w-[85vw] p-4 flex flex-col"
        style={{
          background: "rgba(255, 255, 255, 0.82)",
          backdropFilter: "blur(28px) saturate(180%)",
          WebkitBackdropFilter: "blur(28px) saturate(180%)",
          borderRight: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 0 80px -20px rgba(0,0,0,0.35)",
        }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 px-2 py-1"
          >
            <LogoMark className="h-5 w-5 text-foreground" />
            <span className="font-semibold tracking-tight">Salma admin</span>
          </Link>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-full hover:bg-white/60"
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
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[14px] text-foreground/80 hover:bg-white/60 hover:text-foreground"
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
  ) : null;

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
      {mounted && drawer ? createPortal(drawer, document.body) : null}
    </>
  );
}
