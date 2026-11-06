import FeaturedDevelopments from "./FeaturedDevelopments";
import Footer from "./Footer";
import SkyBackdrop from "./SkyBackdrop";
import StoriesOfTrust from "./StoriesOfTrust";
import TMExperience from "./TMExperience";
import WhyChooseTM from "./WhyChooseTM";
import "./sections.css";

export default function LandingSections() {
  return (
    <div className="tm-root">
      {/* Nothing adds .is-shown without JavaScript, so both the panel and the
          contents the staggered entry starts at opacity:0 have to be forced back. */}
      <noscript>
        <style>{`.tm-reveal{opacity:1;transform:none}.tm-reveal .tm-intro>*,.tm-reveal .tm-experience-copy>*,.tm-reveal .tm-project,.tm-reveal .tm-feature,.tm-reveal .tm-experience-features>li{opacity:1;translate:none;animation:none}`}</style>
      </noscript>

      {/* Continuous sky and leaves behind every section, drifting on scroll */}
      <SkyBackdrop />

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
