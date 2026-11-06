import Image from "next/image";
import { ArrowRight, Gem, Leaf, Users, type LucideIcon } from "lucide-react";

import Reveal from "./Reveal";

const FEATURES: { icon: LucideIcon; first: string; second: string }[] = [
  { icon: Leaf, first: "Sustainable", second: "Living" },
  { icon: Gem, first: "Premium", second: "Quality" },
  { icon: Users, first: "Trusted", second: "by Families" },
];

export default function TMExperience() {
  return (
    <Reveal>
      <section id="about" aria-labelledby="tm-experience-title" className="tm-experience">
        <div className="tm-experience-dark">
          <div className="tm-experience-photo">
            <Image
              loading="eager"
              src="/tm/05-experience-interior.png"
              alt="Open living room with floor-to-ceiling glass and warm evening light"
              fill
              sizes="(max-width: 1023px) 100vw, 780px"
            />
          </div>
          <div className="tm-experience-copy">
            <p className="tm-label tm-label-light">The TM Experience</p>
            <h2 id="tm-experience-title" className="tm-heading tm-heading-light">
              Nature. Design. <br />
              <span className="tm-yellow">Harmony.</span>
            </h2>
            <p className="tm-body tm-body-light">
              Discover spaces where modern living meets the serenity of nature.
            </p>
            <a href="#services" className="tm-yellow-button">
              Learn More <ArrowRight aria-hidden />
            </a>
          </div>
        </div>
        <ul className="tm-experience-features">
          {FEATURES.map(({ icon: Icon, first, second }) => (
            <li key={first}>
              <Icon aria-hidden strokeWidth={1.75} />
              <span>
                {first} <br />
                {second}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
