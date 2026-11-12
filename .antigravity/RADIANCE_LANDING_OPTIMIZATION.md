# Radiance Landing-Page & Chat Optimization

> Branch: `perf/radiance-landing-refinement` based on `origin/main` at `a49157e`

## Implementation Stages

### Stage 1 — Local Fonts & Initial-Render Integrity
- Replaced Google Fonts CDN with self-hosted variable WOFF2 files via `next/font/local`
- Added Plus Jakarta Sans (latin) and JetBrains Mono (latin) with OFL licenses
- Eliminates external font requests, prevents FOUT, reduces LCP

### Stage 2 — Central Scroll & Lazy Canvas Allocation Pipeline
- Created `src/lib/scroll/fade-pipeline.ts`: scroll-driven fade-transition engine
- Two-layer allocation strategy: max 2 full-resolution background canvases at any time; remaining layers reduced to 1×1
- Fade transitions prevent visual pops during layer swaps
- `reducedMotion` draws a single static frame per active layer
- 10 canvas test IDs preserved: `canvas-deep-ocean` through `canvas-celestial-dawn`
- Unit tests: `tests/unit/fade-pipeline.test.ts` (6 tests)

### Stage 3 — Multicolour Section Scrims & Legibility
- Hue-matched radial-gradient scrims behind section headings in `landing-atmosphere.css`
- Hero editorial column scrim (deep-ocean/aurora gradient blend)
- Text-shadow on hero display heading and narrative lede
- Preserved gradient text effect on `<em>` elements
- Desktop breakpoint (≥900px) inset adjustment for hero scrim

### Stage 4 — Typography Hierarchy
- Cormorant Garamond serif for editorial headings (`landing-redesign.css`)
- Section heading scale, monospace telemetry accents
- Preference toggle bar responsive wrapping fix (`personal-intelligence-story.css`)
- Hero stage controls overflow fix (`hero-landscape.css`)

### Stage 5 — Product-Truth & Metadata Corrections
- Updated page metadata: `title="Radiance — AI that brings your context forward"`
- JSON-LD SoftwareApplication schema with `operatingSystem: "Web"`
- Copy corrections across hero, product introduction, product preview, context pipeline, privacy fortress, problem comparison, and immersive CTA sections

### Stage 6 — Chat Composer Focus & Model-Label Fixes
- Composer focus ring: 2px solid, 3px offset
- Model-label truncation: `max-w-[92px]` with ellipsis
- Responsive chat page layout fixes

## Verification Results

### Build Pipeline
| Check | Result |
|-------|--------|
| `pnpm build` | ✅ 11/11 static pages compiled |
| `pnpm typecheck` | ✅ No errors |
| `pnpm lint` | ✅ No warnings or errors |
| `pnpm test` | ✅ 61/61 files, 576/576 tests passing |

### WCAG Contrast Verification (verify-stage3.mjs)
All measured at `prefers-reduced-motion: reduce`, 3 viewports:

| Viewport | Sections Passing | Worst Heading Contrast | Worst Body Contrast |
|----------|-----------------|----------------------|-------------------|
| 1440px | 22/22 | 8.80:1 | 4.56:1 |
| 390px | 22/22 | 8.41:1 | 5.56:1 |
| 320px | 22/22 | 6.91:1 | 6.15:1 |

Thresholds: body text ≥ 4.5:1, large headings ≥ 3:1.

### Layout Verification (verify-layout.mjs)
| Metric | 1440px | 390px | 320px |
|--------|--------|-------|-------|
| Document overflow | None | None | None |
| Section overflow offenders | 0 | 0 | 0 |
| CLS | 0.013 | — | — |
| LCP | 200ms | — | — |
| DOM nodes | 728 | — | — |

- Typography: Cormorant Garamond Light rendering confirmed on h1 and section h2s
- Metadata: title, description, JSON-LD all verified
- No-JS: h1, lede, primary CTA, and nav all visible; font-family falls back correctly
- Chat composer: `modelLabel="Radiance Fast"`, not truncated, focus ring confirmed at all viewports

### Canvas Architecture
- 10 ASCII art layers with test IDs managed by `arctic-icebergs-background.tsx`
- Two-layer allocation: max 2 full-resolution canvases active; rest at 1×1
- Fixed background container preserved
- Fade transitions without pops
- Correct stop/resume behaviour
- Reduced-motion: single static frame per active layer

## Known Pre-Existing Issues (Not Introduced by This Branch)
- `.pipeline-node` has minor horizontal clipping at desktop (scrollWidth 298 > clientWidth 280) — pre-existing
- `.final-cta-content` extends beyond container via intentional scrim pseudo-element (`inset: -2.25rem -2.5rem -2rem`)
- `.vision-grid` minor vertical overflow at desktop — pre-existing

## Test Fixes Required
| Test File | Issue | Fix |
|-----------|-------|-----|
| `mobile-cross-browser.test.tsx` | Missing `next/font/local` mock after Stage 1 | Added mock |
| `mobile-cross-browser.test.tsx` | `max-w-[70px]` → `max-w-[92px]` after Stage 6 | Updated assertion |
| `problem-comparison.test.tsx` | Copy changed in Stage 5 | Updated assertion string |

## Evidence Locations (scratch/, not committed)
- `scratch/stage3/contrast.json` — full contrast measurements
- `scratch/final/layout.json` — full layout report
- `scratch/stage3/*.png` — per-section contrast screenshots
- `scratch/final/*.png` — layout verification screenshots
