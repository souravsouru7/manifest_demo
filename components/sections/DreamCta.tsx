"use client";

import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, Play } from "lucide-react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import Magnetic from "@/components/motion/Magnetic";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

/**
 * DREAM SPACE CTA — a low, wide strip (not a hero).
 *
 * The strip opens out from a narrow clip as it enters, and the panoramic image
 * inside it pans slowly with the scroll.
 */
export default function DreamCta() {
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".tm-cta-strip",
          { clipPath: "inset(0% 18% 0% 18% round 2rem)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 2rem)",
            duration: 1.4,
            ease: "expo.inOut",
            clearProps: "clipPath",
            scrollTrigger: { trigger: ".tm-cta-strip", start: "top 88%" },
          },
        );
        gsap.fromTo(
          ".tm-cta-photo img",
          { scale: 1.2, xPercent: -4 },
          {
            scale: 1.05,
            xPercent: 3,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.from(".tm-cta-actions > *", {
          y: 24,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.12,
          delay: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-cta-strip", start: "top 88%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="tm-cta-title" className="tm-section tm-cta">
      <Image
        aria-hidden
        src="/tm/sections/mist-panorama.webp"
        alt=""
        width={2400}
        height={864}
        sizes="100vw"
        className="tm-cta-mist"
        data-parallax="0.2"
      />
      <div className="tm-shell">
        <div className="tm-cta-strip">
          <div className="tm-cta-photo">
            <Image
              src="/tm/sections/interior.webp"
              alt="Warm, glass-walled living space looking out over green hills at golden hour"
              fill
              sizes="(max-width: 768px) 92vw, 40vw"
            />
          </div>
          <div className="tm-cta-copy">
            <h2 id="tm-cta-title" className="tm-h2 tm-cta-title" data-reveal-lines>
              Let&rsquo;s Create Your <em className="tm-accent">Dream Space</em>
            </h2>
            <div className="tm-cta-actions">
              <Magnetic>
                <a href="#contact" className="tm-btn tm-btn-yellow">
                  Start a Project
                  <ArrowRight aria-hidden />
                </a>
              </Magnetic>
              <Magnetic>
                <a href="#contact" className="tm-btn tm-btn-ghost">
                  <span aria-hidden className="tm-btn-play">
                    <Play fill="currentColor" strokeWidth={0} />
                  </span>
                  Talk to Our Team
                </a>
              </Magnetic>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
