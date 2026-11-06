"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

/** The TM logo, also used by the loader. */
export const LOGO_SRC = "/tm/logo.png";

const LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Studio", href: "#services" },
  { label: "Work", href: "#projects" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

/** Marks the pill in the design. The hero is the only section this nav tracks. */
const ACTIVE_HREF = "#hero";

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

type HeroVideoNavProps = {
  /** True once the hero has scrolled up behind the bar: adds the navy background. */
  solid: boolean;
};

export default function HeroVideoNav({ solid }: HeroVideoNavProps) {
  const [open, setOpen] = useState(false);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const showBackground = solid || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 pt-[env(safe-area-inset-top)] text-white transition-colors duration-500 ${
        showBackground ? "bg-[#071b2c]/90 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="seq-gutter mx-auto flex h-20 max-w-[1600px] items-center justify-between max-[500px]:h-16"
      >
        <a href="#hero" aria-label="TM Manifesto home" className={`rounded-sm ${FOCUS_RING}`}>
          <Image
            src={LOGO_SRC}
            alt=""
            width={449}
            height={448}
            preload
            className="h-11 w-11 max-[500px]:h-[38px] max-[500px]:w-[38px]"
          />
        </a>

        {/* Desktop */}
        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              aria-current={link.href === ACTIVE_HREF ? "page" : undefined}
              className={`hv-nav-link seq-label ${FOCUS_RING}`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className={`seq-label hidden items-center gap-2 rounded-full bg-[#ffc400] px-5 py-3 font-semibold! text-[#101e2c] transition-colors hover:bg-[#f5b900] sm:inline-flex ${FOCUS_RING}`}
          >
            Start a Project
            <ArrowUpRight size={16} strokeWidth={2.5} aria-hidden />
          </a>

          {/* Mobile toggle: 46px, comfortably above the 44px touch target minimum */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="hv-mobile-menu"
            onClick={() => setOpen((value) => !value)}
            className={`-mr-2.5 cursor-pointer rounded-sm p-2.5 lg:hidden ${FOCUS_RING}`}
          >
            {open ? <X size={26} strokeWidth={1.5} aria-hidden /> : <Menu size={26} strokeWidth={1.5} aria-hidden />}
          </button>
        </div>
      </nav>

      {open && (
        <div
          id="hv-mobile-menu"
          className="seq-gutter max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-white/15 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] lg:hidden"
        >
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`block rounded-sm py-3 text-xl font-medium ${FOCUS_RING}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setOpen(false)}
            className={`seq-label mt-4 block rounded-full bg-[#ffc400] px-5 py-3.5 text-center font-semibold! text-[#101e2c] sm:hidden ${FOCUS_RING}`}
          >
            Start a Project
          </a>
        </div>
      )}
    </header>
  );
}
