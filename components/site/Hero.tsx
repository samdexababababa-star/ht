"use client";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { LogoMark } from "./LogoMark";

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  // Split title to highlight last 2 words in serif italic
  const words = title.split(" ");
  const head = words.slice(0, Math.max(0, words.length - 2)).join(" ");
  const tail = words.slice(-2).join(" ");

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-soft-grid pointer-events-none" />
      <div className="absolute inset-0 bg-blue-glow pointer-events-none" />
      <div className="relative max-w-6xl mx-auto px-5 pt-14 pb-20 md:pt-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="chip chip-blue mb-5 md:mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            New • Built for Africa, ready worldwide
          </div>
          <h1 className="text-[40px] md:text-7xl leading-[1.05] md:leading-[1.02] tracking-[-0.02em] font-semibold">
            {head ? <span>{head} </span> : null}
            <span className="serif-italic text-primary">{tail}</span>
          </h1>
          <p className="mt-5 md:mt-6 text-base md:text-xl text-muted max-w-xl">
            {subtitle}
          </p>
          <div className="mt-7 md:mt-8 flex flex-wrap items-center gap-3">
            <Link href={ctaHref} className="btn btn-primary">
              {ctaLabel} →
            </Link>
            <a href="#featured" className="btn btn-outline">
              ↓
            </a>
          </div>
        </motion.div>

        {/* Mobile-only floating S — keeps the brand sign alive on small
            screens (desktop already gets two larger ones below). The breathing
            halo behind it gives a soft, ambient "presence". */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="md:hidden absolute end-4 top-4 text-primary"
          aria-hidden
        >
          <span className="relative inline-flex items-center justify-center">
            <span className="hero-breathe absolute inset-0 rounded-full bg-primary/15 blur-xl" />
            <LogoMark className="salma-loop relative h-14 w-14 opacity-80" />
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="hidden md:block absolute end-10 top-24 text-primary parallax-soft"
          data-parallax-speed="0.18"
        >
          <LogoMark className="salma-loop h-28 w-28 opacity-80" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: 20 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="hidden md:block absolute end-44 top-72 text-primary parallax-soft"
          data-parallax-speed="0.32"
        >
          <LogoMark className="salma-loop h-12 w-12 opacity-60" />
        </motion.div>
      </div>
    </section>
  );
}
