import type Lenis from "lenis";

/**
 * The live Lenis instance, so anything on the page can drive the scroll without
 * prop-drilling from the layout. Null until SmoothScroll mounts, and null again
 * under reduced motion — callers must fall back to native scrolling.
 */
let instance: Lenis | null = null;

export function setLenis(next: Lenis | null) {
  instance = next;
}

export function getLenis() {
  return instance;
}
