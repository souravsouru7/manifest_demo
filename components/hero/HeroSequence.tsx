"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

import Loader from "@/components/hero/Loader";
import Navbar from "@/components/hero/Navbar";
import { useAssetProgress } from "@/hooks/useAssetProgress";
import {
  DESKTOP_MEDIA,
  LIGHT_MEDIA,
  resolveFramePath,
  shouldLoadLightSet,
  useImageSequence,
} from "@/hooks/useImageSequence";
import { drawImageCover } from "@/lib/drawImageCover";

/**
 * Share of the remaining distance the video covers per 60Hz tick. On a mouse or
 * trackpad Lenis already smooths the scroll, so this stays high: stacking two slow
 * easings makes a scrub lag behind the hand. Touch scrolling is native and has no
 * Lenis smoothing, so the video does a little more of it there.
 */
const LERP_POINTER = 0.3;
const LERP_TOUCH = 0.16;
const MAX_DPR = 2;
/** Source frame sizes, used to stop the canvas drawing more pixels than a frame holds. */
const FRAME_SIZE = { width: 1920, height: 1080 };
const LIGHT_FRAME_SIZE = { width: 1440, height: 810 };
/** Keeps the building in view when a portrait screen crops the sides of the frame. */
const FOCUS_X = 0.42;
const RESIZE_DEBOUNCE_MS = 150;
/** Roughly the navbar height: it turns solid once the hero has scrolled up behind it. */
const NAV_HEIGHT_PX = 80;
/** Frames drawn per animation frame while warming the GPU behind the loader. */
const WARM_FRAMES_PER_TICK = 6;
/** On a very slow connection, stop waiting and reveal the hero with what has loaded. */
const LOADER_TIMEOUT_MS = 25000;
/** At or above this speed frames change every tick, so crossfading adds nothing. */
const FAST_FRAMES_PER_TICK = 1;
/** Share of the timeline each text beat spends fading in and out. */
const BEAT_FADE = 0.018;
/** The loader always stays up this long, so it never just flashes. */
const LOADER_MIN_MS = 1200;
/**
 * The construction and its text finish at this point of the hero's scroll. The
 * rest of the runway is the sky rising over the finished home into the sections.
 */
const FRAME_END = 0.88;

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

/** Scroll beats, timed to what is on screen. from/to = (frame - 1) / 131, before FRAME_END scaling. */
const BEATS: {
  from: number;
  to: number;
  stage: string;
  title: string;
  text?: string;
  closing?: boolean;
}[] = [
  {
    // Frames 12-28: the plot is marked out and excavated
    from: 0.09,
    to: 0.21,
    stage: "The site",
    title: "Our approach begins with listening.",
    text: "To the site, to its history, to the everyday lives that will unfold within it.",
  },
  {
    // Frames 32-56: slab, pool shell, columns rising
    from: 0.24,
    to: 0.42,
    stage: "The ground",
    title: "Rooted in climate, culture, and craft.",
    text: "We work within the tropical context not as a constraint, but as a powerful design language shaped by light, rain, vegetation, and human rituals.",
  },
  {
    // Frames 60-82: the structural frame stands against the sky
    from: 0.45,
    to: 0.62,
    stage: "The structure",
    title: "Not an object placed on land.",
    text: "A process of negotiation between nature and habitation.",
  },
  {
    // Frames 85-104: stone walls and timber arrive
    from: 0.64,
    to: 0.79,
    stage: "The craft",
    title: "Drawn from regional building traditions.",
    text: "Contextual architecture, engaging with contemporary needs and technologies.",
  },
  {
    // Frames 106-120: the pool fills, the building settles into its landscape
    from: 0.8,
    to: 0.91,
    stage: "The landscape",
    title: "Seamless Harmony with Nature",
    text: "Spaces that naturally blend into their surroundings, embracing the lush, vibrant essence of tropical landscapes.",
  },
  {
    // Frames 122-132: the finished home
    from: 0.92,
    to: 0.985,
    stage: "The finished home",
    title: "Sustainable Tropical Architecture for Timeless Experience",
    closing: true,
  },
];

