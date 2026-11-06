import Image from "next/image";

import FeaturedDevelopments from "./FeaturedDevelopments";
import Footer from "./Footer";
import StoriesOfTrust from "./StoriesOfTrust";
import TMExperience from "./TMExperience";
import WhyChooseTM from "./WhyChooseTM";
import "./sections.css";

export default function LandingSections() {
  return (
    <div className="tm-root">
      <noscript>
        <style>{`.tm-reveal{opacity:1;transform:none}`}</style>
      </noscript>

      {/* Continuous sky behind every section */}
      <div aria-hidden className="tm-sky">
        <Image loading="eager" src="/tm/01-background-sky-mountains.png" alt="" width={1024} height={190} className="tm-sky-top" />
        <Image loading="eager" src="/tm/01-background-sky-mountains.png" alt="" width={1024} height={190} className="tm-sky-mid" />
        <Image loading="eager" src="/tm/01-background-sky-mountains.png" alt="" width={1024} height={190} className="tm-sky-low" />
      </div>
      <Image loading="eager" src="/tm/09-leaf-overlay-top-left.png" alt="" width={190} height={190} className="tm-leaf tm-leaf-top" />
      <Image loading="eager" src="/tm/11-leaf-overlay-lower-left.png" alt="" width={170} height={260} className="tm-leaf tm-leaf-lower" />

      <div className="tm-sections">
        <FeaturedDevelopments />
        <TMExperience />
        <WhyChooseTM />
        <StoriesOfTrust />
      </div>
      <Footer />
    </div>
  );
}
