"use client";
import { useEffect, useRef, useState } from "react";

export function CartIndicator() {
  const [count, setCount] = useState(0);
  const [bump, setBump] = useState(0);
  // Track previous count so we can fire a bounce only on the rising edge
  // (item just added) — not on initial mount or on decrement. Bounce key
  // changes each time so React re-applies the animation class.
  const prevRef = useRef<number | null>(null);

  useEffect(() => {
    function read() {
      try {
        const raw = document.cookie
          .split("; ")
          .find((c) => c.startsWith("salma_cart="));
        if (!raw) return setCount(0);
        const json = decodeURIComponent(raw.split("=")[1] || "");
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          setCount(parsed.reduce((a, b) => a + (b?.quantity ?? 0), 0));
        }
      } catch {
        setCount(0);
      }
    }
    read();
    const i = setInterval(read, 1500);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    if (prevRef.current !== null && count > prevRef.current) {
      setBump((b) => b + 1);
    }
    prevRef.current = count;
  }, [count]);

  if (!count) return null;
  return (
    <span
      key={bump}
      className="cart-bump absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center"
    >
      {count}
    </span>
  );
}
