"use client";

import { useRef, type ReactNode } from "react";

import { gsap, useGSAP } from "./gsap";

type Props = {
  children: ReactNode;
  /** Share of the distance to the pointer the element travels. */
  strength?: number;
  className?: string;
};

/**
 * Pulls its child toward the pointer and springs it home on leave.
 *
 * Fine-pointer devices only — on a touchscreen there is no hover to respond to,
 * and the transform would just be dead weight.
 */
export default function Magnetic({ children, strength = 0.32, className }: Props) {
  const wrapper = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const element = wrapper.current;
      if (!element) return;
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      const moveX = gsap.quickTo(element, "x", { duration: 0.5, ease: "power3.out" });
      const moveY = gsap.quickTo(element, "y", { duration: 0.5, ease: "power3.out" });

      const follow = (event: PointerEvent) => {
        const box = element.getBoundingClientRect();
        moveX((event.clientX - (box.left + box.width / 2)) * strength);
        moveY((event.clientY - (box.top + box.height / 2)) * strength);
      };

      const release = () => {
        moveX(0);
        moveY(0);
      };

      element.addEventListener("pointermove", follow);
      element.addEventListener("pointerleave", release);

      return () => {
        element.removeEventListener("pointermove", follow);
        element.removeEventListener("pointerleave", release);
      };
    },
    { scope: wrapper, dependencies: [strength] },
  );

  return (
    <span ref={wrapper} className={className ? `tm-magnetic ${className}` : "tm-magnetic"}>
      {children}
    </span>
  );
}
