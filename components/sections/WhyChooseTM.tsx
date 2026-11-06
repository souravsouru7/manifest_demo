import { ArrowRight, Gem, Handshake, Leaf, MapPin } from "lucide-react";

import FeatureCard, { type Feature } from "./FeatureCard";
import Reveal from "./Reveal";

const FEATURES: Feature[] = [
  {
    icon: Leaf,
    first: "Sustainable",
    second: "Living",
    description: "Eco-conscious spaces\nfor a greener tomorrow.",
  },
  {
    icon: Gem,
    first: "Premium",
    second: "Quality",
    description: "Built with uncompromising\nstandards.",
  },
  {
    icon: MapPin,
    first: "Prime",
    second: "Locations",
    description: "The best of Kerala,\ncloser to you.",
  },
  {
    icon: Handshake,
    first: "Trusted",
    second: "by Families",
    description: "A legacy of happiness\nand trust.",
  },
];

export default function WhyChooseTM() {
  return (
    <Reveal>
      <section id="services" aria-labelledby="tm-why-title" className="tm-panel tm-why">
        <div className="tm-intro">
          <p className="tm-label">Why Choose TM?</p>
          <h2 id="tm-why-title" className="tm-heading tm-heading-sm">
            A Better Way <br />
            of Living
          </h2>
          <p className="tm-body">Thoughtful design, premium locations and a commitment to excellence.</p>
          <a href="#about" className="tm-outline-button tm-why-button">
            Our Philosophy <ArrowRight aria-hidden />
          </a>
        </div>
        <div className="tm-feature-row">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.first} {...feature} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
