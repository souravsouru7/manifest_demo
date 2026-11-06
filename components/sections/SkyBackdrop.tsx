"use client";

import Image from "next/image";
import { useRef } from "react";

import { useParallax } from "@/hooks/useParallax";

const SKY_SRC = "/tm/01-background-sky-mountains.png";

/**
 * The continuous sky and leaves behind every section.
 *
 * The three mountain strips and the two leaves drift at different rates as the
 * page scrolls, which is what turns a stack of flat images into depth. Rates are
 * small and negative: each layer rises slightly slower than the page, so the
 * backdrop appears to sit well behind the panels. The nearest layer — the leaf
 * in the lower left — moves most.
 */
export default function SkyBackdrop() {
  const top = useRef<HTMLImageElement>(null);
  const mid = useRef<HTMLImageElement>(null);
  const low = useRef<HTMLImageElement>(null);
  const leafTop = useRef<HTMLImageElement>(null);
  const leafLower = useRef<HTMLImageElement>(null);

  useParallax([
    { ref: top, rate: -0.12 },
    { ref: mid, rate: -0.07 },
    { ref: low, rate: -0.04 },
    { ref: leafTop, rate: -0.18 },
    { ref: leafLower, rate: -0.26 },
  ]);

  return (
    <>
      <div aria-hidden className="tm-sky">
        <Image ref={top} loading="eager" src={SKY_SRC} alt="" width={1024} height={190} className="tm-sky-top" />
        <Image ref={mid} loading="eager" src={SKY_SRC} alt="" width={1024} height={190} className="tm-sky-mid" />
        <Image ref={low} loading="eager" src={SKY_SRC} alt="" width={1024} height={190} className="tm-sky-low" />
      </div>
      <Image
        ref={leafTop}
        loading="eager"
        src="/tm/09-leaf-overlay-top-left.png"
        alt=""
        width={190}
        height={190}
        className="tm-leaf tm-leaf-top"
      />
      <Image
        ref={leafLower}
        loading="eager"
        src="/tm/11-leaf-overlay-lower-left.png"
        alt=""
        width={170}
        height={260}
        className="tm-leaf tm-leaf-lower"
      />
    </>
  );
}