// --- prefers-reduced-motion as an external store, so it is SSR-safe and live ---
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const getReducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches;
const getReducedMotionOnServer = () => false;

type HeroSequenceProps = {
  frameCount?: number;
  /** Height of the scroll runway, as any CSS length. */
  scrollLength?: string;
  /** Path template for desktop and tablet; `{index}` becomes the 4-digit frame number. */
  framePath?: string;
  /** Path template for touch devices, narrow windows and save-data. */
  lightFramePath?: string;
};

export default function HeroSequence({
  frameCount = 132,
  scrollLength = "680vh",
  framePath = "/frames-1080/f_{index}.webp",
  lightFramePath = "/frames-810/f_{index}.webp",
}: HeroSequenceProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasARef = useRef<HTMLCanvasElement>(null);
  const canvasBRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const beatsRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const skyWipeRef = useRef<HTMLDivElement>(null);

  // Written by ScrollTrigger, read by the render loop. Never React state, so
  // scrolling causes no re-renders.
  const targetFrameRef = useRef(1);
  const warmedRef = useRef(false);

  const [navSolid, setNavSolid] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [minTimeDone, setMinTimeDone] = useState(false);
  /** True once the canvas shows a real frame. */
  const [painted, setPainted] = useState(false);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionOnServer,
  );

  const firstFrame = resolveFramePath(framePath, 1);
  const firstLightFrame = resolveFramePath(lightFramePath, 1);

  const { framesRef, progress: framesProgress, isComplete } = useImageSequence({
    frameCount,
    framePath,
    lightFramePath,
    enabled: !reducedMotion,
  });
  const { images, fontsReady } = useAssetProgress();

  const loadDone = (isComplete && images >= 1 && fontsReady) || timedOut;
  const progress = framesProgress * 0.8 + images * 0.15 + (fontsReady ? 0.05 : 0);
  /** The loader opens and scrolling unlocks. */
  const ready = painted && (reducedMotion || minTimeDone);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeDone(true), LOADER_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  // --- Navbar background: independent of GSAP so it also works with reduced motion ---
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavSolid(!entry.isIntersecting),
      { rootMargin: `-${NAV_HEIGHT_PX}px 0px 0px 0px` },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // --- Hold scrolling while the loader is up, so nobody can scrub half-loaded frames ---
  useEffect(() => {
    if (reducedMotion || ready) return;
    const { documentElement: root, body } = document;
    const previousRoot = root.style.overflow;
    const previousBody = body.style.overflow;
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";
    const timer = setTimeout(() => setTimedOut(true), LOADER_TIMEOUT_MS);
    return () => {
      root.style.overflow = previousRoot;
      body.style.overflow = previousBody;
      clearTimeout(timer);
    };
  }, [reducedMotion, ready]);

  // --- Canvas sizing and the render loop ---
  //
  // Two stacked canvases hold the frames either side of the playhead, and the top
  // one's CSS opacity is the crossfade. 132 frames over a long scroll is only a few
  // frames per second on a slow scroll, which reads as stepping; blending gives the
  // video a continuous position. Blending by drawing both frames on every tick
  // caused GPU stalls, so each canvas is painted only when the playhead reaches a
  // new frame and everything in between is a compositor-only opacity change.
  useEffect(() => {
    const canvases = [canvasARef.current, canvasBRef.current];
    const [canvasA, canvasB] = canvases;
    const ctxA = canvasA?.getContext("2d", { alpha: false });
    const ctxB = canvasB?.getContext("2d", { alpha: false });
    if (!canvasA || !canvasB || !ctxA || !ctxB) return;
    const contexts = [ctxA, ctxB];

    const lerpFactor = window.matchMedia("(pointer: coarse)").matches ? LERP_TOUCH : LERP_POINTER;
    const source = shouldLoadLightSet() ? LIGHT_FRAME_SIZE : FRAME_SIZE;

    let currentFrame = targetFrameRef.current;
    /** The frame number each canvas holds; -1 means empty or cleared by a resize. */
    const held = [-1, -1];
    let topIndex = 1;
    let shownOpacity = -1;
    let firstPaintDone = false;
    let resizeTimer: ReturnType<typeof setTimeout> | undefined;

    const applySize = () => {
      const clientWidth = canvasA.clientWidth;
      const clientHeight = canvasA.clientHeight;
      if (!clientWidth || !clientHeight) return;
      // Never more canvas pixels than the frame supplies at cover size: extra
      // pixels add no detail and only make each paint slower.
      const coverScale = Math.max(clientWidth / source.width, clientHeight / source.height);
      const density = Math.min(window.devicePixelRatio || 1, MAX_DPR, 1 / coverScale);
      const width = Math.round(clientWidth * density);
      const height = Math.round(clientHeight * density);
      if (canvasA.width === width && canvasA.height === height) return;
      // Assigning width/height clears a canvas and resets its context state.
      canvases.forEach((canvas, index) => {
        if (!canvas) return;
        canvas.width = width;
        canvas.height = height;
        contexts[index].imageSmoothingEnabled = true;
        contexts[index].imageSmoothingQuality = "high";
        held[index] = -1; // Repainted on the next tick, before the browser paints.
      });
    };

    applySize();

    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applySize, RESIZE_DEBOUNCE_MS);
    });
    resizeObserver.observe(canvasA);

    const paint = (index: number, frameNumber: number) => {
      const frame = framesRef.current[frameNumber];
      const canvas = canvases[index];
      if (!frame || !canvas) return;
      drawImageCover(contexts[index], frame, canvas.width, canvas.height, FOCUS_X);
      held[index] = frameNumber;
    };

    const tick = () => {
      if (!reducedMotion && !warmedRef.current) return; // The warm-up owns the canvas until it ends.

      const target = reducedMotion ? 1 : targetFrameRef.current;
      const previous = currentFrame;
      // deltaRatio makes the easing take the same time at 60Hz and 120Hz.
      const step = 1 - Math.pow(1 - lerpFactor, gsap.ticker.deltaRatio());
      currentFrame += (target - currentFrame) * step;
      if (Math.abs(target - currentFrame) < 0.002) currentFrame = target;
      const speed = Math.abs(currentFrame - previous);

      // The two loaded frames either side of the playhead.
      const frames = framesRef.current;
      let low = Math.floor(currentFrame);
      let high = Math.ceil(currentFrame);
      while (low > 1 && !frames[low]) low -= 1;
      while (high < frameCount && !frames[high]) high += 1;
      if (!frames[low]) low = high;
      if (!frames[high]) high = low;
      if (!frames[low]) return;

      // Moving a frame or more per tick there is nothing to blend, so skip the extra paint.
      const blend = high > low && speed < FAST_FRAMES_PER_TICK ? (currentFrame - low) / (high - low) : 0;

      // Keep whichever canvas already holds a needed frame, to avoid repainting it.
      let bottom: number;
      if (held[0] === low) bottom = 0;
      else if (held[1] === low) bottom = 1;
      else bottom = held[0] === high ? 1 : 0;
      const top = 1 - bottom;

      if (held[bottom] !== low) paint(bottom, low);
      if (blend > 0 && held[top] !== high) paint(top, high);

      if (top !== topIndex) {
        topIndex = top;
        canvases[top]?.style.setProperty("z-index", "1");
        canvases[bottom]?.style.setProperty("z-index", "0");
        canvases[bottom]?.style.setProperty("opacity", "1");
        shownOpacity = -1;
      }
      if (Math.abs(blend - shownOpacity) > 0.002) {
        canvases[top]?.style.setProperty("opacity", blend.toFixed(3));
        shownOpacity = blend;
      }

      if (!firstPaintDone) {
        firstPaintDone = true;
        setPainted(true);
      }
    };

    // Lenis is added ahead of this in the ticker, so each paint uses this frame's scroll position.
    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
    };
  }, [frameCount, framesRef, reducedMotion]);

  // --- GPU warm-up: a frame's first draw uploads it to the GPU, which stalls the
  // first sweep. Doing every upload here, on both canvases, keeps that behind the loader. ---
  useEffect(() => {
    if (!loadDone || reducedMotion || warmedRef.current) return;
    const canvasA = canvasARef.current;
    const canvasB = canvasBRef.current;
    const ctxA = canvasA?.getContext("2d", { alpha: false });
    const ctxB = canvasB?.getContext("2d", { alpha: false });
    if (!canvasA || !canvasB || !ctxA || !ctxB) return;

    const loaded = framesRef.current.filter((frame) => frame !== undefined);
    let cursor = 0;
    let rafId = 0;

    const step = () => {
      const end = Math.min(cursor + WARM_FRAMES_PER_TICK, loaded.length);
      for (; cursor < end; cursor += 1) {
        drawImageCover(ctxA, loaded[cursor], canvasA.width, canvasA.height, FOCUS_X);
        drawImageCover(ctxB, loaded[cursor], canvasB.width, canvasB.height, FOCUS_X);
      }
      if (cursor < loaded.length) rafId = requestAnimationFrame(step);
      else warmedRef.current = true;
    };
    rafId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(rafId);
  }, [framesRef, loadDone, reducedMotion]);

  // --- Lenis + ScrollTrigger + the scrubbed overlay timeline, once the loader has left ---
  useEffect(() => {
    if (reducedMotion) {
      targetFrameRef.current = 1;
      return;
    }
    if (!ready) return;

    gsap.registerPlugin(ScrollTrigger);
    // A collapsing mobile address bar must not recalculate the scroll positions.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Lenis smooths wheel and trackpad only. Touch stays native on purpose: its
    // touch syncing is unreliable on iOS, and native momentum already feels right.
    const lenis = new Lenis({ anchors: true, lerp: 0.085, wheelMultiplier: 0.9 });
    lenis.on("scroll", ScrollTrigger.update);
    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick, false, true); // Prepended: scroll updates before the canvas paints.
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      // Duration 1 with no easing, so timeline positions read as scroll progress.
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            targetFrameRef.current = 1 + Math.min(self.progress / FRAME_END, 1) * (frameCount - 1);
          },
        },
      });

      // Hero content leaves first. autoAlpha also sets visibility: hidden, which
      // takes the hidden links out of the tab order.
      timeline.to(contentRef.current, { autoAlpha: 0, y: -80, duration: 0.07 * FRAME_END }, 0);
      timeline.to(indicatorRef.current, { autoAlpha: 0, duration: 0.03 * FRAME_END }, 0);

      const beats = beatsRef.current?.querySelectorAll<HTMLElement>("[data-beat]") ?? [];
      beats.forEach((element, index) => {
        const from = BEATS[index].from * FRAME_END;
        const to = BEATS[index].to * FRAME_END;
        const fade = BEAT_FADE * FRAME_END;
        timeline.fromTo(element, { autoAlpha: 0, y: 32 }, { autoAlpha: 1, y: 0, duration: fade }, from);
        timeline.to(element, { autoAlpha: 0, y: -32, duration: fade }, to - fade);
      });

      // The sky rises over the finished home, ending on the colour the sections
      // begin with. The photo drifts up behind it, as if the camera is rising.
      const wipeLength = 1 - FRAME_END;
      timeline.to(skyWipeRef.current, { yPercent: -100, duration: wipeLength }, FRAME_END);
      timeline.to(mediaRef.current, { yPercent: -6, duration: wipeLength }, FRAME_END);
      // Fully covered by now, so nothing needs to composite it.
      timeline.set(mediaRef.current, { autoAlpha: 0 }, 0.999);

      // Reloading part-way down the page: start on the matching frame.
      const trigger = timeline.scrollTrigger;
      if (trigger) targetFrameRef.current = 1 + Math.min(trigger.progress / FRAME_END, 1) * (frameCount - 1);
    });

    return () => {
      context.revert(); // kills the timeline and its ScrollTrigger, restores inline styles
      gsap.ticker.remove(onTick);
      gsap.ticker.lagSmoothing(500, 33); // GSAP's default
      lenis.destroy();
    };
  }, [frameCount, ready, reducedMotion]);

  return (
    <>
      {/* Hoisted to <head> by React. Each device only requests its own frame 1. */}
      <link rel="preload" as="image" href={firstFrame} media={DESKTOP_MEDIA} fetchPriority="high" />
      <link rel="preload" as="image" href={firstLightFrame} media={LIGHT_MEDIA} fetchPriority="high" />

      {/* Without JavaScript nothing would ever dismiss the loader */}
      <noscript>
        <style>{`.seq-loader{display:none}.seq-rise{animation-play-state:running}`}</style>
      </noscript>

      <Loader progress={progress} open={ready} />

      <Navbar solid={navSolid} />

      <div
        id="top"
        ref={wrapperRef}
        data-ready={ready}
        className="relative h-[var(--seq-scroll-length)] motion-reduce:h-lvh"
        style={{ "--seq-scroll-length": scrollLength } as CSSProperties}
      >
        {/* 100lvh, not 100svh: with svh a dark strip shows below the hero once the
            mobile address bar collapses. Text lives in a 100svh box further down so
            it never sits under the browser's bar. */}
        <div className="sticky top-0 h-lvh overflow-hidden bg-[var(--hero-next-bg)] text-white">
          {/* Media layer. Scaling 1.04x from the top-left pushes the watermark in the
              bottom-right corner out of view; a centred 1.04x would leave part of it.
              The fallback image shares this layer so nothing shifts when the canvas
              takes over. The canvases stay transparent until the warm-up has finished,
              so the frames being uploaded are never seen. */}
          <div
            ref={mediaRef}
            className="seq-first-frame absolute inset-0 origin-top-left scale-[1.04]"
            style={
              {
                "--seq-first": `url("${firstFrame}")`,
                "--seq-first-light": `url("${firstLightFrame}")`,
              } as CSSProperties
            }
          >
            <div
              role="img"
              aria-label="Timelapse of an empty plot at sunset gradually becoming a finished modern building."
              className="absolute inset-0"
              style={{ opacity: ready ? 1 : 0.001 }}
            >
              <canvas
                ref={canvasARef}
                data-seq-canvas
                className="absolute inset-0 block h-full w-full will-change-[opacity]"
              />
              <canvas
                ref={canvasBRef}
                data-seq-canvas
                className="absolute inset-0 z-[1] block h-full w-full opacity-0 will-change-[opacity]"
              />
            </div>
          </div>

          {/* Keeps white text readable: darker towards the bottom and left */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_27_44/0.8),rgb(7_27_44/0.16)_50%,rgb(7_27_44/0.34)),linear-gradient(to_right,rgb(7_27_44/0.62),transparent_62%)] max-md:bg-[linear-gradient(to_top,rgb(7_27_44/0.86),rgb(7_27_44/0.54)_45%,rgb(7_27_44/0.14)_72%,rgb(7_27_44/0.36))]"
          />

          {/* Everything readable sits in the visible area, above any browser bar */}
          <div className="absolute inset-x-0 top-0 h-svh">
            {/* Hero content */}
            <div ref={contentRef} className="seq-gutter seq-hero-copy absolute inset-x-0 bottom-0 mx-auto max-w-[1600px]">
              <p
                className="seq-rise seq-eyebrow seq-eyebrow-lined text-white"
                style={{ "--seq-order": 0 } as CSSProperties}
              >
                Architecture &amp; Construction
              </p>
              <h1
                className="seq-rise seq-display seq-headline mt-4 md:mt-5"
                style={{ "--seq-order": 1 } as CSSProperties}
              >
                We Build <br className="seq-headline-break" />
                <span className="seq-yellow whitespace-nowrap">Your Vision</span>
              </h1>
              <p
                className="seq-rise seq-lede mt-5 max-w-xl text-white/90 md:mt-6"
                style={{ "--seq-order": 2 } as CSSProperties}
              >
                From empty land to iconic structures — crafted with precision.
              </p>
              <div
                className="seq-rise seq-actions mt-7 flex flex-wrap gap-3 md:mt-9 md:gap-4"
                style={{ "--seq-order": 3 } as CSSProperties}
              >
                <a
                  href="#contact"
                  className={`seq-label flex min-h-12 items-center justify-center rounded-full bg-[#ffc400] px-5 font-semibold! whitespace-nowrap text-[#101e2c] transition-colors hover:bg-[#f5b900] md:px-8 ${FOCUS_RING}`}
                >
                  Start Your Project
                </a>
                <a
                  href="#projects"
                  className={`seq-label flex min-h-12 items-center justify-center rounded-full border border-white/80 px-5 font-semibold! whitespace-nowrap text-white transition-colors hover:bg-white/15 md:px-8 ${FOCUS_RING}`}
                >
                  View Our Work
                </a>
              </div>
            </div>

            {/* Scroll beats (not shown with reduced motion, since nothing plays) */}
            {!reducedMotion && (
              <div ref={beatsRef}>
                {BEATS.map((beat) => (
                  <div
                    key={beat.stage}
                    data-beat
                    className="seq-caption seq-gutter seq-beat-copy absolute inset-x-0 bottom-0 mx-auto max-w-[1600px]"
                  >
                    <p className="seq-eyebrow seq-eyebrow-lined text-white">{beat.stage}</p>
                    <h2
                      className={`seq-display mt-3 md:mt-4 ${
                        beat.closing ? "seq-beat-title-lg max-w-[20ch]" : "seq-beat-title max-w-[22ch]"
                      }`}
                    >
                      {beat.title}
                    </h2>
                    {beat.text && <p className="seq-lede mt-3 max-w-xl text-white/90 md:mt-4">{beat.text}</p>}
                    {beat.closing && (
                      <a
                        href="#contact"
                        className={`seq-label mt-6 inline-flex min-h-12 items-center rounded-full bg-[#ffc400] px-6 font-semibold! text-[#101e2c] transition-colors hover:bg-[#f5b900] md:mt-7 md:px-8 ${FOCUS_RING}`}
                      >
                        Start Your Project
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Scroll indicator */}
            {!reducedMotion && (
              <div ref={indicatorRef} className="seq-indicator absolute inset-x-0 flex flex-col items-center">
                <div
                  className="seq-rise flex flex-col items-center gap-2.5"
                  style={{ "--seq-order": 5 } as CSSProperties}
                >
                  <span className="seq-eyebrow text-white/80 max-md:!text-[0.625rem]">Scroll to explore</span>
                  <span aria-hidden className="seq-scroll-line" />
                </div>
              </div>
            )}
          </div>

          {/* The sky rising into the next section */}
          {!reducedMotion && <div ref={skyWipeRef} aria-hidden className="seq-sky-wipe" />}

          {/* Reduced motion has no scroll scrub, so a static blend does that job */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[24%] bg-[linear-gradient(to_bottom,transparent,var(--hero-next-bg))] motion-reduce:block"
          />
        </div>
      </div>
    </>
  );
}
