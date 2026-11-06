import type { LucideIcon } from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  first: string;
  second: string;
  description: string;
};

export default function FeatureCard({ icon: Icon, first, second, description }: Feature) {
  return (
    <article className="tm-feature">
      <Icon aria-hidden strokeWidth={1.5} />
      <h3>
        {first} <br />
        {second}
      </h3>
      <p>{description}</p>
    </article>
  );
}
