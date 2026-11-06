"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/** Splits "10K+" into 10 and "K+" — the number to count and the text to keep. */
const VALUE_PATTERN = /^(\d+(?:\.\d+)?)(.*)$/;

const DURATION_MS = 1400;
/** Decelerating, so the number lands softly instead of stopping dead. */
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts a display value like "15+", "10K+" or "100%" up from zero, preserving
 * whatever suffix it carries.
 *
 * `run` gates the start, so the count can wait for the opener to finish rather
 * than burning through behind a loader. Until then the figure reads as zero —
 * it is behind the loader anyway, and starting there means no visible jump when
 * the count does begin. Reduced motion, or anything not starting with a number,
 * returns the value untouched.
 */
export function useCountUp(value: string, run: boolean): string {
  const reducedMotion = useReducedMotion();
  const [frame, setFrame] = useState<string | null>(null);

  const match = VALUE_PATTERN.exec(value);
  const animatable = match !== null && !reducedMotion;
  const digits = match?.[1] ?? "";
  const suffix = match?.[2] ?? "";
  /** "13.2" counts in tenths; "15" counts in whole numbers. */
  const decimals = digits.split(".")[1]?.length ?? 0;

  useEffect(() => {
    if (!animatable || !run) return;

    const target = Number(digits);
    let request = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / DURATION_MS, 1);
      setFrame((target * ease(progress)).toFixed(decimals) + suffix);
      if (progress < 1) request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(request);
  }, [animatable, decimals, digits, run, suffix]);

  if (!animatable) return value;
  return frame ?? (0).toFixed(decimals) + suffix;
}
