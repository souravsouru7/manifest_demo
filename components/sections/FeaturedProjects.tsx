"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, MapPin } from "lucide-react";

import { gsap, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

import Eyebrow from "./Eyebrow";

/*
 * PLACEHOLDER — names and locations copied from the supplied reference design.
 * The house images are generated renders from the asset package, not
 * photographs of completed TM work. Logged in public/tm/CREDITS.md.
 */
const PROJECTS = [
  { name: "Green Valley", location: "Kozhikode, Kerala", src: "/tm/sections/house-green-valley.webp", w: 1600, h: 796, size: "lg" },
  { name: "Echo Palm", location: "Kochi, Kerala", src: "/tm/sections/house-echo-palm.webp", w: 1200, h: 990, size: "sm" },
  { name: "Serene Woods", location: "Trivandrum, Kerala", src: "/tm/sections/house-serene-woods.webp", w: 1200, h: 713, size: "sm" },
] as const;

/**
 * FEATURED PROJECTS — asymmetric horizontal gallery.
 *
 * One dominant card and two smaller ones, deliberately overflowing the row so
 * the last one is cut by the edge and invites a swipe. The row is a native
 * scroll-snap container, so touch swipe, trackpads and keyboards all work
 * without a carousel library; the arrows and dots just drive scrollLeft.
 */
export default function FeaturedProjects() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useSectionMotion(root);

  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const progress = max > 0 ? el.scrollLeft / max : 0;
    setActive(Math.round(progress * (PROJECTS.length - 1)));
    setAtStart(el.scrollLeft < 4);
    setAtEnd(max - el.scrollLeft < 4);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const goTo = (index: number) => {
    const el = track.current;
    const card = el?.children[index] as HTMLElement | undefined;
    if (!el || !card) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const padding = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const left = el.scrollLeft + card.getBoundingClientRect().left - el.getBoundingClientRect().left - padding;
    el.scrollTo({ left, behavior: reduced ? "auto" : "smooth" });
  };

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        // Cards arrive one after another from the right, unmasking as they land.
        gsap.from(".tm-project", {
          xPercent: 18,
          rotate: 2,
          clipPath: "inset(0% 0% 0% 100% round 1.75rem)",
          duration: 1.3,
          stagger: 0.16,
          ease: "expo.out",
          clearProps: "clipPath,transform",
          scrollTrigger: { trigger: track.current, start: "top 82%" },
        });

        // The houses drift inside their frames for depth.
        gsap.utils.toArray<HTMLElement>(".tm-project-house").forEach((house) => {
          gsap.fromTo(
            house,
            { yPercent: 6 },
            {
              yPercent: -4,
              ease: "none",
              scrollTrigger: { trigger: house, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="projects" aria-labelledby="tm-projects-title" className="tm-section tm-projects">
      <div className="tm-shell tm-projects-grid">
        <div className="tm-projects-intro">
          <Eyebrow>Featured Projects</Eyebrow>
          <h2 id="tm-projects-title" className="tm-h2" data-reveal-lines>
            Curated <em className="tm-accent">Spaces</em>
          </h2>
          <p className="tm-lede" data-fade data-delay="0.15">
            A showcase of our signature residential and community projects across Kerala.
          </p>
          <div className="tm-projects-nav" data-fade data-delay="0.25">
            <button
              type="button"
              className="tm-round tm-round-light"
              aria-label="Previous project"
              disabled={atStart}
              onClick={() => goTo(Math.max(0, active - 1))}
            >
              <ArrowLeft aria-hidden />
            </button>
            <button
              type="button"
              className="tm-round tm-round-yellow"
              aria-label="Next project"
              disabled={atEnd}
              onClick={() => goTo(Math.min(PROJECTS.length - 1, active + 1))}
            >
              <ArrowRight aria-hidden />
            </button>
            <span aria-hidden className="tm-projects-blip" />
          </div>
        </div>

        <div className="tm-projects-rail">
          <ul ref={track} className="tm-projects-track" aria-label="Featured projects" tabIndex={0}>
            {PROJECTS.map((project, i) => (
              <li key={project.name} className={`tm-project tm-project-${project.size}`}>
                <a href="#contact" className="tm-project-link" aria-label={`${project.name}, ${project.location}. Enquire about this project`}>
                  <span aria-hidden className="tm-project-sky" />
                  <Image
                    src="/tm/sections/mist-panorama.webp"
                    alt=""
                    width={2400}
                    height={864}
                    sizes="(max-width: 768px) 80vw, 40vw"
                    className="tm-project-mist"
                  />
                  <Image
                    src={project.src}
                    alt={`${project.name} residence at dusk, lit from within and surrounded by tropical planting`}
                    width={project.w}
                    height={project.h}
                    sizes={project.size === "lg" ? "(max-width: 768px) 82vw, 44vw" : "(max-width: 768px) 70vw, 26vw"}
                    className="tm-project-house"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                  <span aria-hidden className="tm-project-shade" />
                  <span className="tm-project-meta">
                    <span className="tm-project-name">{project.name}</span>
                    <span className="tm-project-loc">
                      <MapPin aria-hidden />
                      {project.location}
                    </span>
                  </span>
                  {project.size === "lg" && (
                    <span aria-hidden className="tm-project-go">
                      <ArrowUpRight />
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="tm-dots" role="tablist" aria-label="Choose project">
            {PROJECTS.map((project, i) => (
              <button
                key={project.name}
                type="button"
                role="tab"
                aria-selected={i === active}
                aria-label={project.name}
                className={i === active ? "tm-dot tm-dot-on" : "tm-dot"}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
