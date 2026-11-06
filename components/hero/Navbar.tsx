"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

/** The TM logo, also used by the loader. */
export const LOGO_SRC = "/tm/logo.png";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Projects", href: "#projects" },
  { label: "Contact", href: "#contact" },
];

const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

type NavbarProps = {
  /** True once the user has scrolled past the hero: adds the blurred navy background. */
  solid: boolean;
};

export default function Navbar({ solid }: NavbarProps) {
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
        showBackground ? "bg-[#071b2c]/90" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="seq-gutter mx-auto flex h-20 max-w-[1600px] items-center justify-between max-[500px]:h-16"
      >
        <a href="#top" aria-label="TM Manifesto home" className={`rounded-sm ${FOCUS_RING}`}>
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
        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`seq-label rounded-sm text-white/85 transition-colors hover:text-white ${FOCUS_RING}`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#contact"
            className={`seq-label rounded-full bg-[#ffc400] px-5 py-2.5 font-semibold! text-[#101e2c] transition-colors hover:bg-[#f5b900] ${FOCUS_RING}`}
          >
            Get a Quote
          </a>
        </div>

        {/* Mobile toggle: 46px, comfortably above the 44px touch target minimum */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="seq-mobile-menu"
          onClick={() => setOpen((value) => !value)}
          className={`-mr-2.5 cursor-pointer rounded-sm p-2.5 md:hidden ${FOCUS_RING}`}
        >
          {open ? <X size={26} strokeWidth={1.5} aria-hidden /> : <Menu size={26} strokeWidth={1.5} aria-hidden />}
        </button>
      </nav>

      {open && (
        <div
          id="seq-mobile-menu"
          className="seq-gutter max-h-[calc(100svh-5rem)] overflow-y-auto border-t border-white/15 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] md:hidden"
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
            className={`seq-label mt-4 block rounded-full bg-[#ffc400] px-5 py-3.5 text-center font-semibold! text-[#101e2c] ${FOCUS_RING}`}
          >
            Get a Quote
          </a>
        </div>
      )}
    </header>
  );
}
