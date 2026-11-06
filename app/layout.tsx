import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

// One typeface for the whole page, hero and sections alike.
const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "We Build Your Vision | Architecture & Construction",
  description: "From empty land to iconic structures — crafted with precision.",
};

export const viewport: Viewport = {
  // Lets the hero run edge to edge on notched phones; the layout pads with safe-area insets.
  viewportFit: "cover",
  themeColor: "#071b2c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
