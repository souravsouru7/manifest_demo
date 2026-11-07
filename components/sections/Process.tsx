"use client";

import Image from "next/image";
import { useRef } from "react";
import { Home, Layers, PenTool, Search } from "lucide-react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

import Eyebrow from "./Eyebrow";

/** Each rock is its own image element, positioned on its own. */
const STEPS = [
  { n: "01", title: "Discover", copy: "Understand your lifestyle", icon: Search, src: "/tm/sections/rock-01.webp", w: 1000, h: 798 },
  { n: "02", title: "Design", copy: "Create meaningful spaces", icon: PenTool, src: "/tm/sections/rock-02.webp", w: 1000, h: 862 },
  { n: "03", title: "Build", copy: "Execute with precision and quality", icon: Layers, src: "/tm/sections/rock-03.webp", w: 1000, h: 834 },
  { n: "04", title: "Deliver", copy: "A home that truly feels like yours", icon: Home, src: "/tm/sections/rock-04.webp", w: 1000, h: 840 },
];

/**
 * OUR PROCESS — four moss-covered rocks beside a mountain stream.
 *
 * Desktop: one scrubbed timeline. The gold journey line draws across and each
 * rock rises as the line reaches it, with the foreground plants moving faster
 * than the stream behind them. Mobile: a vertical timeline of glass cards, each
 * with a rock thumbnail, its icon sitting on a gold line that draws on scroll.
 */
export default function Process() {
  const root = useRef<HTMLElement>(null);
  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);

      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(".tm-proc-mist", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-proc-stream", { yPercent: 6 }, { yPercent: -4, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-proc-shrubs", { yPercent: 22 }, { yPercent: -12, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-proc-ferns", { yPercent: 30, xPercent: -6 }, { yPercent: -10, xPercent: 0, ease: "none", scrollTrigger: scrub });
      });

      media.add("(prefers-reduced-motion: no-preference) and (min-width: 900px)", () => {
        const steps = gsap.utils.toArray<HTMLElement>(".tm-step");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".tm-steps", start: "top 85%", end: "bottom 60%", scrub: 0.9 },
        });
        tl.fromTo(".tm-proc-path", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 }, 0);
        steps.forEach((step, i) => {
          const at = 0.05 + i * 0.22;
          tl.from(step, { y: 60, autoAlpha: 0, duration: 0.22, ease: "power2.out" }, at);
          tl.from(step.querySelector(".tm-step-icon"), { scale: 0, duration: 0.14, ease: "back.out(3)" }, at + 0.1);
          tl.from(step.querySelector(".tm-step-text"), { y: 14, autoAlpha: 0, duration: 0.14 }, at + 0.12);
        });
      });

      media.add("(prefers-reduced-motion: no-preference) and (max-width: 899px)", () => {
        gsap.fromTo(".tm-steps-line", { scaleY: 0 }, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: ".tm-steps", start: "top 75%", end: "bottom 70%", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".tm-step").forEach((step) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: step, start: "top 88%" } });
          tl.from(step, { x: 24, y: 30, autoAlpha: 0, duration: 0.9, ease: "power3.out" });
          tl.from(step.querySelector(".tm-step-icon"), { scale: 0, duration: 0.5, ease: "back.out(3)" }, 0.25);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="tm-process-title" className="tm-section tm-process">
      <div aria-hidden className="tm-proc-bg">
        <Image src="/tm/sections/mist-panorama.webp" alt="" fill sizes="100vw" className="tm-proc-mist" />
        <div className="tm-proc-shade" />
        <Image src="/tm/sections/stream.webp" alt="" width={2400} height={725} sizes="100vw" className="tm-proc-stream" />
        <Image src="/tm/sections/shrubs.webp" alt="" width={2000} height={621} sizes="60vw" className="tm-proc-shrubs" />
        <Image src="/tm/sections/ferns.webp" alt="" width={1400} height={898} sizes="40vw" className="tm-proc-ferns tm-sway" />
      </div>

      <div className="tm-shell tm-process-grid">
        <div className="tm-process-intro">
          <Eyebrow tone="light">Our Process</Eyebrow>
          <h2 id="tm-process-title" className="tm-h2" data-reveal-lines>
            From Vision to <em className="tm-accent">Living</em>
          </h2>
          <p className="tm-lede" data-fade data-delay="0.15">
            A transparent, collaborative journey from idea to a space you truly call home.
          </p>
        </div>

        <div className="tm-steps">
          <span aria-hidden className="tm-steps-line" />
          <Image
            src="/tm/sections/gold-journey.webp"
            alt=""
            width={2400}
            height={204}
            sizes="70vw"
            className="tm-proc-path"
          />
          <ol>
            {STEPS.map(({ n, title, copy, icon: Icon, src, w, h }) => (
              <li key={n} className="tm-step">
                <Image src={src} alt="" width={w} height={h} sizes="(max-width: 899px) 1px, 20vw" className="tm-step-rock" />
                <span aria-hidden className="tm-step-badge">
                  <small>Step</small>
                  {n}
                </span>
                <div className="tm-step-body">
                  <span aria-hidden className="tm-step-icon">
                    <Icon />
                  </span>
                  <div className="tm-step-text">
                    <h3>
                      <span className="tm-step-n">{n}</span> {title}
                    </h3>
                    <p>{copy}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
