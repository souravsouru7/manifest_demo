"use client";

import type { RefObject } from "react";

import { gsap, SplitText, useGSAP } from "./gsap";

type Options = {
  /** Resolved inside `scope`. Mark headings with data-reveal-lines. */
  selector?: string;
  start?: string;
  stagger?: number;
  duration?: number;
};

/**
 * Masked line-by-line heading reveal: each line slides up out of its own
 * clipping box, so the text appears to rise from behind the line above it.
 */
export function useRevealLines(scope: RefObject<HTMLElement | null>, options: Options = {}) {
  const {
    selector = "[data-reveal-lines]",
    start = "top 82%",
    stagger = 0.09,
    duration = 1.15,
  } = options;

  useGSAP(
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(selector, scope.current ?? undefined);
      if (!targets.length) return;

      const splits = targets.map((target) =>
        SplitText.create(target, {
          type: "lines",
          mask: "lines",
          linesClass: "tm-line",
          /* Re-splits when the webfont lands and on resize. Without it the line
             breaks get measured against the fallback font and come out wrong. */
          autoSplit: true,
          /* Returning the tween lets GSAP discard it when it re-splits. */
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 115,
              duration,
              ease: "expo.out",
              stagger,
              scrollTrigger: { trigger: target, start },
            }),
        }),
      );

      return () => splits.forEach((split) => split.revert());
    },
    { scope, dependencies: [selector, start, stagger, duration] },
  );
}
