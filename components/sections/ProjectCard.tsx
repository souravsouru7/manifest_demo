import Image from "next/image";
import { ArrowRight, ArrowUpRight, House, MapPin } from "lucide-react";

export type Project = {
  category: string;
  name: string;
  location: string;
  travel: string;
  image: string;
};

export default function ProjectCard({ category, name, location, travel, image }: Project) {
  return (
    <article className="tm-project">
      <div className="tm-project-photo">
        <Image loading="eager" src={image} alt={`${name}, ${location}`} fill sizes="(max-width: 1023px) 260px, 300px" />
        <span className="tm-project-pill">{category}</span>
      </div>
      <div className="tm-project-info">
        <h3 className="tm-project-name">{name}</h3>
        <p className="tm-project-location">
          <MapPin aria-hidden strokeWidth={2.25} />
          {location}
        </p>
        <p className="tm-project-travel">
          <House aria-hidden />
          {travel}
          <ArrowRight aria-hidden />
        </p>
        <a href="#projects" className="tm-round-button tm-project-open" aria-label={`Open ${name}`}>
          <ArrowUpRight aria-hidden strokeWidth={2.5} />
        </a>
      </div>
    </article>
  );
}
