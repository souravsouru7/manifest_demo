"use client";

import type { RefObject } from "react";

import { gsap, ScrollTrigger, useGSAP } from "./gsap";
import { useRevealLines } from "./useRevealLines";

/**
 * The scroll vocabulary every below-hero section shares, driven by data
 * attributes so the section components stay declarative:
 *
 *   data-reveal-lines         heading lines rise out of a mask (useRevealLines)
 *   .tm-accent                yellow accent word wipes in after its line lands
 *   .tm-eyebrow-rule          the yellow rule beside an eyebrow grows out
 *   data-fade                 fades up; data-fade="left|right" slides in sideways
 *   data-delay="0.2"          extra delay for data-fade / data-clip
 *   data-clip="up|left|right|center|ellipse"
 *                             image/panel unmasked by a clip-path transition
 *   data-parallax="0.12"      scrubbed vertical drift, as a share of own height
 *
 * Everything lives inside a prefers-reduced-motion: no-preference media query.
 * Start states are applied by GSAP itself, so with reduced motion (or no JS)
 * nothing is ever hidden.
 */
export function useSectionMotion(scope: RefObject<HTMLElement | null>) {
  useRevealLines(scope, { start: "top 85%" });

  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const media = gsap.matchMedia(root);
      const q = gsap.utils.selector(root);
      const delayOf = (el: Element) => Number((el as HTMLElement).dataset.delay ?? 0);

      media.add("(prefers-reduced-motion: no-preference)", () => {
        q(".tm-eyebrow-rule").forEach((rule) => {
          gsap.from(rule, {
            scaleX: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: rule, start: "top 90%" },
          });
        });

        q(".tm-accent").forEach((word) => {
          gsap.from(word, {
            backgroundPosition: "100% 0",
            duration: 1.1,
            delay: 0.45,
            ease: "power2.inOut",
            scrollTrigger: { trigger: word, start: "top 85%" },
          });
        });

        q("[data-fade]").forEach((el) => {
          const dir = (el as HTMLElement).dataset.fade;
          const x = dir === "left" ? -48 : dir === "right" ? 48 : 0;
          gsap.from(el, {
            x,
            y: x ? 0 : 28,
            autoAlpha: 0,
            duration: 1,
            delay: delayOf(el),
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });

        const CLIP_FROM: Record<string, string> = {
          up: "inset(100% 0% 0% 0% round 2rem)",
          left: "inset(0% 100% 0% 0% round 2rem)",
          right: "inset(0% 0% 0% 100% round 2rem)",
          center: "inset(45% 45% 45% 45% round 2rem)",
          ellipse: "ellipse(0% 0% at 50% 50%)",
        };
        const CLIP_TO: Record<string, string> = {
          up: "inset(0% 0% 0% 0% round 2rem)",
          left: "inset(0% 0% 0% 0% round 2rem)",
          right: "inset(0% 0% 0% 0% round 2rem)",
          center: "inset(0% 0% 0% 0% round 2rem)",
          ellipse: "ellipse(75% 75% at 50% 50%)",
        };

        q("[data-clip]").forEach((el) => {
          const kind = (el as HTMLElement).dataset.clip || "up";
          const image = el.querySelector("img");
          const tl = gsap.timeline({
            delay: delayOf(el),
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
          tl.fromTo(
            el,
            { clipPath: CLIP_FROM[kind] ?? CLIP_FROM.up },
            {
              clipPath: CLIP_TO[kind] ?? CLIP_TO.up,
              duration: 1.4,
              ease: "expo.inOut",
              // Leave no inline clip behind: CSS owns the resting shape.
              clearProps: "clipPath",
            },
          );
          if (image) tl.from(image, { scale: 1.18, duration: 1.8, ease: "expo.out" }, 0.1);
        });

        q("[data-parallax]").forEach((el) => {
          const rate = Number((el as HTMLElement).dataset.parallax) || 0.1;
          gsap.fromTo(
            el,
            { yPercent: rate * -50 },
            {
              yPercent: rate * 50,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement ?? el,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        });
      });

      // Lazy images change the layout under ScrollTrigger's cached positions.
      const images = Array.from(root.querySelectorAll("img"));
      const refresh = () => ScrollTrigger.refresh();
      images.forEach((img) => {
        if (!img.complete) img.addEventListener("load", refresh, { once: true });
      });
      return () => images.forEach((img) => img.removeEventListener("load", refresh));
    },
    { scope },
  );
}
