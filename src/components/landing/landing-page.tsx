import React from "react";
import "./landing.css";
import "./landing-hero.css";
import "./landing-story.css";
import "./landing-conversion.css";
import "./landing-hero-redesign.css";
import "./landing-middle-redesign.css";
import "./landing-closing-redesign.css";
import "./landing-redesign.css";
import "./landing-atmosphere.css";
import "./hero-landscape.css";
import "./problem-comparison.css";
import "./personal-intelligence-story.css";
import "./context-pipeline.css";
import "./privacy-and-vision.css";

import { LandingNav } from "./landing-nav";
import { LandingHero } from "./landing-hero";
import { ProblemComparisonSection } from "./problem-comparison-section";
import { ProductIntroduction } from "./product-introduction";
import { PersonalIntelligenceStory } from "./personal-intelligence-story";
import { PreferenceSandbox } from "./preference-sandbox";
import { ContextPipelineSection } from "./context-pipeline-section";
import { PersonalIntelligenceSection } from "./personal-intelligence-section";
import { FeatureShowcase } from "./feature-showcase";
import { ProductPreview } from "./product-preview";
import { PrivacyFortress } from "./privacy-fortress";
import { FutureVisionStory } from "./future-vision-story";
import { LandingFaq } from "./landing-faq";
import { ImmersiveFinalCta } from "./immersive-final-cta";
import { LandingFooter } from "./landing-footer";

export function LandingPage() {
  return (
    <div className="landing-root">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>
      <LandingNav />
      <main id="main">
        {/* Section 01: Immersive Hero Landscape (Source of Truth) */}
        <LandingHero />

        {/* Section 02: The Problem: Every Conversation Starts from Zero */}
        <ProblemComparisonSection />

        {/* Product Anchor */}
        <ProductIntroduction />

        {/* Section 03: Personal Intelligence: The Central Product Story */}
        <PersonalIntelligenceStory />

        {/* Section 04: Your Preferences Shape the Experience (Sandbox) */}
        <PreferenceSandbox />

        {/* Section 05: Context Retrieval Pipeline */}
        <ContextPipelineSection />

        {/* Interactive Feature & Preview Demos */}
        <PersonalIntelligenceSection />
        <FeatureShowcase />
        <ProductPreview />

        {/* Section 06: Privacy Fortress & Data Control */}
        <PrivacyFortress />

        {/* Section 07: Future Horizon Vision */}
        <FutureVisionStory />

        {/* FAQ Accordion */}
        <LandingFaq />

        {/* Section 08: Immersive Final Multi-Chromatic CTA */}
        <ImmersiveFinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
