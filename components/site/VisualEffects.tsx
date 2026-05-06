"use client";
import { useEffect } from "react";

type Props = {
  depth: boolean;
  reveal: boolean;
  parallax: boolean;
};

export function VisualEffects({ depth, reveal, parallax }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    if (depth) root.setAttribute("data-depth", "on");
    else root.removeAttribute("data-depth");
    if (reveal) root.setAttribute("data-reveal", "on");
    else root.removeAttribute("data-reveal");
    if (parallax) root.setAttribute("data-parallax", "on");
    else root.removeAttribute("data-parallax");
    return () => {
      root.removeAttribute("data-depth");
      root.removeAttribute("data-reveal");
      root.removeAttribute("data-parallax");
    };
  }, [depth, reveal, parallax]);

  // Scroll-reveal observer.
  useEffect(() => {
    if (!reveal) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.visible = "true";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reveal]);

  // Lightweight parallax: bind once, drive --parallax-y from scrollY * speed.
  useEffect(() => {
    if (!parallax) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const els = Array.from(
      document.querySelectorAll<HTMLElement>(".parallax-soft"),
    );
    if (!els.length) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        for (const el of els) {
          const speed = parseFloat(el.dataset.parallaxSpeed ?? "0.12");
          el.style.setProperty("--parallax-y", `${y * speed * -1}px`);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [parallax]);

  return null;
}
