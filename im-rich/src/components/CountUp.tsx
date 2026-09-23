"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({
  value,
  durationMs = 900,
  className = "",
  prefix = "",
  suffix = "",
}: {
  value: number;
  durationMs?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setDisplay(value);
      return;
    }

    if (startedRef.current) {
      setDisplay(value);
      return;
    }
    startedRef.current = true;

    const start = performance.now();
    const from = 0;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [value, durationMs]);

  return (
    <span className={`tabular ${className}`}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
