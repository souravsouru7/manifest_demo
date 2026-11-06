"use client";

import Image from "next/image";
import { useRef } from "react";

import { gsap, useGSAP } from "@/components/motion/gsap";

const QUICK_LINKS = [
  { label: "Projects", href: "#projects" },
  { label: "Studio", href: "#services" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

const SERVICE_LINKS = [
  "Residential Homes",
  "Community Spaces",
  "Interior Design",
  "Sustainable Development",
];

// Lucide no longer ships brand icons, so these three are drawn here.
const SOCIALS = [
  {
    label: "Instagram",
    path: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    label: "YouTube",
    path: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    path: (
      <>
        <path d="M6 10v8M6 6.3v.2" strokeWidth="2.4" />
        <path d="M10.5 18v-8M10.5 13.5c0-2 1.4-3.5 3.3-3.5s3.2 1.4 3.2 3.6V18" strokeWidth="2.2" />
      </>
    ),
  },
];

/**
 * FOOTER — deep navy under a layered mountain silhouette and wave edge.
 * Uses the brand's own logo file; nothing is redrawn.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom bottom", scrub: true };
        gsap.fromTo(".tm-footer-mist-back", { yPercent: 30 }, { yPercent: 0, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-footer-mist-front", { yPercent: 45 }, { yPercent: 0, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-footer-wave", { xPercent: -3 }, { xPercent: 0, ease: "none", scrollTrigger: scrub });

        gsap.from(".tm-footer-col", {
          y: 34,
          autoAlpha: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-footer-grid", start: "top 92%" },
        });
        gsap.from(".tm-footer-bottom", {
          autoAlpha: 0,
          duration: 1,
          delay: 0.4,
          scrollTrigger: { trigger: ".tm-footer-grid", start: "top 92%" },
        });
      });
    },
    { scope: root },
  );

  return (
    <footer id="contact" ref={root} className="tm-footer">
      <div aria-hidden className="tm-footer-scene">
        <Image src="/tm/sections/mist-panorama.webp" alt="" width={2400} height={864} sizes="100vw" className="tm-footer-mist-back" />
        <Image src="/tm/sections/mist-panorama.webp" alt="" width={2400} height={864} sizes="100vw" className="tm-footer-mist-front" />
        <svg className="tm-footer-wave" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0 90V52C120 30 240 18 380 30C520 42 620 70 760 66C900 62 1000 30 1140 24C1260 19 1360 36 1440 48V90Z" />
        </svg>
      </div>

      <div className="tm-shell tm-footer-inner">
        <div className="tm-footer-grid">
          <div className="tm-footer-col tm-footer-brand">
            <a href="#hero" aria-label="Tropical Manifesto, back to top">
              <Image src="/tm/logo.png" alt="Tropical Manifesto" width={449} height={448} className="tm-footer-logo" />
            </a>
            <p>Live the Manifesto</p>
          </div>

          <nav aria-label="Quick links" className="tm-footer-col">
            <h2>Quick Links</h2>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Our services" className="tm-footer-col">
            <h2>Our Services</h2>
            <ul>
              {SERVICE_LINKS.map((label) => (
                <li key={label}>
                  <a href="#services">{label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="tm-footer-col tm-footer-social">
            <h2>Follow Us</h2>
            <ul>
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a href="#" aria-label={social.label}>
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {social.path}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="tm-footer-bottom">
          <p>&copy; 2025 Tropical Manifesto. All rights reserved.</p>
          <p>
            <a href="#">Privacy Policy</a>
            <span aria-hidden>|</span>
            <a href="#">Terms &amp; Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
