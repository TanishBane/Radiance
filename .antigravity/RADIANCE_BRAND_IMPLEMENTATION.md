# RADIANCE BRAND SYSTEM IMPLEMENTATION SPECIFICATION

**Document ID:** `RADIANCE-BRAND-IMPL-001`  
**Mission ID:** `RADIANCE-BRAND-001`  
**Status:** IMPLEMENTED & DEPLOYED LOCALLY  

---

## 1. Asset Architecture & Public Brand Family

The official Radiance vector brand suite is deployed under `public/brand/` and `public/icon.svg`:

### 1.1 `public/brand/radiance-symbol.svg`
- **Role:** Master isolated vector symbol for UI chrome, headers, watermarks, and brand badges.
- **ViewBox:** `0 0 800 700`
- **Color Mode:** `fill="currentColor"` (dynamically inherits theme accents, gradients, or white foregrounds).
- **Background:** 100% transparent (no baked black rectangles).
- **Geometry:** 17 discrete `<path>` elements grouped into 11 bands with `data-band` and `data-seg` attributes:
  - Band 1: `1A` (speed pill) + `1B` (top loop bar)
  - Band 2: `2` (continuous upper loop bar)
  - Band 3: `3` (continuous upper loop bar with bottom eye arch ceiling)
  - Band 4: `4A` (stem) + `4B` (outer loop apex)
  - Band 5: `5A` (longest speed tail, $X=106.6$) + `5B` (lower loop curve)
  - Band 6: `6` (solid waist closure)
  - Band 7: `7` (solid waist transition)
  - Band 8: `8` (solid waist with bottom leg arch apex)
  - Band 9: `9A` (stem) + `9B` (slanted leg)
  - Band 10: `10A` (stem) + `10B` (slanted leg)
  - Band 11: `11A` (stem baseline foot) + `11B` (slanted leg baseline foot)

### 1.2 `public/brand/radiance-wordmark.svg`
- **Role:** Standalone horizontal typographic wordmark.
- **ViewBox:** `0 0 540 100`
- **Typography:** Cormorant Garamond 700, `letter-spacing: 0.22em`, capitalized "RADIANCE".

### 1.3 `public/brand/radiance-lockup.svg`
- **Role:** Canonical horizontal lockup for documentation headers, marketing assets, and splash screens.
- **ViewBox:** `0 0 660 140`
- **Structure:** Symbol scaled at 15% on the left + "RADIANCE" title at $(160, 82)$ + "INTELLIGENCE PLATFORM" monospace subtitle at $(164, 106)$.

### 1.4 `public/brand/radiance-micro.svg`
- **Role:** Dedicated micro-mark for 16px favicon, 24px/32px toolbars, and system trays.
- **Tuning:** Subtle stroke reinforcement to maintain crisp optical separation across narrow pixel grids without blurring or clumping.

### 1.5 `public/icon.svg`
- **Role:** PWA application icon, Apple touch icon, and browser tab favicon.
- **ViewBox:** `0 0 512 512`
- **Structure:** Dark void `#06060a` rounded squircle (`rx="120"`) with subtle 1px ambient border (`rgba(255, 255, 255, 0.08)`) and centered white Radiance Speed-R scaled to $384 \times 336\text{ px}$.

---

## 2. Component Engineering (`RadianceLogo`)

Located at [radiance-logo.tsx](file:///c:/Tanixai-main/src/components/branding/radiance-logo.tsx):

```tsx
export interface RadianceLogoProps {
  variant?: "symbol" | "wordmark" | "lockup" | "micro";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  showWordmark?: boolean;
  glow?: boolean;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  role?: string;
}
```

### Motion Choreography
When `animated={true}` and `prefers-reduced-motion` is false, each stripe executes a staggered horizontal glide:
- Initial state: `{ opacity: 0, x: -24 }`
- Animate state: `{ opacity: 1, x: 0 }`
- Duration: `0.45s`
- Stagger delay: `(stripe.band - 1) * 0.035s`
- Easing curve: `[0.16, 1, 0.3, 1]` (custom quintic-out acceleration)

When `prefers-reduced-motion: reduce` is detected via `useReducedMotion()`, animation transitions degrade to immediate static rendering (`duration: 0`).

---

## 3. Surface Integrations

### 3.1 Sidebar Navigation Dock
In [sidebar-dock.tsx](file:///c:/Tanixai-main/src/components/navigation/sidebar-dock.tsx):
- Replaced the text `"RD"` button with `<RadianceLogo variant="symbol" size="sm" showWordmark={false} className="w-5 h-4.5 text-[var(--txt)]" />`.
- Wrapped in a sleek elevated surface card with hover scale and dynamic theme border.

### 3.2 Welcome Screen Hero Gem
In [welcome-card.tsx](file:///c:/Tanixai-main/src/components/chat/welcome-card.tsx):
- Replaced the static `"RD"` monospace text inside the hero gem with `<RadianceLogo variant="symbol" size="lg" showWordmark={false} animated glow className="w-10 h-9" />`.
- Features staggered entrance glide and soft ambient violet glow synchronized with the active dynamic theme.

### 3.3 Cinema Intro Splash
In [intro-splash.tsx](file:///c:/Tanixai-main/src/components/branding/intro-splash.tsx):
- Replaced the large `"RD"` text with `<RadianceLogo variant="symbol" size="hero" showWordmark={false} animated glow className="w-24 h-21 text-[var(--accent)]" />`.
- Paired with serif `"RADIANCE"` title and italic tagline `"Illuminate what is possible"`.

### 3.4 Root Metadata & Favicons
In [layout.tsx](file:///c:/Tanixai-main/src/app/layout.tsx):
- Declared explicit `icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }], shortcut: "/icon.svg", apple: "/icon.svg" }` and `manifest: "/manifest.json"`.
