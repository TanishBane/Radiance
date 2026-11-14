# RADIANCE EXTERNAL COMPONENT & 21ST.DEV AUDIT REPORT
**Audit Scope:** External components, UI patterns, shaders, animations, hooks, and snippets from 21st.dev, GitHub, Aceternity UI, Magic UI, Shadcn, ASCII Magic, and GetLayers AI.  
**Auditor:** `@extaudit` (Phase 2, Worker 1)  
**Date:** 2026-11-15  

---

## 1. Executive Summary & Audit Methodology
A comprehensive automated and manual code audit was conducted across `src/components/`, `src/features/`, `src/hooks/`, `src/lib/`, `public/`, and `tests/`. Git commits, author histories, 21st.dev marketplace registries, upstream repositories, Terms of Service (`https://21st.dev/terms`, `getlayers.ai/terms`), and licensing metadata were analyzed.

In total, **11 distinct external components/libraries/patterns** were identified:
- **8 components** are licensed under the permissive **MIT License** (Aceternity UI, 21st.dev Shiny Button by Hyperiux, 21st.dev Voxel Wall by Mazyar Kawa, 21st.dev Prompt Composer by Neeraj Singh, 21st.dev Flagship Atmosphere engines, ASCII Magic toolkit, Shadcn `cn`, Simplex Noise / Inigo Quilez shader math).
- **2 components** originate from **GetLayers AI** under a commercial license with unrestricted production build rights and no attribution requirement (Ascend 3D Planet and Starfield Close).
- **1 design pattern** is an original implementation inspired by boutique design directions from the `taste-skill` / Awwwards library (Fluted Glass Torus).

---

## 2. Complete Component Inventory & Audit Matrix

