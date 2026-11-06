"use client";

import { useEffect, useState } from "react";

/**
 * Tracks everything on the page besides the hero frames: every visible image,
 * and the web fonts. An image that fails still counts as finished, so one bad
 * file can't hold the loader up.
 */
export function useAssetProgress() {
  const [images, setImages] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    // Only what the first screen is made of is waited for. Lazy images (every
    // section below the hero) don't start downloading until they are scrolled
    // near, and scrolling is locked while the loader is up, so waiting on them
    // stalled the loader until its timeout. Images hidden on this screen size
    // (display: none) aren't waited for either.
    const tracked = [...document.images].filter(
      (image) => image.loading !== "lazy" && getComputedStyle(image).display !== "none",
    );
    const update = () => {
      if (cancelled) return;
      const finished = tracked.filter((image) => image.complete).length;
      setImages(tracked.length ? finished / tracked.length : 1);
    };

    tracked.forEach((image) => {
      image.addEventListener("load", update);
      image.addEventListener("error", update);
    });
    update();

    void document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });

    return () => {
      cancelled = true;
      tracked.forEach((image) => {
        image.removeEventListener("load", update);
        image.removeEventListener("error", update);
      });
    };
  }, []);

  return { images, fontsReady };
}
