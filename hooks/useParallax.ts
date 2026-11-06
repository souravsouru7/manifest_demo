"use client";

import { useEffect, useRef, type RefObject } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Drifts elements vertically against the scroll position.
 *
 * Each ref moves by `scrollY * rate`, so layers given different rates separate as
 * the page moves and the flat backdrop reads as having depth. A positive rate
 * lags behind the page (distant), a negative one runs ahead of it (near).
 *
 * Writes straight to the element on a rAF tick rather than through React: this
 * runs on every scroll frame, and a re-render per frame would cost far more than
 * the effect is worth.
 *
 * It sets `translate`, not `transform`, because some of these layers already use
 * `transform` for their own geometry — .tm-sky-mid is mirrored with scaleX(-1),
 * and overwriting that would flip the mountains back mid-scroll. `translate` is
 * an independent property, so it composes instead of clobbering.
 */
export type ParallaxLayer = {
  ref: RefObject<HTMLElement | null>;
  /** Fraction of the scroll distance this layer moves. Keep well under 1. */
  rate: number;
};

export function useParallax(layers: ParallaxLayer[]) {
  const reducedMotion = useReducedMotion();
  // Read inside the tick so the scroll listener does not re-subscribe every
  // time the caller rebuilds this array inline. Assigned in an effect rather
  // than during render, which is not a safe place to touch a ref.
  const layersRef = useRef(layers);
  useEffect(() => {
    layersRef.current = layers;
  });

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const offset = window.scrollY;
      for (const { ref, rate } of layersRef.current) {
        const element = ref.current;
        if (element) element.style.translate = `0 ${(offset * rate).toFixed(2)}px`;
      }
    };

    // Coalesce to one write per frame; scroll fires far more often than that.
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply(); // Reloading part-way down the page must not start the layers at zero.
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      for (const { ref } of layersRef.current) {
        if (ref.current) ref.current.style.translate = "";
      }
    };
  }, [reducedMotion]);
}