| # | Component Name | Original Author | Original Source URL | License | Files Containing Incorporated Material | Modified? | Required Copyright & Attribution | Commercial & Redistribution Rights | Redistribution Flag |
|---|----------------|-----------------|---------------------|---------|----------------------------------------|-----------|----------------------------------|------------------------------------|---------------------|
| 1 | **Aceternity Sidebar** | Manu Arora (`@mannupaaji` / Aceternity UI) | `https://ui.aceternity.com/components/sidebar`<br>`https://21st.dev/aceternity/sidebar` | MIT | `src/components/ui/sidebar.tsx`<br>`src/components/navigation/sidebar-dock.tsx` | **Yes** — Luminous dark-violet glassmorphism, optical sheen, focus trap, WCAG Escape dismissal, reduced motion, badge logic | `Copyright (c) Manu Arora / Aceternity UI` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 2 | **Shiny Button** | Hyperiux Vault (`@hyperiux` on 21st.dev) / Magic UI | `https://21st.dev/@hyperiux/shiny-button`<br>`https://magicui.design/docs/components/shiny-button` | MIT | `src/components/ui/shiny-button.tsx`<br>`src/components/ui/shiny-button.css`<br>`src/components/ui/shiny-button-demo.tsx`<br>`src/components/ui/demo.tsx`<br>Used in: `hero-landscape.tsx`, `landing-cta.tsx`, `immersive-final-cta.tsx` | **Yes** — Converted from styled-jsx to CSS `@property`, polymorphic `Link` support, custom size variants, theme CSS variables | `Copyright (c) Hyperiux Vault / 21st.dev Community` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 3 | **3D Voxel Wall** | Mazyar Kawa (`@mazyar-kawa` on 21st.dev) | `https://21st.dev/@mazyar-kawa/voxel-wall` | MIT | `src/components/ui/voxel-wall.tsx`<br>`src/components/ui/voxel-wall-demo.tsx`<br>`src/components/ui/voxel-wall-utils/wall.tsx`<br>`src/components/ui/voxel-wall-utils/camera-rig.tsx`<br>`src/components/ui/voxel-wall-utils/light-rays.tsx`<br>Used in: `immersive-final-cta.tsx` | **Yes** — Custom voxel colors, SSR safety guards, reduced motion handling, camera rig parameters, radial gradient vignette | `Copyright (c) Mazyar Kawa` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 4 | **AI Prompt Composer with Model Selector** | Neeraj Singh (`@neeraj-singh` / SmoothUI / Pasta UI on 21st.dev) | `https://21st.dev/community/ai-prompt-composer-with-model-selector` | MIT | Originally `src/components/ui/ai-prompt-composer-with-model-selector.tsx` (commit `a3741f3`), refactored into `src/components/chat/chat-composer.tsx` | **Yes** — Heavily re-architected into Radiance's production `ChatComposer` with model router, Plan/Ask/Build modes, document attachments, voice recognition, and i18n | `Copyright (c) Neeraj Singh / 21st.dev Community` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 5 | **21st.dev Flagship Atmosphere Canvas Engines** | 21st.dev Community & Aceternity UI (`@ham7a311`, Manu Arora, Linear/Vercel) | `https://ui.aceternity.com/components/spotlight`<br>`https://21st.dev/@ham7a311/ribbon-flow`<br>`https://ui.aceternity.com/components/meteors` | MIT | `src/components/background/atmosphere-canvas-engine.tsx`<br>`src/components/background/aurora-gradient-background.tsx`<br>`src/lib/types/theme.ts` | **Yes** — Fully rebuilt from scratch as pure Retina HTML5 Canvas 2D mathematical shaders with mouse spring lerp damping, reduced motion static rendering, and 28-theme interpolation | `Copyright (c) Manu Arora, @ham7a311, 21st.dev Community` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 6 | **Ascend 3D Planet & Landing Experience** | GetLayers AI (`getlayers.ai`) | `https://www.getlayers.ai/` (Ascend template) | GetLayers AI Commercial License (Free Curated Layer) | `public/ascend.html`<br>`src/components/landing/webgl-planet.tsx`<br>`src/components/landing/radiance-planet-landing.tsx`<br>`src/components/landing/ascend-hero.tsx`<br>`ascend-features.tsx`<br>`ascend-showcase.tsx`<br>`ascend-cta.tsx`<br>`ascend-planet-landing.css` | **Yes** (in `src/`), **Unmodified** (in `public/ascend.html`) | None required by GetLayers terms ("No attribution is required"). | Commercial use allowed for websites. Direct resale or bulk redistribution of raw layer templates prohibited. | **FLAGGED** (Hotlinked external assets & verbatim public demo file) |
| 7 | **Starfield Close 3D WebGL Scene** | GetLayers AI (`getlayers.ai`) | `https://www.getlayers.ai/` (Starfield Close asset) | GetLayers AI Commercial License | `public/starfield.html`<br>`src/components/landing/webgl-starfield.tsx`<br>`src/components/landing/dynamic-theme-indicator.tsx` | **Yes** — React component with 45s dynamic theme cycling, adaptive quality tiers, UnrealBloomPass, and mobile touch parallax | None required by GetLayers terms ("No attribution is required"). | Commercial use authorized for production websites. | **CLEAR** |
| 8 | **ASCII Art & Textmode Generative Toolkit** | ASCII Magic (`ascii-magic.com` / `ascii-magic-art`) | `https://ascii-magic.com/` | MIT | `src/lib/ascii-art/kit.ts`<br>12 scene modules (`arctic-icebergs.ts`, `balloon-valley-sunrise.ts`, `moonlit-sea.ts`, `mountain-sunrise.ts`, `nyc-skyline-night.ts`, `orbit-window-earth.ts`, `autumn-road-cyclist.ts`, `autumn-pagoda-maples.ts`, `falling-leaves.ts`, `aurora-curtains.ts`, `starry-ridge.ts`, `image.ts`)<br>`src/components/ui/ascii-art.tsx`<br>`src/components/background/arctic-icebergs-background.tsx` | **Yes** — Ported to TypeScript modules, scroll-driven cross-fading, multi-canvas layer coordination, reduced motion fallbacks | `Copyright (c) ASCII Magic (ascii-magic.com)` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 9 | **Fluted Glass Torus & Perspective Grid** | Inspired by `taste-skill` / One Page Love / Awwwards (Rendez-vous Francéclat & Synasite / Retreats) | `https://rendez-vous.franceclat.fr` | N/A (Bespoke Implementation) | `src/components/landing/fluted-glass-torus.tsx`<br>`src/components/landing/fluted-glass-torus.css` | **Original Code** — Custom SVG filters (`feGaussianBlur`, `feMerge`) and CSS vertical reeding slats | None required (original code) | Full proprietary ownership | **CLEAR** |
| 10 | **`cn` ClassName Utility** | shadcn (`shadcn/ui` / Vercel Community) | `https://ui.shadcn.com/` | MIT | `src/lib/utils/cn.ts` | **No** — Standard `clsx` + `twMerge` helper | `Copyright (c) shadcn` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |
| 11 | **Simplex Noise 3D & Cosine Palette Shaders** | Stefan Gustavson & Ian McEwan (Ashima Arts) / Inigo Quilez | `https://github.com/ashima/webgl-noise`<br>`https://iquilezles.org/articles/palettes/` | MIT | `public/ascend.html` (lines 1093-1117)<br>`src/components/landing/webgl-planet.tsx`<br>`src/components/landing/webgl-starfield.tsx` | **Yes** — Embedded into WebGL vertex/fragment shaders | `Copyright (c) 2011 Stefan Gustavson, Ian McEwan, Ashima Arts` | Permissive commercial distribution allowed with MIT notice | **CLEAR** |

