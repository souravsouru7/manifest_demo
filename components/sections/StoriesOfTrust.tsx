"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import Reveal from "./Reveal";
import TestimonialCard, { type Testimonial } from "./TestimonialCard";

/** Add more entries here and the arrows start moving between them. */
const TESTIMONIALS: Testimonial[] = [
  {
    quote: "TM helped us find our dream home. The team was professional, and the entire process was smooth.",
    name: "Anitha & Rahul Menon",
    location: "Kochi, Kerala",
    portrait: "/tm/07-testimonial-couple.png",
  },
];

export default function StoriesOfTrust() {
  const [index, setIndex] = useState(0);
  const count = TESTIMONIALS.length;
  const step = (by: number) => setIndex((current) => (current + by + count) % count);

  return (
    <Reveal>
      <section aria-labelledby="tm-stories-title" className="tm-panel tm-stories">
        <div className="tm-intro">
          <p className="tm-label">What Our Clients Say</p>
          <h2 id="tm-stories-title" className="tm-heading tm-heading-sm">
            Stories of <br />
            Trust
          </h2>
          <p className="tm-body">Real experiences. Real happiness.</p>
          <a href="#contact" className="tm-outline-button">
            Read More Stories <ArrowRight aria-hidden />
          </a>
        </div>

        <div className="tm-stories-photo">
          <Image
            loading="eager"
            src="/tm/06-testimonial-villa.png"
            alt="Modern white villa with warm lights and tropical planting"
            fill
            sizes="(max-width: 1023px) 100vw, 600px"
          />
          <div className="tm-stories-arrows">
            <button
              type="button"
              className="tm-round-button"
              aria-label="Previous story"
              disabled={count < 2}
              onClick={() => step(-1)}
            >
              <ArrowLeft aria-hidden />
            </button>
            <button
              type="button"
              className="tm-round-button"
              aria-label="Next story"
              disabled={count < 2}
              onClick={() => step(1)}
            >
              <ArrowRight aria-hidden />
            </button>
          </div>
        </div>

        <div aria-live="polite" className="tm-quote-slot">
          <TestimonialCard key={index} {...TESTIMONIALS[index]} />
        </div>
      </section>
    </Reveal>
  );
}
