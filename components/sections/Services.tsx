"use client";

import Image from "next/image";
import { useRef } from "react";
import { Armchair, Building2, Home } from "lucide-react";

import { gsap, ScrollTrigger, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

import Eyebrow from "./Eyebrow";

const SERVICES = [
  { label: "Residential Homes", icon: "/tm/sections/icon-home.webp", w: 192, h: 182 },
  { label: "Community Spaces", icon: "/tm/sections/icon-community.webp", w: 192, h: 175 },
  { label: "Interior Design", icon: "/tm/sections/icon-interior.webp", w: 192, h: 204 },
  { label: "Sustainable Development", icon: "/tm/sections/icon-sustainable.webp", w: 192, h: 213 },
];

/** Small white badges that sit on the orbit line around the courtyard. */
const ORBIT_BADGES = [
  { icon: Building2, className: "tm-orbit-badge-a" },
  { icon: Armchair, className: "tm-orbit-badge-b" },
  { icon: Home, className: "tm-orbit-badge-c" },
];

/**
 * OUR SERVICES — End-to-End Architecture Solutions.
 *
 * The courtyard aerial sits in an ellipse with the gold orbit drawn around it;
 * the badges float gently on that orbit. Four service tiles to the right.
 */
export default function Services() {
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const enter = gsap.timeline({ scrollTrigger: { trigger: ".tm-orbit", start: "top 80%" } });
        enter
          .from(".tm-orbit-photo", { clipPath: "ellipse(0% 0% at 50% 50%)", duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" })
          .from(".tm-orbit-photo img", { scale: 1.25, duration: 1.8, ease: "expo.out" }, 0.1)
          .from(".tm-orbit-ring", { clipPath: "inset(0% 100% 0% 0%)", duration: 1.3, ease: "power2.inOut", clearProps: "clipPath" }, 0.5)
          .from(".tm-orbit-badge", { scale: 0, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2.4)" }, 1.1);

        // A slow float on each badge, out of phase with one another. Paused
        // whenever the section is off screen.
        const floats = gsap.utils.toArray<HTMLElement>(".tm-orbit-badge").map((badge, i) =>
          gsap.to(badge, { y: i % 2 ? 10 : -10, x: i % 2 ? -6 : 6, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, paused: true }),
        );
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => floats.forEach((t) => (self.isActive ? t.play() : t.pause())),
        });

        gsap.from(".tm-service", {
          y: 34,
          scale: 0.94,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-service-list", start: "top 88%" },
        });

        gsap.fromTo(".tm-services-plant", { yPercent: 12, rotate: -4 }, {
          yPercent: -10,
          rotate: 2,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" aria-labelledby="tm-services-title" className="tm-section tm-services">
      <Image
        src="/tm/sections/plant-right.webp"
        alt=""
        width={900}
        height={1499}
        sizes="(max-width: 768px) 28vw, 12vw"
        className="tm-plant tm-sway tm-services-plant"
      />

      <div className="tm-shell tm-services-grid">
        <div className="tm-orbit">
          <div className="tm-orbit-photo">
            <Image
              src="/tm/sections/courtyard.webp"
              alt="Aerial view of a courtyard home with a central tree, reflecting pool and stone path"
              fill
              sizes="(max-width: 768px) 88vw, 44vw"
            />
          </div>
          <Image
            src="/tm/sections/gold-orbit.webp"
            alt=""
            width={2000}
            height={1070}
            sizes="(max-width: 768px) 96vw, 50vw"
            className="tm-orbit-ring"
          />
          {ORBIT_BADGES.map(({ icon: Icon, className }) => (
            <span key={className} aria-hidden className={`tm-orbit-badge ${className}`}>
              <Icon />
            </span>
          ))}
        </div>

        <div className="tm-services-copy">
          <Eyebrow>Our Services</Eyebrow>
          <h2 id="tm-services-title" className="tm-h2" data-reveal-lines>
            End-to-End Architecture <em className="tm-accent">Solutions</em>
          </h2>
          <p className="tm-lede" data-fade data-delay="0.15">
            From concept to completion, we craft spaces that are beautiful, functional and sustainable.
          </p>

          <ul className="tm-service-list">
            {SERVICES.map((service) => (
              <li key={service.label} className="tm-service">
                <Image src={service.icon} alt="" width={service.w} height={service.h} className="tm-service-icon" />
                <span>{service.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
