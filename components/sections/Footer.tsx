"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  { label: "Projects", href: "#projects" },
  { label: "About Us", href: "#about" },
  { label: "Blog", href: "#" },
  { label: "Contact", href: "#contact" },
];

// Lucide no longer ships brand icons, so these three are drawn here.
const SOCIALS = [
  {
    label: "Instagram",
    path: (
      <>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17" cy="7" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    label: "YouTube",
    path: (
      <>
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" />
      </>
    ),
  },
  {
    label: "LinkedIn",
    path: (
      <>
        <path d="M6 10v8M6 6.3v.2" strokeWidth="2.4" />
        <path d="M10.5 18v-8M10.5 13.5c0-2 1.4-3.5 3.3-3.5s3.2 1.4 3.2 3.6V18" strokeWidth="2.2" />
      </>
    ),
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "done">("idle");

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    // No mailing-list service is connected yet: nothing is sent anywhere.
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus("invalid");
      return;
    }
    setStatus("done");
    setEmail("");
  };

  return (
    <footer id="contact" className="tm-footer">
      <svg aria-hidden className="tm-footer-wave" viewBox="0 0 1024 51" preserveAspectRatio="none">
        <path d="M0 51C4 28 18 16 52 12C130 4 190 14 270 16C360 18 420 6 500 2C590 -2 660 12 760 12C830 12 890 2 960 8C1000 12 1018 26 1024 51Z" />
      </svg>
      <Image
        loading="eager"
        src="/tm/08-footer-mountain-atmosphere.png"
        alt=""
        width={1024}
        height={146}
        className="tm-footer-mountains"
      />
      <Image loading="eager" src="/tm/12-leaf-overlay-footer-left.png" alt="" width={260} height={216} className="tm-leaf tm-leaf-footer-left" />
      <Image loading="eager" src="/tm/13-leaf-overlay-footer-right.png" alt="" width={174} height={166} className="tm-leaf tm-leaf-footer-right" />

      <div className="tm-footer-inner">
        <div className="tm-footer-grid">
          <div className="tm-footer-brand">
            <p className="tm-footer-logo">
              tm<span>.</span>
            </p>
            <p className="tm-footer-tagline">Live the Manifesto</p>
          </div>

          <div className="tm-footer-news">
            <h2>Stay Connected</h2>
            <p>Get the latest updates on our new projects and offers.</p>
            <form onSubmit={onSubmit} noValidate className="tm-footer-form">
              <label htmlFor="tm-email" className="sr-only">
                Email address
              </label>
              <input
                id="tm-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                aria-invalid={status === "invalid"}
                aria-describedby="tm-email-status"
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status !== "idle") setStatus("idle");
                }}
              />
              <button type="submit">
                Subscribe <ArrowRight aria-hidden />
              </button>
            </form>
            <p id="tm-email-status" role="status" className="tm-footer-status">
              {status === "invalid" && "Please enter a valid email address."}
              {status === "done" && "Thank you. We'll keep you posted."}
            </p>
          </div>

          <nav aria-label="Quick links" className="tm-footer-links">
            <h2>Quick Links</h2>
            <ul>
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="tm-footer-social">
            <h2>Follow Us</h2>
            <ul>
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a href="#" aria-label={social.label}>
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {social.path}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="tm-footer-bottom">
          <p>© 2025 TM Manifesto. All rights reserved.</p>
          <p>
            <a href="#">Privacy Policy</a>
            <span aria-hidden>|</span>
            <a href="#">Terms &amp; Conditions</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
