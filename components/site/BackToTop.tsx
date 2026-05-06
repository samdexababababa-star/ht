"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

// Floating back-to-top button. Mobile-first (hidden on md+ where users can
// just scroll). Appears after 600px of scroll, with a fade. Uses the system
// `prefers-reduced-motion` for the smooth-scroll choice.
//
// Master toggle: Settings.backToTopEnabled.

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function go() {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      onClick={go}
      aria-label="Back to top"
      data-visible={visible}
      className="md:hidden fixed bottom-24 right-4 z-30 h-11 w-11 rounded-full bg-foreground text-white shadow-lg flex items-center justify-center transition-all duration-300 data-[visible=false]:opacity-0 data-[visible=false]:translate-y-2 data-[visible=false]:pointer-events-none active:scale-90 [bottom:calc(env(safe-area-inset-bottom)+88px)]"
    >
      <ArrowUp size={18} />
    </button>
  );
}
