"use client";

import { useEffect, useState } from "react";
import { ArrowUp, Mail, Phone } from "lucide-react";

import "./floating-actions.css";

/**
 * PLACEHOLDERS — replace all three before this goes anywhere public.
 * Deliberately not plausible-looking, so a real-looking but wrong number can
 * never quietly ship.
 */
const CONTACT = {
  /** Digits only, no +, no spaces: wa.me wants it bare. */
  whatsapp: "910000000000", // replace
  phone: "+910000000000", // replace
  email: "hello@example.com", // replace
};

/** lucide dropped brand icons, so WhatsApp's glyph is inline. */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden width="20" height="20">
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.48-1.75-1.65-2.05-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.69.25-1.29.18-1.41-.07-.12-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.25-4.36c0-4.54 3.69-8.23 8.23-8.23 2.2 0 4.26.86 5.82 2.41a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Z" />
    </svg>
  );
}

const CHANNELS = [
  {
    label: "WhatsApp",
    href: `https://wa.me/${CONTACT.whatsapp}`,
    icon: <WhatsAppIcon />,
    external: true,
    /** Keeps WhatsApp on its own green; the other two stay on brand yellow. */
    tone: "fa-channel-whatsapp",
  },
  {
    label: "Call us",
    href: `tel:${CONTACT.phone}`,
    icon: <Phone size={20} strokeWidth={1.75} aria-hidden />,
    external: false,
    tone: "",
  },
  {
    label: "Email us",
    href: `mailto:${CONTACT.email}`,
    icon: <Mail size={20} strokeWidth={1.75} aria-hidden />,
    external: false,
    tone: "",
  },
];

/** Roughly a screen of scrolling before "back to top" is worth offering. */
const TOP_BUTTON_AT = 0.9;

export default function FloatingActions() {
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      setShowTop(window.scrollY > window.innerHeight * TOP_BUTTON_AT);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read(); // Reloading part-way down the page should already show the button.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="fa-root">
      {/* Back to top sits above the contact button and leaves the layout when
          hidden, so it never blocks taps over the hero. */}
      <button
        type="button"
        aria-label="Back to top"
        data-shown={showTop}
        className="fa-button fa-top"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        <ArrowUp size={20} strokeWidth={2} aria-hidden />
      </button>

      <ul className="fa-channels" aria-label="Contact options">
        {CHANNELS.map(({ label, href, icon, external, tone }) => (
          <li key={label}>
            <a
              href={href}
              /* The visible label is hidden on phones to save width, which would
                 otherwise leave the link with no accessible name at all. */
              aria-label={label}
              className={`fa-channel ${tone}`}
              {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
            >
              <span aria-hidden className="fa-channel-label">
                {label}
              </span>
              <span className="fa-channel-icon">{icon}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
