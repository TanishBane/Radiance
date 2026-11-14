# RADIANCE ASSET & DESIGN IP/LICENSING AUDIT REPORT

**Audit Date:** November 15, 2026  
**Auditor:** `assetsaudit` (Phase 2, Worker 3)  
**Scope:** Static assets, web fonts, icon sets, illustrations, brand identity vectors, WebGL shaders, 3D models, canvas systems, and media across `public/`, `src/`, `docs/`, and `styles`.

---

## 1. Executive Summary

This audit catalogs all visual, typographic, vector, raster, 3D, and shader assets across the Radiance platform.
Key highlights:
- **Zero local proprietary font files:** All fonts are loaded via Google Fonts CDN or Next.js build-time font optimization under the SIL Open Font License 1.1 (OFL-1.1).
- **Core brand assets are 100% original Radiance creations:** The official 11-stripe "Speed-R" vector system (`public/brand/*`, `public/icon.svg`) was custom-engineered for Radiance.
- **Iconography relies on permissive MIT/ISC libraries:** `lucide-react` (ISC/MIT) and `@tabler/icons-react` (MIT); no direct `@radix-ui/react-icons` assets are utilized.
- **External 3D Models & Textures Flagged as Unverified:** The 3D planet landing experience (`src/components/landing/webgl-planet.tsx` and `public/ascend.html`) dynamically hotlinks `.glb` 3D models and cloud textures from an external Supabase storage bucket (`api.getlayers.ai`). These models carry no explicit open-source license and present both supply-chain and IP risk.
- **Third-Party Photography in ASCII Art:** One procedural ASCII piece (`src/lib/ascii-art/starry-ridge.ts`) was generated from an Unsplash photo by Vincentiu Solomon under the permissive Unsplash License with full attribution in source.

---

## 2. Categorized Asset Inventory

### Category 1: Original Radiance-Created Assets
*Assets authored directly by the Radiance engineering and design team. Owned under Radiance proprietary copyright.*

| Asset File / Identifier | Description | Author / Creator | License | Status |
| :--- | :--- | :--- | :--- | :--- |
| `public/brand/radiance-symbol.svg` | Geometric 11-band Speed-R symbol | Radiance Team (TanishBane) | Proprietary © 2026 Radiance | Clean |
| `public/brand/radiance-wordmark.svg` | Cormorant Garamond typographic wordmark | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `public/brand/radiance-lockup.svg` | Integrated Speed-R symbol + wordmark + subtitle | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `public/brand/radiance-micro.svg` | High-contrast micro mark for 16/24/32px displays | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `public/icon.svg` | Squircle Speed-R app icon and favicon | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `src/components/branding/radiance-logo.tsx` | Animated React vector logo component | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `public/opengraph-image.png` | 1280x640 OpenGraph card (Playwright generated) | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `docs/assets/radiance-social-preview.png` | Social card identical to opengraph-image | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `src/components/background/ambient-canvas.tsx` | Ambient gradient GLSL canvas shader | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `src/lib/ascii-art/*.ts` (excl. starry-ridge) | 10 procedural ASCII landscape engines | Radiance Team | Proprietary © 2026 Radiance | Clean |
| `docs/**/*.png`, `.antigravity/screenshots/*.png` | 99 automated Playwright test/review screenshots | Radiance Team | Proprietary © 2026 Radiance | Clean |

---

### Category 2: Third-Party Assets (Permissive Open Source)
*External assets licensed under recognized open source licenses (OFL, MIT, ISC, Apache 2.0).*

