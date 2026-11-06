"use client";

import Image from "next/image";
import { useRef } from "react";
import { Leaf, Sun, Mountain } from "lucide-react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

import Eyebrow from "./Eyebrow";

const VALUES = [
  {
    icon: Mountain,
    title: "Rooted in place",
    copy: "Every plan begins with the land: its slope, its trees, its light and its monsoon.",
  },
  {
    icon: Sun,
    title: "Designed for light",
    copy: "Open plans, deep verandas and cross-ventilation so a home stays bright and cool.",
  },
  {
    icon: Leaf,
    title: "Built to last",
    copy: "Honest materials and careful detailing that age gracefully in a tropical climate.",
  },
];

/**
 * OUR PHILOSOPHY — the first section below the hero.
 *
 * Opens on the hero's skirt colour (--hero-next-bg) and grades to pale sky, so
 * the join is invisible. Editorial copy left, a tall curved photograph centre,
 * three values right, and two tropical plants framing the edges.
 */
export default function Philosophy() {
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // The plants drift in from the edges as the section scrolls through.
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(".tm-philo-plant-left", { xPercent: -35, yPercent: 10 }, { xPercent: 0, yPercent: -8, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-philo-plant-right", { xPercent: 35, yPercent: -6 }, { xPercent: 0, yPercent: 10, ease: "none", scrollTrigger: scrub });

        gsap.from(".tm-value", {
          x: 40,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-values", start: "top 85%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" aria-labelledby="tm-philo-title" className="tm-section tm-philo">
      <Image
        src="/tm/sections/plant-left.webp"
        alt=""
        width={1000}
        height={1164}
        sizes="(max-width: 768px) 40vw, 22vw"
        className="tm-plant tm-sway tm-philo-plant-left"
      />
      <Image
        src="/tm/sections/plant-right.webp"
        alt=""
        width={900}
        height={1499}
        sizes="(max-width: 768px) 30vw, 14vw"
        className="tm-plant tm-sway tm-sway-alt tm-philo-plant-right"
      />

      <div className="tm-shell tm-philo-grid">
        <div className="tm-philo-intro">
          <Eyebrow>Our Philosophy</Eyebrow>
          <h2 id="tm-philo-title" className="tm-h2" data-reveal-lines>
            Architecture that <em className="tm-accent">breathes</em> with nature
          </h2>
          <p className="tm-lede" data-fade data-delay="0.2">
            We design homes and community spaces that feel as if they have always belonged to
            their landscape: calm, open and full of natural light.
          </p>
        </div>

        <div className="tm-philo-photo-wrap" data-clip="up">
          <div className="tm-philo-photo">
            <Image
              src="/tm/sections/philosophy-interior.webp"
              alt="Open living room under a timber and thatch ceiling, with linen sofas, paper lanterns and garden views through tall glass"
              fill
              sizes="(max-width: 768px) 92vw, 36vw"
              data-parallax="0.08"
            />
          </div>
        </div>

        <ul className="tm-values">
          {VALUES.map(({ icon: Icon, title, copy }) => (
            <li key={title} className="tm-value">
              <span className="tm-value-icon" aria-hidden>
                <Icon />
              </span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
