"use client";

import { useEffect, useRef, useState } from "react";

/** How many frames are fetched and decoded in parallel. */
const CONCURRENCY = 8;

/**
 * Which screens get the lighter frame set: narrow windows and every touch device,
 * whatever its size. The full set takes about 1.1 GB of memory once decoded, and a
 * tablet-sized page crashed under test while using it. Also used for the preload
 * links and the fallback image, so these devices never fetch the desktop frame 1.
 */
export const LIGHT_MEDIA = "(max-width: 767px), (pointer: coarse)";
/** The exact opposite of LIGHT_MEDIA, for the desktop preload link. */
export const DESKTOP_MEDIA =
  "(min-width: 768px) and (pointer: fine), (min-width: 768px) and (pointer: none)";

/** Token in a frame path template that is replaced by the padded frame number. */
const INDEX_TOKEN = "{index}";

/**
 * Builds a frame URL from a template, e.g. "/frames-1080/f_{index}.webp" -> "/frames-1080/f_0001.webp".
 * The template is a string, not a function, because this value can be passed from a
 * Server Component and props crossing that boundary must be serializable.
 */
export function resolveFramePath(template: string, index: number): string {
  return template.replace(INDEX_TOKEN, String(index).padStart(4, "0"));
}

type NetworkInformationLike = { saveData?: boolean };

/** Touch devices, narrow windows and save-data get the lighter set, every 2nd frame. Browser only. */
export function shouldLoadLightSet(): boolean {
  const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
  return window.matchMedia(LIGHT_MEDIA).matches || connection?.saveData === true;
}

export type Frame = HTMLImageElement | ImageBitmap;

async function loadViaImage(src: string): Promise<Frame | null> {
  const img = new Image();
  img.src = src;
  try {
    await img.decode();
    return img;
  } catch {
    return null; // A bad frame must not stall the rest.
  }
}

/**
 * Prefers fetch + createImageBitmap: it decodes off the main thread and the
 * result stays decoded, so the browser never has to re-decode during a scrub.
 */
async function loadFrame(src: string): Promise<Frame | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    return await createImageBitmap(await response.blob());
  } catch {
    return loadViaImage(src);
  }
}

type Options = {
  frameCount: number;
  framePath: string;
  lightFramePath: string;
  /** When false only frame 1 is loaded (used for prefers-reduced-motion). */
  enabled: boolean;
};

export function useImageSequence({ frameCount, framePath, lightFramePath, enabled }: Options) {
  // Sparse, 1-indexed cache. A ref rather than state: scrubbing must never re-render React.
  const framesRef = useRef<(Frame | undefined)[]>([]);
  /** 0..1 share of the frames planned for this device that have finished loading. */
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const frames = framesRef.current;

    const light = shouldLoadLightSet();
    const template = light ? lightFramePath : framePath;

    // Next's cacheComponents hides routes with <Activity> instead of unmounting,
    // so this effect can re-run. Frames already in the ref are kept and only the
    // missing ones are requested.
    const plan: number[] = [];
    for (let i = 1; i <= frameCount; i += light ? 2 : 1) plan.push(i);

    let done = 0;
    const fetchFrame = async (index: number) => {
      if (!frames[index]) {
        const frame = await loadFrame(resolveFramePath(template, index));
        if (frame) frames[index] = frame;
      }
      done += 1;
      if (!cancelled) setProgress(done / plan.length);
    };

    const run = async () => {
      await fetchFrame(1); // Frame 1 first: it is what everything else waits behind.
      if (cancelled || !enabled) return;

      // A shared cursor rather than fixed batches, so one slow frame doesn't hold up seven others.
      let cursor = 1;
      const worker = async () => {
        while (!cancelled && cursor < plan.length) {
          cursor += 1;
          await fetchFrame(plan[cursor - 1]);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [frameCount, framePath, lightFramePath, enabled]);

  return { framesRef, progress, isComplete: progress >= 1 };
}
