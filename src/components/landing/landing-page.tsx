import "./landing.css";
import "./landing-hero.css";
import "./landing-story.css";
import "./landing-conversion.css";
import { FeatureShowcase } from "./feature-showcase";
import { FinalCta } from "./final-cta";
import { FutureVision } from "./future-vision";
import { HowItWorks } from "./how-it-works";
import { LandingFaq } from "./landing-faq";
import { LandingFooter } from "./landing-footer";
import { LandingHero } from "./landing-hero";
import { LandingNav } from "./landing-nav";
import { PersonalIntelligenceSection } from "./personal-intelligence-section";
import { PrivacySection } from "./privacy-section";
import { ProductIntroduction } from "./product-introduction";
import { ProductPreview } from "./product-preview";

export function LandingPage() {
  return (
    <div className="landing-root">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>
      <LandingNav />
      <main id="main">
        <LandingHero />
        <ProductIntroduction />
        <PersonalIntelligenceSection />
        <HowItWorks />
        <FeatureShowcase />
        <ProductPreview />
        <PrivacySection />
        <FutureVision />
        <LandingFaq />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
