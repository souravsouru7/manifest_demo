"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

type VideoLightboxProps = {
  src: string;
  poster: string;
  open: boolean;
  onClose: () => void;
};

/**
 * Plays the hero film uncropped. The hero itself covers the viewport, so on a
 * tall window it only ever shows a slice of the 16:9 frame; this is where the
 * whole shot is actually visible, which is what the "Watch Video" button is for.
 */
export default function VideoLightbox({ src, poster, open, onClose }: VideoLightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      // Only the close button is focusable in here, so the loop is just itself.
      event.preventDefault();
      closeRef.current?.focus();
    };

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Hero film"
      className="hv-lightbox"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="hv-lightbox-close focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
      >
        <X size={22} strokeWidth={1.75} aria-hidden />
      </button>
      {/* Autoplays because it is muted; the clip carries no audio track at all. */}
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        controls
        className="hv-lightbox-video"
      />
    </div>
  );
}