---

## 3. High-Priority Risk Flags & Remediation Plan

### Flag 1: Runtime Dependency on External Storage (`webgl-planet.tsx`)
- **Issue:** `src/components/landing/webgl-planet.tsx` dynamically fetches 3D binary assets over HTTPS from an external Supabase storage endpoint:
  - `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet.glb`
  - `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-lights.glb`
  - `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-clouds.png`
- **Legal & Operational Risk:** This hotlinking exposes Radiance to third-party availability failure, CORS breakage, or unexpected asset revocation. Furthermore, redistributing hotlinks to private/unspecified third-party storage buckets is bad practice for a commercial/source-available product.
- **Remediation Action:**
  1. Retire/archive `webgl-planet.tsx` in favor of Radiance's procedural Three.js `webgl-starfield.tsx` and textmode canvas backgrounds, OR
  2. If the 3D planet is retained, replace the models with verified open-source/public domain NASA Blue Marble geometries and self-host all binary assets locally in `public/assets/`.

### Flag 2: Verbatim Third-Party HTML Files in `public/`
- **Issue:** Two full standalone prototype files exist directly in `public/`:
  - `public/ascend.html` (1,822 lines verbatim GetLayers AI landing page demo)
  - `public/starfield.html` (724 lines standalone WebGL prototype)
- **Legal Risk:** While GetLayers AI grants a commercial license to build websites with their layers, hosting and publicly serving verbatim template demo files can be construed as unauthorized redistribution of raw template libraries under GetLayers AI terms.
- **Remediation Action:**
  1. Remove `public/ascend.html` and `public/starfield.html` from the static production directory.
  2. Move any necessary reference files into `.antigravity/prototypes/` (excluded from production deployment).

### Flag 3: Lack of Attribution Notices in Code Headers & Notice File
- **Issue:** Although all incorporated 21st.dev, Aceternity, and ASCII Magic components carry permissive MIT licenses, their source files currently lack license headers acknowledging upstream authors (`@mannupaaji`, `@hyperiux`, `@mazyar-kawa`, `@neeraj-singh`, `@ham7a311`, ASCII Magic, Stefan Gustavson).
- **Compliance Requirement:** MIT licenses legally require the preservation of copyright notices and permission text in copies or substantial portions of the software.
- **Remediation Action:**
  1. Add standard short copyright header comments to `src/components/ui/sidebar.tsx`, `src/components/ui/shiny-button.tsx`, `src/components/ui/voxel-wall.tsx`, `src/lib/ascii-art/kit.ts`, etc.
  2. Ensure `@compliance` includes the full copyright and permission texts in `THIRD_PARTY_NOTICES.md`.

