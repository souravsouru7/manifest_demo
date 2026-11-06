"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades its children up once they enter the viewport. Reduced motion is handled in the CSS. */
export default function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`tm-reveal ${shown ? "is-shown" : ""} ${className}`}>
      {children}
    </div>
  );
}
