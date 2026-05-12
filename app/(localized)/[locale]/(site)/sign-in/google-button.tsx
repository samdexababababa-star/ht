"use client";

import { useFormStatus } from "react-dom";

export function GoogleSignInButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 inline-flex items-center justify-center gap-2.5 rounded-xl border border-border bg-white text-foreground text-sm font-medium hover:bg-muted-2 active:scale-[0.99] transition disabled:opacity-60"
    >
      <GoogleGlyph />
      <span>{label}</span>
    </button>
  );
}

function GoogleGlyph() {
  // Inline SVG so we don't depend on any external asset.
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.55c2.08-1.92 3.29-4.74 3.29-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.55-2.77c-.99.66-2.26 1.05-3.73 1.05-2.87 0-5.3-1.93-6.17-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.83 14.09a6.6 6.6 0 0 1 0-4.18V7.07H2.18a11 11 0 0 0 0 9.86l3.65-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.07.56 4.21 1.65l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.65 2.84C6.7 7.31 9.13 5.38 12 5.38Z"
      />
    </svg>
  );
}