### Flag 4: Unused Test / Demo Files in Production Source Tree
- **Issue:** Standalone demo files copied from 21st.dev remain in `src/components/ui/`:
  - `src/components/ui/demo.tsx`
  - `src/components/ui/shiny-button-demo.tsx`
  - `src/components/ui/voxel-wall-demo.tsx`
- **Remediation Action:**
  Consolidate or move these demo components into `tests/fixtures/` or remove them to avoid dead code bloat in production bundles.

---

## 4. Draft Text for `THIRD_PARTY_NOTICES.md` (External Components Section)

```markdown
### 1. Aceternity UI Sidebar
- Upstream Author: Manu Arora (Aceternity UI)
- Source URL: https://ui.aceternity.com/components/sidebar | https://21st.dev/aceternity/sidebar
- License: MIT License
- Files: src/components/ui/sidebar.tsx, src/components/navigation/sidebar-dock.tsx
- Copyright: Copyright (c) Manu Arora

### 2. Shiny Button
- Upstream Author: Hyperiux Vault (21st.dev) / Magic UI
- Source URL: https://21st.dev/@hyperiux/shiny-button | https://magicui.design/docs/components/shiny-button
- License: MIT License
- Files: src/components/ui/shiny-button.tsx, src/components/ui/shiny-button.css
- Copyright: Copyright (c) Hyperiux Vault / 21st.dev Community

### 3. Voxel Wall 3D Scene
- Upstream Author: Mazyar Kawa (21st.dev)
- Source URL: https://21st.dev/@mazyar-kawa/voxel-wall
- License: MIT License
- Files: src/components/ui/voxel-wall.tsx, src/components/ui/voxel-wall-utils/*
- Copyright: Copyright (c) Mazyar Kawa

### 4. AI Prompt Composer
- Upstream Author: Neeraj Singh (SmoothUI / Pasta UI on 21st.dev)
- Source URL: https://21st.dev/community/ai-prompt-composer-with-model-selector
- License: MIT License
- Files: src/components/chat/chat-composer.tsx
- Copyright: Copyright (c) Neeraj Singh / 21st.dev Community

### 5. ASCII Magic Generative Canvas Toolkit
- Upstream Author: ASCII Magic (ascii-magic.com)
- Source URL: https://ascii-magic.com/
- License: MIT License
- Files: src/lib/ascii-art/*, src/components/ui/ascii-art.tsx, src/components/background/arctic-icebergs-background.tsx
- Copyright: Copyright (c) ASCII Magic

### 6. Shadcn ClassName Utility (`cn`)
- Upstream Author: shadcn (shadcn/ui)
- Source URL: https://ui.shadcn.com/
- License: MIT License
- Files: src/lib/utils/cn.ts
- Copyright: Copyright (c) shadcn

### 7. Simplex Noise GLSL (`snoise`)
- Upstream Authors: Stefan Gustavson and Ian McEwan (Ashima Arts)
- Source URL: https://github.com/ashima/webgl-noise
- License: MIT License
- Files: src/components/landing/webgl-planet.tsx, public/ascend.html
- Copyright: Copyright (C) 2011 Ashima Arts. All rights reserved. Copyright (C) 2011 Stefan Gustavson. All rights reserved.

### 8. GetLayers AI 3D Scenes (Starfield Close & Ascend)
- Upstream Provider: GetLayers AI (getlayers.ai)
- Source URL: https://www.getlayers.ai/
- License: GetLayers Commercial License (Free Tier / Curated Layers)
- Attribution: None required by upstream terms.
- Commercial Terms: Authorized for web development and production deliverables.
```

---
*Report recorded in `.antigravity/EXTERNAL_COMPONENT_AUDIT.md`. Submitted to `@compliance` and `@coordinator`.*
