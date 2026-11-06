"use client";

import Lenis from "lenis";
import { useEffect } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

import { gsap, ScrollTrigger } from "./gsap";
import { setLenis } from "./lenis";

/**
 * Smooth scrolling, and the handshake between Lenis and ScrollTrigger.
 *
 * Renders nothing. Mounted from the root layout so the whole page — including
 * the hero, which knows nothing about any of this — scrolls through Lenis.
 *
 * Deliberately does not touch any hero file or globals.css: the two things it
 * needs from the document (scroll-behaviour, and knowing when the hero has
 * locked the page) are both read and written from here instead.
 */
export default function SmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const root = document.documentElement;

    // No CSS hides content, so skipping all of this simply leaves a static,
    // fully legible page.
    if (reducedMotion) return;

    // Lets CSS know JS motion is live. Load-bearing in one place: the desktop
    // project gallery only hands its native scroll-snap row over to the pin
    // under this class, so the cards are never stranded behind an overflow:clip
    // with nothing driving them.
    root.classList.add("motion-ready");

    // Native smooth scrolling interpolates on top of Lenis's own easing and the
    // two fight. globals.css sets it, but the hero reads that file, so it gets
    // overridden from here and restored on the way out.
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      autoRaf: false, // GSAP's ticker drives it instead, see below
      duration: 1.1,
      // In-page nav links (#projects, #about, …) land through Lenis
      anchors: { offset: 0, duration: 1.4 },
    });
    setLenis(lenis);

    // One clock for both libraries. Without this the scrub animations lag a
    // frame behind the scroll position and every pin visibly jitters.
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // HeroVideo locks html+body while the loader is up and VideoLightbox locks
    // body while it is open, both with overflow:hidden. Watching for it keeps
    // Lenis in step without either hero file needing to know Lenis exists.
    const syncScrollLock = () => {
      const locked =
        getComputedStyle(root).overflowY === "hidden" ||
        getComputedStyle(document.body).overflowY === "hidden";
      if (locked) lenis.stop();
      else lenis.start();
    };
    syncScrollLock();

    const lockObserver = new MutationObserver(syncScrollLock);
    const watched = { attributes: true, attributeFilter: ["style", "class"] };
    lockObserver.observe(root, watched);
    lockObserver.observe(document.body, watched);

    return () => {
      lockObserver.disconnect();
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
      root.style.scrollBehavior = previousScrollBehavior;
      root.classList.remove("motion-ready");
    };
  }, [reducedMotion]);

  return null;
}
