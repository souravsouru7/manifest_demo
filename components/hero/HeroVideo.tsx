"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Award, House, Layers, Leaf, Play, Trees, Users } from "lucide-react";

import HeroVideoNav from "@/components/hero/HeroVideoNav";
import Loader from "@/components/hero/Loader";
import VideoLightbox from "@/components/hero/VideoLightbox";
import { useAssetProgress } from "@/hooks/useAssetProgress";
import { useCountUp } from "@/hooks/useCountUp";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import "./hero-video.css";

const VIDEO_SRC = "/hero/nature-loop.mp4";
const POSTER_SRC = "/hero/nature-loop-poster.webp";
/** Native size of the render, so the poster is never asked for pixels it does not have. */
const VIDEO_SIZE = { width: 1280, height: 720 };
/** Roughly the navbar height: it turns solid once the hero has scrolled up behind it. */
const NAV_HEIGHT_PX = 80;
/** The loader always stays up this long, so it never just flashes. */
const LOADER_MIN_MS = 900;
/** On a very slow connection, stop waiting and show the hero with its poster. */
const LOADER_TIMEOUT_MS = 8000;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const FEATURES = [
  { icon: Leaf, label: "Sustainable\nDesign" },
  { icon: Layers, label: "Integrated\nLiving" },
  { icon: Trees, label: "Nature\nFirst" },
];

const STATS = [
  { icon: House, value: "15+", label: "Projects" },
  { icon: Users, value: "10K+", label: "Happy Clients" },
  { icon: Award, value: "100%", label: "Quality Assurance" },
];

/**
 * One figure in the glass bar, counting up once the opener has left. Its own
 * component because the count is a hook, and hooks cannot live inside a map
 * callback.
 */
function Stat({
  icon: Icon,
  value,
  label,
  run,
}: (typeof STATS)[number] & { run: boolean }) {
  const shown = useCountUp(value, run);

  return (
    <div className="hv-stat">
      <Icon size={24} strokeWidth={1.5} className="hv-stat-icon" aria-hidden />
      <div>
        {/* The real figure is what gets announced; the ticking numbers in
            between are decoration and would only be noise read aloud. */}
        <dt className="hv-stat-value" aria-label={value}>
          <span aria-hidden>{shown}</span>
        </dt>
        <dd className="hv-stat-label">{label}</dd>
      </div>
    </div>
  );
}

