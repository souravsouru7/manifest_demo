import { ArrowRight } from "lucide-react";

import ProjectCard, { type Project } from "./ProjectCard";
import Reveal from "./Reveal";

const PROJECTS: Project[] = [
  {
    category: "Residential",
    name: "Green Valley",
    location: "Kozhikode, Kerala",
    travel: "13.2 min.",
    image: "/tm/02-project-green-valley.png",
  },
  {
    category: "Luxury Villas",
    name: "Echo Palm",
    location: "Kochi, Kerala",
    travel: "9.9 min.",
    image: "/tm/03-project-echo-palm.png",
  },
  {
    category: "Eco Living",
    name: "Serene Woods",
    location: "Trivandrum, Kerala",
    travel: "10.2 min.",
    image: "/tm/04-project-serene-woods.png",
  },
];

export default function FeaturedDevelopments() {
  return (
    <Reveal>
      <section id="projects" aria-labelledby="tm-featured-title" className="tm-panel tm-featured">
        <div className="tm-intro">
          <p className="tm-label">Our Projects</p>
          <h2 id="tm-featured-title" className="tm-heading">
            Featured <br />
            <span className="tm-yellow">Developments</span>
          </h2>
          <p className="tm-body">Explore our thoughtfully designed communities across Kerala.</p>
          <a href="#projects" className="tm-outline-button">
            View All Projects <ArrowRight aria-hidden />
          </a>
        </div>
        <div className="tm-project-row">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.name} {...project} />
          ))}
        </div>
      </section>
    </Reveal>
  );
}
