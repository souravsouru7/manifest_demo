"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowRight, Award, Home, Quote, Users } from "lucide-react";

import { gsap, SplitText, useGSAP } from "@/components/motion/gsap";
import { useSectionMotion } from "@/components/motion/useSectionMotion";

/*
 * PLACEHOLDER — the quote, the client names and all three impact figures are
 * copied word for word from the supplied reference design. They have not been
 * verified against real TM projects. Confirm or replace before launch; logged
 * in public/tm/CREDITS.md.
 */
const TESTIMONIALS = [
  {
    quote:
      "TM turned our idea of a dream home into a beautiful reality. The design, process and attention to detail were simply exceptional.",
    name: "Anitha & Rahul Menon",
    location: "Kochi, Kerala",
  },
];

const IMPACT = [
  { icon: Home, value: 15, suffix: "+", label: "Projects Delivered" },
  { icon: Users, value: 10, suffix: "K+", label: "Happy Clients" },
  { icon: Award, value: 100, suffix: "%", label: "Quality Assurance" },
];

/**
 * WHAT OUR CLIENTS SAY + THE TM IMPACT.
 *
 * A light testimonial card paired with a navy impact panel. The two slide in
 * from opposite sides, the quote rises word by word, and the figures count up.
 */
export default function ClientsImpact() {
  const root = useRef<HTMLElement>(null);
  const quote = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = TESTIMONIALS.length;
  const current = TESTIMONIALS[index];

  useSectionMotion(root);

  useGSAP(
    () => {
      const media = gsap.matchMedia(root);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".tm-testimonial", {
          x: -60,
          autoAlpha: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-ci-grid", start: "top 85%" },
        });
        gsap.from(".tm-impact", {
          x: 60,
          autoAlpha: 0,
          duration: 1.1,
          delay: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".tm-ci-grid", start: "top 85%" },
        });
        gsap.from(".tm-impact-icon", {
          scale: 0,
          duration: 0.7,
          stagger: 0.12,
          delay: 0.4,
          ease: "back.out(2.6)",
          scrollTrigger: { trigger: ".tm-impact", start: "top 85%" },
        });
      });

      // The figures count up whether or not motion is reduced: with reduced
      // motion they are simply set to their final value.
      gsap.utils.toArray<HTMLElement>(".tm-impact-value").forEach((el) => {
        const target = Number(el.dataset.value);
        const suffix = el.dataset.suffix ?? "";
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduced) return;
        const counter = { v: 0 };
        el.textContent = `0${suffix}`;
        gsap.to(counter, {
          v: target,
          duration: 1.8,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            el.textContent = `${Math.round(counter.v)}${suffix}`;
          },
        });
      });
    },
    { scope: root },
  );

  // The quote rises word by word on entry, and again on every change.
  useGSAP(
    () => {
      const text = quote.current?.querySelector<HTMLElement>(".tm-quote-text");
      if (!text) return;
      const media = gsap.matchMedia(quote);
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(text, { type: "words", mask: "words" });
        gsap.from(split.words, {
          yPercent: 110,
          duration: 0.7,
          stagger: 0.018,
          ease: "expo.out",
          scrollTrigger: { trigger: text, start: "top 90%" },
        });
        return () => split.revert();
      });
    },
    { scope: quote, dependencies: [index], revertOnUpdate: true },
  );

  return (
    <section ref={root} aria-labelledby="tm-ci-title" className="tm-section tm-ci">
      <h2 id="tm-ci-title" className="sr-only">
        Client stories and the TM impact
      </h2>
      <div className="tm-shell tm-ci-grid">
        <article className="tm-testimonial" aria-roledescription="testimonial">
          <p className="tm-mini-eyebrow">
            What our clients say <span aria-hidden className="tm-eyebrow-rule" />
          </p>
          <div className="tm-testimonial-body">
            <div className="tm-testimonial-person">
              <Image
                src="/tm/07-testimonial-couple.png"
                alt=""
                width={70}
                height={67}
                className="tm-testimonial-avatar"
              />
              <p className="tm-testimonial-name">{current.name}</p>
              <p className="tm-testimonial-loc">{current.location}</p>
            </div>
            <div ref={quote} className="tm-testimonial-quote" aria-live="polite">
              <Quote aria-hidden className="tm-quote-mark" />
              <blockquote>
                <p className="tm-quote-text" key={index}>
                  &ldquo;{current.quote}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
          <div className="tm-testimonial-foot">
            <span aria-hidden className="tm-pager">
              <span className="tm-pager-on" />
              <span />
              <span />
              <span />
            </span>
            <button
              type="button"
              className="tm-round tm-round-light tm-round-sm"
              aria-label="Next testimonial"
              disabled={count < 2}
              onClick={() => setIndex((i) => (i + 1) % count)}
            >
              <ArrowRight aria-hidden />
            </button>
          </div>
        </article>

        <aside className="tm-impact" aria-labelledby="tm-impact-title">
          <p id="tm-impact-title" className="tm-mini-eyebrow tm-mini-eyebrow-light">
            The TM Impact <span aria-hidden className="tm-eyebrow-rule" />
          </p>
          <ul className="tm-impact-list">
            {IMPACT.map(({ icon: Icon, value, suffix, label }) => (
              <li key={label}>
                <Icon aria-hidden className="tm-impact-icon" />
                <span className="tm-impact-value" data-value={value} data-suffix={suffix}>
                  {value}
                  {suffix}
                </span>
                <span className="tm-impact-label">{label}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