export default function HeroVideo() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();

  const [navSolid, setNavSolid] = useState(false);
  const [inView, setInView] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  /** True once the video holds enough data to paint its first frame. */
  const [videoReady, setVideoReady] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const { images, fontsReady } = useAssetProgress();

  // The video is the one asset worth holding the opener for; the poster and the
  // fonts are the rest of what the first screen is made of.
  const progress = (videoReady ? 0.7 : 0) + images * 0.2 + (fontsReady ? 0.1 : 0);
  const loaded = (videoReady || reducedMotion) && images >= 1 && fontsReady;
  /** The loader opens and scrolling unlocks. */
  const ready = (loaded && minTimeDone) || timedOut;

  useEffect(() => {
    // Both clocks run from when the page started loading, not from when this
    // effect runs: the loader has already been on screen since the HTML arrived,
    // so starting them here added the JS download time on top of the minimum.
    const elapsed = performance.now();
    const minTimer = setTimeout(() => setMinTimeDone(true), Math.max(0, LOADER_MIN_MS - elapsed));
    const timeoutTimer = setTimeout(() => setTimedOut(true), Math.max(0, LOADER_TIMEOUT_MS - elapsed));
    return () => {
      clearTimeout(minTimer);
      clearTimeout(timeoutTimer);
    };
  }, []);

  // A cached file can already be playable before React attaches onCanPlay.
  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 2) setVideoReady(true);
  }, []);

  // --- Navbar background, and whether the loop is still worth decoding ---
  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;
    const navObserver = new IntersectionObserver(([entry]) => setNavSolid(!entry.isIntersecting), {
      rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px`,
    });
    const playObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0,
    });
    navObserver.observe(element);
    playObserver.observe(element);
    return () => {
      navObserver.disconnect();
      playObserver.disconnect();
    };
  }, []);

  // Decoding a loop nobody can see costs battery for nothing.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (inView && !lightboxOpen) {
      // Autoplay can still be refused; the poster stays up if it is.
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, lightboxOpen]);

  // --- Hold scrolling while the loader is up ---
  useEffect(() => {
    if (ready) return;
    const { documentElement: root, body } = document;
    const previousRoot = root.style.overflow;
    const previousBody = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousRoot;
      body.style.overflow = previousBody;
    };
  }, [ready]);

  return (
    <>
      {/* Hoisted to <head> by React, so the first paint is the scene, not the navy behind it. */}
      <link rel="preload" as="image" href={POSTER_SRC} fetchPriority="high" />

      {/* Without JavaScript nothing would ever dismiss the loader */}
      <noscript>
        <style>{`.seq-loader{display:none}.seq-rise{animation-play-state:running}`}</style>
      </noscript>

      <Loader progress={progress} open={ready} />

      <HeroVideoNav solid={navSolid} />

      <section
        id="hero"
        ref={sectionRef}
        data-ready={ready}
        className="relative h-lvh overflow-hidden bg-[var(--seq-navy)] text-white"
      >
        {/* Media layer */}
        {reducedMotion ? (
          <Image
            src={POSTER_SRC}
            alt=""
            width={VIDEO_SIZE.width}
            height={VIDEO_SIZE.height}
            preload
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            aria-hidden
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster={POSTER_SRC}
            onCanPlay={() => setVideoReady(true)}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={VIDEO_SRC} type="video/mp4" />
          </video>
        )}

        {/* Keeps white text readable: darker towards the bottom and left. Kept light —
            the shot is built on bright sky and saturated green, and a heavy wash
            drains exactly what makes it worth playing. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_27_44/0.58),rgb(7_27_44/0.06)_46%,rgb(7_27_44/0.18)),linear-gradient(to_right,rgb(7_27_44/0.5),transparent_58%)] max-md:bg-[linear-gradient(to_top,rgb(7_27_44/0.76),rgb(7_27_44/0.4)_45%,rgb(7_27_44/0.1)_72%,rgb(7_27_44/0.26))]"
        />

        {/* The sections below open on sky blue. Without this the hero's dark
            vegetation would meet that colour on a hard line. */}
        <div aria-hidden className="hv-skirt absolute inset-x-0 bottom-0" />

        {/* Everything readable sits in the visible area, above any browser bar */}
        <div className="absolute inset-x-0 top-0 h-svh">
          {/* Hero copy */}
          <div className="seq-gutter hv-copy absolute inset-x-0 mx-auto max-w-[1600px]">
            <p
              className="seq-rise seq-eyebrow seq-eyebrow-lined text-white"
              style={{ "--seq-order": 0 } as CSSProperties}
            >
              Architecture &amp; Nature
            </p>
            <h1
              className="seq-rise seq-display seq-headline mt-4 md:mt-5"
              style={{ "--seq-order": 1 } as CSSProperties}
            >
              A New Way Of <br className="seq-headline-break" />
              <span className="seq-yellow">Living</span>
            </h1>
            <p
              className="seq-rise seq-lede mt-5 max-w-md text-white/90 md:mt-6"
              style={{ "--seq-order": 2 } as CSSProperties}
            >
              Thoughtfully designed spaces that bring nature closer to you.
            </p>
            <div
              className="seq-rise seq-actions mt-7 flex flex-wrap items-center gap-3 md:mt-9 md:gap-5"
              style={{ "--seq-order": 3 } as CSSProperties}
            >
              <a
                href="#projects"
                className={`seq-label flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#ffc400] px-5 font-semibold! whitespace-nowrap text-[#101e2c] transition-colors hover:bg-[#f5b900] md:px-8 ${FOCUS_RING}`}
              >
                Explore Projects
                <span aria-hidden>&rarr;</span>
              </a>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className={`hv-watch seq-label flex min-h-12 cursor-pointer items-center gap-3 rounded-full font-medium text-white transition-opacity hover:opacity-80 ${FOCUS_RING}`}
              >
                <span aria-hidden className="hv-play">
                  <Play size={14} strokeWidth={0} fill="currentColor" />
                </span>
                Watch Video
              </button>
            </div>
          </div>

          {/* Feature rail. Needs its own column, so it waits for a wide viewport. */}
          <div className="hv-rail absolute right-0 hidden lg:flex">
            {FEATURES.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className="hv-glass hv-feature seq-rise"
                style={{ "--seq-order": 4 + index } as CSSProperties}
              >
                <Icon size={22} strokeWidth={1.5} className="hv-feature-icon" aria-hidden />
                <p className="hv-feature-label">{label}</p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="seq-gutter hv-stats-row absolute inset-x-0 mx-auto max-w-[1600px]">
            <dl className="hv-glass hv-stats seq-rise" style={{ "--seq-order": 7 } as CSSProperties}>
              {STATS.map((stat) => (
                <Stat key={stat.label} {...stat} run={ready} />
              ))}
            </dl>
          </div>

          {/* Slide markers from the design. There is one film, so they are decoration
              rather than a control that would do nothing when clicked. */}
          <div aria-hidden className="hv-dots absolute">
            <span className="hv-dot hv-dot-on" />
            <span className="hv-dot" />
            <span className="hv-dot" />
          </div>
        </div>
      </section>

      <VideoLightbox
        src={VIDEO_SRC}
        poster={POSTER_SRC}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}
