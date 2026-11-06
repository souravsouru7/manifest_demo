"use client";

/**
 * Single place where GSAP and its plugins are registered.
 *
 * Every consumer imports gsap from here rather than from "gsap" directly, which
 * guarantees the plugins are registered before any timeline is built, whatever
 * order the bundler happens to evaluate the section modules in.
 */
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Observer, ScrollToPlugin);

export { gsap, Observer, ScrollTrigger, SplitText, useGSAP };
