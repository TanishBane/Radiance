# Radiance 21st.dev Flagship Atmosphere Engines Report

## 1. Executive Summary & Design Pivot
In strict conformance with the Master Directive, 21st.dev flagship UI benchmarks, Superpowers workflows, and the required design skills (`/ui-ux-pro-max`, `/frontend-design`, `/taste-skill`, `/impeccable`, `/brand-identity-art-direction`), the 5 deprecated/slop atmosphere engines have been completely removed and replaced with 5 gallery-grade, Retina-calibrated generative engines:

| Old / Deprecated Engine | Replacement Flagship Engine | Component Heritage & Aesthetic Model |
| :--- | :--- | :--- |
| `bloom` (Bloom Mesh) | **Ambient Spotlight** (`ambient-spotlight`) | Aceternity / 21st.dev Luxury Studio Conical Spotlight & Specular Ground Pool |
| `warp-speed` (Hyper Warp) | **Celestial Meteors** (`meteor-shower`) | 21st.dev Incandescent Shooting Stars with Gradient Trails & Starry Sky |
| `cyber-grid` (Tron Grid) | **Radiant Grid** (`radiant-grid`) | Linear / Vercel Architectural 44px Grid with Dynamic Cursor Radial Spotlight Mask |
| `zen-minimal` (Zen Obsidian) | **Fluid Aurora** (`fluid-aurora`) | 21st.dev Multi-Chromatic Plasma Ribbons with Gaussian Dispersion (`screen` blend) |
| `particle-vortex` (Stellar Vortex) | **Solar Corona** (`solar-corona`) | Sci-Fi Luxury Horizon Celestial Eclipse with 36 Harmonic Prominence Rays |

---

## 2. Technical Architecture & Mathematical Models

### 1. Ambient Spotlight (`ambient-spotlight`) — Signature Default
- **Volumetric Conical Beam:** Originating at top-center (`originY = -height * 0.12`), smoothly tracking `smoothMouse.x` with spring dampening (`lerp = 0.04`). The cone spreads outward with a dual-tier radial gradient (`rgba(r2, g2, b2, 0.24)` apex to transparent).
- **Ground Specular Diffusion:** Dynamic elliptical radial gradient centered at `smoothMouse` ($R = 380px$, $y$-scale $0.55$) with Gaussian falloff.
- **Volumetric Micro-Photons:** 36 atmospheric motes drifting inside the light cone; when passing through the spotlight beam, their luminance and twinkle amplitude boost smoothly.
- **Reduced Motion Fallback:** Displays a static, centered ambient spotlight beam at $t=0$.

### 2. Celestial Meteors (`meteor-shower`)
- **Incandescent Shooting Stars:** 18 meteors traveling at a 215° diagonal angle (top-right to bottom-left) with variable velocity ($4.0 - 9.0$ px/frame) and staggered offscreen respawns.
- **Linear Tail Dissipation:** Tapered trail gradient transitioning from incandescent white at head (`rgba(255, 255, 255, 0.95)`) through active theme accent (`theme.accent`) to tertiary shift (`theme.accentC`).
- **Scintillating Starry Field:** 48 quiescent background stars with individual harmonic twinkle frequencies ($Math.sin(t \times \omega + \phi)$).

### 3. Radiant Grid (`radiant-grid`)
- **Architectural Layout:** 44px geometric grid with base lines rendered in quiet opacity (`rgba(255, 255, 255, 0.025)`).
- **Dynamic Radial Spotlight Mask:** Grid lines within 320px radius of `smoothMouse` are clipped and illuminated with smooth gradient falloff ($(1 - \Delta / R) \times 0.35$).
- **Illuminated Intersection Crosshairs:** Grid nodes within 280px radius render glowing intersection crosshairs (`+`) and micro-diamonds that scale in brightness towards the cursor.

### 4. Fluid Aurora (`fluid-aurora`)
- **Harmonic Plasma Waves:** 4 undulating ribbons spanning the viewport, parameterized by multi-octave sinusoidal frequencies ($nx \times 3.4 + t \times speed$, $nx \times 6.8 - t \times 0.35$).
- **Optical Superposition:** Evaluated with `ctx.globalCompositeOperation = "screen"`, ensuring multi-layer overlaps produce luminous chromatic additions without muddy dark clipping.
- **Dynamic Organic Ripple:** Vertical displacement softly reacts to cursor horizontal offset.

### 5. Solar Corona (`solar-corona`)
- **Horizon Occultation:** Massive celestial disc anchored at bottom center ($cx = width \times 0.5$, $cy = height \times 0.92$, $R = \min(width, height) \times 0.45$).
- **Prominence Solar Rays:** 36 individual prominence rays radiating outward between $-171^\circ$ and $-9^\circ$, modulated by dual-frequency sinusoidal breathing ($Math.sin(t \times 1.5 + i \times 0.6) \times 35$).
- **Rim Brilliance:** White-hot incandescent rim gradient concentrated on the celestial limb ($R \pm 20px$).
- **Coronal Plasma Flares:** 24 floating coronal motes drifting radially into space with alpha dissipation.

---

## 3. Engineering Rigor & Quality Invariants
- **High-DPI Retina Calibration:** Every canvas context sets `canvas.width = Math.floor(width * dpr)`, `canvas.height = Math.floor(height * dpr)`, `ctx.setTransform(1, 0, 0, 1, 0, 0)`, and `ctx.scale(dpr, dpr)` where $dpr = \min(\text{devicePixelRatio}, 2)$. Zero blurriness on Retina/4K displays.
- **Zero Memory Leaks & Tab Freezing:** `visibilitychange` listener immediately cancels `requestAnimationFrame` when the document is hidden, resuming cleanly when visible.
- **Strict Accessibility:** `prefers-reduced-motion` media query renders static, non-animated optical states.
- **Theme Reactivity:** All 28 color palettes in `COLOR_THEMES` cleanly interpolate into all 5 engines via `hexToRgb` tuples (`accent`, `accentB`, `accentC`).

---

## 4. Complete Verification Evidence
- `pnpm vitest run tests/unit/theme-gradients.test.ts`: 8/8 passed (0 errors)
- `pnpm test`: 27/27 test files, 403/403 tests passed (0 errors)
- `pnpm typecheck`: `tsc --noEmit` exited with code 0 (0 errors)
- `pnpm lint`: `next lint` exited with code 0 (0 warnings, 0 errors)
- `pnpm build`: Next.js 15.5.28 production build succeeded in 14.9s with 7/7 static routes optimized
