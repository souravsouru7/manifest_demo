"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { Hammer, Home, MapPin, PencilRuler, Play } from "lucide-react";

import VideoLightbox from "@/components/hero/VideoLightbox";
import { gsap, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

import Eyebrow from "./Eyebrow";

// The brand film the hero already plays; reused here, the hero is not touched.
const FILM_SRC = "/hero/nature-loop.mp4";
const FILM_POSTER = "/hero/nature-loop-poster.webp";

const STAGES = [
  { icon: MapPin, title: "Land", copy: "Reading the site, its views and its climate." },
  { icon: PencilRuler, title: "Design", copy: "Plans shaped around light, air and the way you live." },
  { icon: Hammer, title: "Build", copy: "Crafted on site with precision and care." },
  { icon: Home, title: "Live", copy: "A home that settles into nature and feels like yours." },
];

/**
 * THE TM EXPERIENCE — a dark landscape content band (not a hero).
 *
 * Mist and hill layers drift at different rates; the gold path draws across on
 * a scrub and each stage lights up as the path reaches it.
 */
export default function Experience() {
  const root = useRef<HTMLElement>(null);
  const [filmOpen, setFilmOpen] = useState(false);
  const closeFilm = useCallback(() => setFilmOpen(false), []);
  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo(".tm-exp-hills", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(".tm-exp-mist", { yPercent: 10 }, { yPercent: -14, ease: "none", scrollTrigger: scrub });

        const stages = gsap.utils.toArray<HTMLElement>(".tm-stage");
        const tl = gsap.timeline({
          scrollTrigger: { trigger: ".tm-stages", start: "top 80%", end: "bottom 45%", scrub: 0.8 },
        });
        tl.fromTo(".tm-exp-path", { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", duration: 1 }, 0);
        stages.forEach((stage, i) => {
          tl.from(stage, { y: 30, autoAlpha: 0, duration: 0.2, ease: "power2.out" }, i * 0.24);
          tl.from(stage.querySelector(".tm-stage-dot"), { scale: 0, duration: 0.18, ease: "back.out(3)" }, i * 0.24 + 0.04);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="experience" aria-labelledby="tm-exp-title" className="tm-section tm-exp">
      <div aria-hidden className="tm-exp-bg">
        <Image src="/tm/sections/green-hills.webp" alt="" fill sizes="100vw" className="tm-exp-hills" />
        <div className="tm-exp-shade" />
        <Image src="/tm/sections/mist-panorama.webp" alt="" width={2400} height={864} sizes="100vw" className="tm-exp-mist" />
      </div>

      <div className="tm-shell tm-exp-inner">
        <div className="tm-exp-head">
          <Eyebrow tone="light">The TM Experience</Eyebrow>
          <h2 id="tm-exp-title" className="tm-h2" data-reveal-lines>
            One journey, from land to <em className="tm-accent">living</em>
          </h2>
        </div>

        <div className="tm-stages">
          <Image
            src="/tm/sections/gold-journey.webp"
            alt=""
            width={2400}
            height={204}
            sizes="90vw"
            className="tm-exp-path"
          />
          <ol>
            {STAGES.map(({ icon: Icon, title, copy }) => (
              <li key={title} className="tm-stage">
                <span aria-hidden className="tm-stage-dot">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="tm-story" data-fade data-delay="0.1">
          <div className="tm-story-thumb">
            <Image src="/tm/sections/kerala-hills.webp" alt="Rolling green hills of Kerala under a soft sky" fill sizes="(max-width: 768px) 92vw, 220px" />
          </div>
          <div className="tm-story-copy">
            <h3>Architecture in Harmony</h3>
            <p>See how we shape homes around the hills, light and water of Kerala.</p>
            <button type="button" className="tm-story-play" onClick={() => setFilmOpen(true)}>
              <span aria-hidden className="tm-play-ring">
                <Play fill="currentColor" strokeWidth={0} />
              </span>
              Watch Our Story
            </button>
          </div>
        </div>
      </div>

      <VideoLightbox src={FILM_SRC} poster={FILM_POSTER} open={filmOpen} onClose={closeFilm} />
    </section>
  );
}
