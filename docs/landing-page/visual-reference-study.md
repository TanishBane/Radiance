# Radiance Visual Reference Study & Creative Direction Research

**Target System:** Radiance Personal AI Public Experience (`/`)  
**Date:** November 9, 2026  
**Author:** Creative Director & Principal Frontend Architect  
**Visual Anchor:** Product UI Source of Truth (`media_1794212657038_5cf1075d.jpg`)

---

## 1. Source of Truth: The Existing Radiance Product UI

Before auditing external benchmarks, we conducted a rigorous visual decomposition of the provided Radiance AI chat interface screenshot (`media_1794212657038_5cf1075d.jpg`). The public website must inherit and expand this aesthetic:

```
+-------------------------------------------------------------------------+
|                                                                         |
|                          [IconMark (Squircle)]                          |
|                                                                         |
|                        Hello, I Am Radiance                             |
|         "Illuminate what is possible. Stream real-time reasoning..."    |
|                                                                         |
|         * Tell me what's on your mind, or pick a suggestion.            |
|                                                                         |
|   +-------------------+  +-------------------+  +-------------------+   |
|   | Understand (Cyan) |  |   Create (Blue)   |  |  Explore (Violet) |   |
|   | - book character  |  | - job negotiation |  | - spring getaway  |   |
|   | - pack suitcase   |  | - game night plan |  | - plant care tips |   |
|   | - research topic  |  | - out of office   |  | - cooking trends  |   |
|   +-------------------+  +-------------------+  +-------------------+   |
|                                                                         |
|   +-----------------------------------------------------------------+   |
|   | Ask RADIANCE anything...                                        |   |
|   | [+] [>_ Build v] [(*) Radiance OpenWeights v]       [(mic)] [^] |   |
|   +-----------------------------------------------------------------+   |
|                                                                         |
+-------------------------------------------------------------------------+
```

### Visual Characteristics of the Radiance Identity:
1. **Cosmic Atmospheric Atmosphere:** Deep midnight foundation (`#040810`, `#060f1c`) intersected by diagonal volumetric auroral sweeps of deep teal (`#0d3846`), bright turquoise (`#06b6d4`), and ocean sapphire (`#1d4ed8`), with subtle stardust particles.
2. **Luminous IconMark:** A dark glass squircle featuring Radiance's geometric striped "R" emblem, bordered by a soft cyan-indigo gradient rim glow.
3. **Iridescent Typography:** "Hello, I Am **Radiance**" where the brand wordmark blends from high-chroma cyan (`#06b6d4`) to electric violet (`#8b5cf6`).
4. **Three Suggestion Triads:** Translucent floating glass cards (`rgba(14, 25, 44, 0.65)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`) with dedicated chromatic families:
   - *Understand:* Cyan / turquoise glow (`rgba(6, 182, 212, 0.25)`).
   - *Create:* Electric sapphire blue glow (`rgba(59, 130, 246, 0.22)`).
   - *Explore:* Violet / magenta glow (`rgba(168, 85, 247, 0.22)`).
5. **Floating Composer Dock:** Luminous pill container with subtle internal drop shadow, model selection badge (`Radiance OpenWeights`), mode switcher (`>_ Build`), and tactile input controls.

---

## 2. Competitive & Benchmark Website Study

### 2.1 Stripe (`https://stripe.com`)
* **Key Observations:**
  - *Multicolour Gradient Landscapes:* Stripe uses angled, multi-stop mesh gradients that transition dynamically across viewports without overwhelming foreground content.
  - *Layered Visual Depth:* Glassmorphic cards with faint borders (`1px solid rgba(255, 255, 255, 0.1)`) float over dynamic color fields, creating tactile hierarchy.
  - *Section Transitions:* Colors evolve progressively down the page (e.g., purple/indigo into turquoise/cyan into coral/gold).
* **Selected Techniques for Radiance:**
  - Multi-stop atmospheric gradient meshes for section backgrounds.
  - Progressive color transitions between sections to create a sense of continuous exploration.

