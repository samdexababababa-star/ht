"use client";
import { useEffect, useState } from "react";

export function CartIndicator() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function read() {
      try {
        const raw = document.cookie
          .split("; ")
          .find((c) => c.startsWith("soha_cart="));
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

  if (!count) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
      {count}
    </span>
  );
}
