"use client";

import { useSyncExternalStore } from "react";

/**
 * Live `prefers-reduced-motion`, as an external store rather than state so it is
 * SSR-safe and updates when the setting changes mid-session.
 */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const getSnapshot = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
/** The server cannot know, and assuming full motion matches the CSS defaults. */
const getServerSnapshot = () => false;

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
