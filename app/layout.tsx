import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import type { ReactNode } from "react";

import SmoothScroll from "@/components/motion/SmoothScroll";
import FloatingActions from "@/components/ui/FloatingActions";
import "./globals.css";

// The site's typeface, shared by the hero and the sections below it (the
// reference design sets everything in one geometric sans). Everything reads
// --font-body.
const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tropical Manifesto | A New Way Of Living",
  description: "Thoughtfully designed spaces that bring nature closer to you.",
};

export const viewport: Viewport = {
  // Lets the hero run edge to edge on notched phones; the layout pads with safe-area insets.
  viewportFit: "cover",
  themeColor: "#071b2c",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body>
        <SmoothScroll />
        {children}
        <FloatingActions />
      </body>
    </html>
  );
}
