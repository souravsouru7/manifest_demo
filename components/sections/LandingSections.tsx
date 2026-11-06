import ClientsImpact from "./ClientsImpact";
import DreamCta from "./DreamCta";
import Experience from "./Experience";
import FeaturedProjects from "./FeaturedProjects";
import Footer from "./Footer";
import Philosophy from "./Philosophy";
import Process from "./Process";
import Services from "./Services";
import "./sections.css";

/**
 * Everything below the hero, in the order of the TM Manifesto reference:
 * light and dark bands alternate down the page and close on the navy footer.
 *
 * The hero itself lives in components/hero and is not touched from here. The
 * first section opens on the hero skirt's colour (--hero-next-bg) so the join
 * between the two is seamless.
 */
export default function LandingSections() {
  return (
    <div className="tm-root">
      <Philosophy />
      <Experience />
      <FeaturedProjects />
      <Services />
      <Process />
      <ClientsImpact />
      <DreamCta />
      <Footer />
    </div>
  );
}