### 2.2 Framer (`https://www.framer.com`)
* **Key Observations:**
  - *Scroll-Driven Motion:* Components animate into place using spring physics rather than rigid linear easing.
  - *Interactive Micro-Demos:* Users can interact with live interface controls directly on marketing sections, creating immediate engagement.
  - *Layout Morphing:* Shared layout animations (`layoutId`) seamlessly morph container borders when switching tabs.
* **Selected Techniques for Radiance:**
  - Spring-driven entrance reveals using `motion/react` (`stiffness: 350`, `damping: 30`).
  - Interactive Preference Sandbox where clicking "Concise", "Detailed", or "Structured" morphs the sample reply in real time.

### 2.3 Linear (`https://linear.app`)
* **Key Observations:**
  - *Typography Precision:* Tight tracking on display headlines (`-0.03em`), geometric sans-serif, and subtle monochromatic microcopy for technical metadata.
  - *Restrained Luminosity:* High-contrast borders that catch ambient light only on hover or active states.
  - *Section Rhythm:* Generous whitespace (80px–120px) separating thematic ideas, giving each concept room to breathe.
* **Selected Techniques for Radiance:**
  - Plus Jakarta Sans (`var(--font-sans)`) with fluid `clamp()` sizing and calibrated letter-spacing.
  - Subtle interactive border illuminations on hover/active states.

### 2.4 Raycast (`https://raycast.com`)
* **Key Observations:**
  - *Product UI as Marketing Visual:* The actual product interface (the command bar and extension views) is the visual hero, not abstract 3D blobs.
  - *Contextual Callouts:* Small margin notes or pill tags point to specific interface elements explaining their purpose.
* **Selected Techniques for Radiance:**
  - Faithful recreation of the Radiance chat interface (from the provided screenshot) as the hero visual anchor, complete with suggestion cards and composer dock.

### 2.5 Vercel (`https://vercel.com`)
* **Key Observations:**
  - *Technical Rigor:* Clean grid structures, monospace badges for technical capabilities, and dark/light contrast.
  - *Truthful Communication:* Direct explanations of technical mechanics rather than exaggerated marketing claims.
* **Selected Techniques for Radiance:**
  - Accurate, transparent explanation of bounded lexical context retrieval and browser-local storage in the Privacy and Architecture sections.

### 2.6 Apple (`https://apple.com`)
* **Key Observations:**
  - *Cinematic Narrative Pacing:* Sections unfold sequentially like scenes in a film: opening statement -> conflict/problem -> product resolution -> technical capability -> ethical/privacy stance -> invitation.
* **Selected Techniques for Radiance:**
  - 8-part narrative sequence from Problem ("Conversations Start from Zero") to Resolution ("Personal Intelligence") to Truth ("Privacy Fortress") to Vision and Final CTA.

---

## 3. Radiance 8-Section Visual & Narrative Mapping

| Section | Title | Primary Colour World | Key Visual / Interactive Feature |
|---|---|---|---|
| **01. Hero** | Personal Intelligence, Reimagined | Oceanic Teal, Cyan, Violet | Screenshot-faithful interactive product stage with suggestion cards and composer |
| **02. The Problem** | Context Lost Between Chats | Sapphire, Slate, Cool Grey | Side-by-side comparison: Generic AI vs Radiance with assembled context |
| **03. The Core** | Personal Intelligence Engine | Lavender, Indigo, Rose, Cyan | Progressive 4-step interactive demonstration of notes, preferences, and retrieval |
| **04. Control** | Shape the Experience | Coral, Rose, Violet, Warm Gold | Interactive preference toggle (Concise, Detailed, Structured) with live morphing |
| **05. Retrieval** | Bounded Lexical Pipeline | Coral, Amber, Electric Blue | Animated SVG conduit tracking: Saved Note -> Lexical Match -> Model Context |
| **06. Privacy** | Your Context, Your Choice | Emerald, Mint, Seafoam Teal | Realistic Settings UI disclosing local plaintext storage, opt-in provider sharing |
| **07. Vision** | Intelligence with Room to Evolve | Cosmic Violet, Magenta, Blue | Floating future architecture cards (adaptive memory, multi-doc synthesis) |
| **08. Final CTA** | Your Next Conversation Feels Different | Sunset Aurora (Blue, Cyan, Violet, Coral) | Expansive radiant gradient landscape with primary button launching `/chat` |
