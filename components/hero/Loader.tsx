"use client";

import Image from "next/image";

import { LOGO_SRC } from "@/components/hero/Navbar";

type LoaderProps = {
  /** 0..1 */
  progress: number;
  /** True when everything is ready: the opener plays and the page is revealed. */
  open: boolean;
};

/**
 * Opening screen. The logo fills with yellow as the page loads, then the two
 * navy panels slide apart to reveal the hero. Everything moves with transforms
 * and opacity only. Hidden for reduced motion, and without JavaScript by the
 * noscript style in HeroSequence.
 */
export default function Loader({ progress, open }: LoaderProps) {
  const percent = Math.round(progress * 100);

  return (
    <div
      role="status"
      aria-label={open ? undefined : `Loading ${percent}%`}
      data-open={open}
      className="seq-loader fixed inset-0 z-[60] touch-none text-white motion-reduce:hidden"
    >
      <div aria-hidden className="seq-loader-panel seq-loader-panel-top" />
      <div aria-hidden className="seq-loader-panel seq-loader-panel-bottom" />

      <div aria-hidden className="seq-loader-content">
        <div className="seq-loader-logo">
          <Image src={LOGO_SRC} alt="" width={449} height={448} preload className="seq-loader-logo-dim" />
          <Image
            src={LOGO_SRC}
            alt=""
            width={449}
            height={448}
            preload
            className="seq-loader-logo-fill"
            style={{ clipPath: `inset(${100 - percent}% 0 0 0)` }}
          />
        </div>
        <span className="seq-label mt-6 text-white/70 tabular-nums">{percent}%</span>
      </div>
    </div>
  );
}