| Asset / Library | Type | Original Author / Foundry | Source URL | Declared License | Attribution Required? |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Cormorant Garamond** | Web Font | Christian Thalmann (Catharsis Fonts) | [GitHub](https://github.com/CatharsisFonts/Cormorant) | SIL OFL 1.1 | Yes (preserve OFL notice) |
| **Plus Jakarta Sans** | Web Font | Gumpita Rahayu (Tokotype) | [GitHub](https://github.com/tokotype/PlusJakartaSans) | SIL OFL 1.1 | Yes (preserve OFL notice) |
| **JetBrains Mono** | Web Font | Philipp Nurullin, Konstantin Bulenkov (JetBrains) | [GitHub](https://github.com/JetBrains/JetBrainsMono) | SIL OFL 1.1 | Yes (preserve OFL notice) |
| **KaTeX Fonts** | Web Fonts | Khan Academy / Donald Knuth | [KaTeX](https://github.com/KaTeX/KaTeX) | SIL OFL 1.1 | Yes (preserve OFL notice) |
| **Inter** (in `ascend.html`) | Web Font | Rasmus Andersson | [GitHub](https://github.com/rsms/inter) | SIL OFL 1.1 | Yes (preserve OFL notice) |
| **Lucide Icons** (~70 icons) | Icon Pack | Lucide Project / Cole Bemis | [GitHub](https://github.com/lucide-icons/lucide) | ISC / MIT | Yes (preserve ISC/MIT notice) |
| **Tabler Icons** (4 icons) | Icon Pack | Paweł Kuna (Tabler) | [GitHub](https://github.com/tabler/tabler-icons) | MIT | Yes (preserve MIT notice) |
| **Three.js & JSM Passes** | 3D / Shaders | Ricardo Cabello (mrdoob) & contributors | [GitHub](https://github.com/mrdoob/three.js) | MIT | Yes (preserve MIT notice) |
| **Draco WASM Decoder** | WASM / 3D | Google Draco Team | [Google Draco](https://github.com/google/draco) | Apache 2.0 | Yes (preserve Apache 2.0) |

---

### Category 3: Modified Third-Party Assets
*External assets or templates that have been adapted, filtered, or converted for Radiance.*

| Asset / Module | Original Source & Author | License | Modifications Made | Attribution Required? |
| :--- | :--- | :--- | :--- | :--- |
| `src/lib/ascii-art/starry-ridge.ts` | Photo by Vincentiu Solomon on Unsplash ([link](https://unsplash.com/photos/ln5drpv_ImI)) | Unsplash License (Commercial & Non-Commercial free) | Quantized raster photo downscaled to 192x108 textmode ASCII art array via `scripts/from-image.py` | Attribution included in file header |
| `src/components/landing/webgl-starfield.tsx` | WebGL particle starfield shader / demo | MIT / Permissive | Adapted into 45-second dynamic theme fading system with Radiance brand palette uniforms | Yes (include MIT shader attribution) |
| `src/components/landing/ascend-*.tsx` | Ascend landing section components | Derived from `public/ascend.html` | Converted HTML/CSS into React 19/Next.js App Router components with Radiance copy | Flagged (see Category 4) |

---

### Category 4: Unknown, Unverified, or High-Risk Assets
*Assets lacking clear open-source licensing or loaded from external non-CDN endpoints.*

| Asset Identifier | Asset Type | Hosting Endpoint / Location | Risk Level | Description & Remediation |
| :--- | :--- | :--- | :--- | :--- |
| `planet.glb` | 3D Binary Model (GLTF) | `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet.glb` | **HIGH** | External 3D earth model hotlinked at runtime. Author unknown; no license file in bucket. **Action:** Replace with a verified CC0 / MIT 3D earth model or custom procedural sphere shader. |
| `planet-lights.glb` | 3D Binary Model (GLTF) | `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-lights.glb` | **HIGH** | External 3D city night lights model hotlinked at runtime. **Action:** Replace or bundle verified asset. |
| `planet-clouds.png` | 2D Texture Image | `https://api.getlayers.ai/storage/v1/object/public/public/assets/ascend-d9857ad1f2/planet-clouds.png` | **HIGH** | External cloud texture hotlinked at runtime. **Action:** Replace with NASA Blue Marble cloud map (public domain) or procedural noise. |
| `public/ascend.html` | Uncompiled HTML Mockup | Local file in `public/ascend.html` (64.8 KB) | **MEDIUM** | Raw Ascend template file containing all hotlinked assets. Not used by Next.js. **Action:** Remove from `public/` or archive outside public bundle. |
| `ascii.js` | Dynamic Script CDN | `https://www.ascii-magic.com/ascii/ascii.js` | **LOW / MEDIUM** | External client script loaded via Next.js `<Script>` in `layout.tsx`. Does not state explicit open-source license. |

---

## 3. Required Attribution Notices

The following attribution notices MUST be compiled into Radiance's official `NOTICE` / `THIRD_PARTY_LICENSES.md` file:

```markdown
# THIRD-PARTY ASSET LICENSES & ATTRIBUTIONS

This software incorporates fonts, icons, photographs, and graphics from the following upstream projects:

--------------------------------------------------------------------------------
1. CORMORANT GARAMOND FONT
--------------------------------------------------------------------------------
Copyright (c) 2015 Christian Thalmann (christian.thalmann@gmail.com),
with Reserved Font Name "Cormorant".
Licensed under the SIL Open Font License, Version 1.1.
http://scripts.sil.org/OFL

--------------------------------------------------------------------------------
2. PLUS JAKARTA SANS FONT
--------------------------------------------------------------------------------
Copyright (c) 2020 The Plus Jakarta Sans Project Authors (https://github.com/tokotype/PlusJakartaSans)
Licensed under the SIL Open Font License, Version 1.1.
http://scripts.sil.org/OFL

--------------------------------------------------------------------------------
3. JETBRAINS MONO FONT
--------------------------------------------------------------------------------
Copyright 2020 The JetBrains Mono Project Authors (https://github.com/JetBrains/JetBrainsMono)
Licensed under the SIL Open Font License, Version 1.1.
http://scripts.sil.org/OFL

--------------------------------------------------------------------------------
4. KATEX FONTS
--------------------------------------------------------------------------------
Copyright (c) 2013-2020 Khan Academy
Licensed under the SIL Open Font License, Version 1.1.
http://scripts.sil.org/OFL

--------------------------------------------------------------------------------
5. LUCIDE ICONS (lucide-react)
--------------------------------------------------------------------------------
Portions Copyright (c) 2013-2022 Cole Bemis (Feather Icons, MIT License).
All other Copyright (c) 2022-present Lucide Contributors.
Licensed under the ISC License.
https://github.com/lucide-icons/lucide/blob/main/LICENSE

--------------------------------------------------------------------------------
6. TABLER ICONS (@tabler/icons-react)
--------------------------------------------------------------------------------
Copyright (c) 2020-2024 Paweł Kuna
Licensed under the MIT License.
https://github.com/tabler/tabler-icons/blob/master/LICENSE

--------------------------------------------------------------------------------
7. THREE.JS & POSTPROCESSING SHADERS
--------------------------------------------------------------------------------
Copyright (c) 2010-2025 Three.js Authors
Licensed under the MIT License.
https://github.com/mrdoob/three.js/blob/dev/LICENSE

--------------------------------------------------------------------------------
8. DRACO 3D GEOMETRY COMPRESSION DECODER
--------------------------------------------------------------------------------
Copyright (c) 2016 Google Inc.
Licensed under the Apache License, Version 2.0.
http://www.apache.org/licenses/LICENSE-2.0

--------------------------------------------------------------------------------
9. STARRY RIDGE PHOTOGRAPHY
--------------------------------------------------------------------------------
Original photograph: "Milky way over mountains" by Vincentiu Solomon.
Published on Unsplash: https://unsplash.com/photos/ln5drpv_ImI
Licensed under the Unsplash License (free commercial & non-commercial use).
Converted into procedural textmode ASCII representation for Radiance.
```

---

## 4. Remediation Recommendations

1. **Eliminate Runtime Hotlinking to `api.getlayers.ai`:**
   - Either replace `planet.glb`, `planet-lights.glb`, and `planet-clouds.png` with verified public domain NASA assets (e.g. NASA Visible Earth Blue Marble textures on a Three.js `SphereGeometry`), or self-host verified licensed assets under an audited open-source license.
2. **Remove `public/ascend.html`:**
   - This 1,822-line file is a raw third-party template sitting in the public root. Leaving it in `public/` means it is served publicly at `/ascend.html`. It should be archived or deleted.
3. **Formalize NOTICE File:**
   - Incorporate the attribution text above into the project's root `NOTICE` / `THIRD_PARTY_LICENSES` documentation.
