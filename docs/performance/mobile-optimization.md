# Mobile Web & Responsive Architecture Guide

## 1. Executive Summary & Core Architectural Invariants

Radiance is engineered with a strict **mobile-first, touch-ergonomic, and zero-overflow architectural foundation**. The mobile interface adapts fluidly across device viewports—from compact handhelds (320px, 360px, 375px, 390px, 414px, 430px) to tablets (768px, 1024px) and high-resolution desktops (1440px+).

### Key Architectural Invariants
1. **Zero Horizontal Overflow:** Strict containment with `overflow-x: clip` and `overflow-x: hidden` guarantees that no layout elements bleed outside the viewport at any tested breakpoint (320px–1920px).
2. **WCAG 2.2 AA Touch Ergonomics:** All primary interactive controls, toggle triggers, drawer action items, and bottom navigation targets meet or exceed the **minimum 44x44px touch target requirement** (WCAG 2.5.5 / 2.5.8).
3. **Dynamic Viewport Unit Engineering:** Complete implementation of `dvh` (dynamic viewport height) and `svh` (small viewport height) with strict `vh` fallbacks across styles, accommodating dynamic browser chrome, collapsing address bars, and toolbars.
4. **Hardware Notch & Safe-Area Protection:** Continuous application of CSS `env(safe-area-inset-*)` ensures elements clear hardware camera notches, Dynamic Islands, and iOS home indicator swipe bars.
5. **Mobile Keyboard Viewport Stabilization:** Deployment of Next.js `interactiveWidget: "resizes-content"` and active composer focus coordination prevents keyboard jumping, viewport displacement, and composer occlusion.

---

## 2. Multi-Viewport Responsive Matrix

Every interface surface is continuously verified across the standard device resolution spectrum:

| Breakpoint | Typical Device | Viewport Width | Layout Strategy |
| :--- | :--- | :--- | :--- |
| **Ultra-Compact Mobile** | iPhone SE (1st gen), Jelly 2 | `320px` | Single-column fluid, compact typography `clamp(18px, 5.5vw, 24px)`, scroll-contained controls |
| **Compact Mobile** | Galaxy S8/S9, Xperia Compact | `360px` | Single-column fluid, stacked CTAs, condensed telemetry pills |
| **Standard Mobile** | iPhone X/11/12/13 Mini, Pixel 4 | `375px` | Thumb-friendly bottom dock, drawer navigation, 16px font-size input |
| **Modern Handheld** | iPhone 12/13/14/15/16 Pro | `390px` | Optimized thumb zone, prominent chat composer, full Radix dialog menu |
| **Plus / Max Mobile** | iPhone 8 Plus, iPhone 11 Pro Max | `414px` | Enhanced touch targets, expanded suggestion chip layout |
| **Flagship Handheld** | iPhone 15/16 Pro Max, Pixel 8 Pro | `430px` | Roomy composer with multi-pill model and mode badges |
| **Small Tablet / Foldable** | iPad Mini, Surface Duo | `768px` | Hybrid layout, collapsible sidebar dock, expanded grid cards |
| **Large Tablet / Laptop** | iPad Pro, MacBook Air 11" | `1024px` | Two-column split stage, persistent sidebar dock, desktop navigation bar |
| **Desktop / Widescreen** | MacBook Pro, Studio Display | `1440px+` | Full ambient starfield, split editorial showcase, floating dynamic telemetry |

---

## 3. Dynamic Viewport Unit Engineering (`dvh` / `svh` / `vh`)

### The Mobile Viewport Problem
Traditional CSS `100vh` calculates viewport height based on the maximum screen height, ignoring browser chrome (such as Safari's bottom toolbar or Chrome's collapsing URL bar). This causes bottom-docked elements (e.g., chat composers or bottom navigation bars) to be rendered partially offscreen or clipped beneath browser toolbars.

Conversely, dynamic viewport units introduced in CSS Values and Units Module Level 4 resolve this behavior:
- **`100dvh` (Dynamic Viewport Height):** Automatically resizes as browser chrome expands or collapses during page scrolling.
- **`100svh` (Small Viewport Height):** Represents the smallest possible viewport when browser chrome is fully expanded.
- **`100lvh` (Large Viewport Height):** Represents the largest viewport when chrome is collapsed.

### Radiance Fallback Strategy
Because legacy mobile browsers or older webviews lack support for CSS dynamic viewport units, Radiance employs a cascading dual-declaration strategy:

```css
/* In src/app/globals.css */
:root {
  --viewport-height: 100vh;
  --viewport-height: 100dvh;
  --viewport-height-small: 100vh;
  --viewport-height-small: 100svh;
}

/* Fallback Utility Classes */
.safe-h-screen {
  height: 100vh;
  height: 100dvh;
}

.safe-min-h-screen {
  min-height: 100vh;
  min-height: 100dvh;
}

.safe-h-svh {
  height: 100vh;
  height: 100svh;
}

.safe-min-h-svh {
  min-height: 100vh;
  min-height: 100svh;
}

.h-viewport {
  height: 100vh;
  height: 100dvh;
}

.min-h-viewport {
  min-height: 100vh;
  min-height: 100dvh;
}
```

This pattern is consistently applied to all full-viewport surfaces:
- `body` in `src/app/globals.css`
- `.landing-root` in `src/components/landing/landing.css`
- `.planet-canvas` and `.planet-hero` in `src/components/landing/ascend-planet-landing.css`
- Primary chat shell in `src/features/chat/components/radiance-app.tsx` (`h-screen h-[100dvh]`)
- Mobile sidebar in `src/components/ui/sidebar.tsx` (`safe-h-screen h-[100dvh]`)
- Conversation history drawer in `src/components/navigation/history-drawer.tsx` (`h-screen h-[100dvh]`)

---

## 4. Hardware Safe-Area Inset Handling

Modern handheld displays feature hardware camera cutouts (notches), Dynamic Islands, rounded screen corners, and gesture-based bottom home bars. Unhandled insets cause text, icons, and CTA buttons to collide with hardware boundaries.

### CSS Environment Variable Architecture
Radiance exposes four semantic safe-area CSS custom properties in `globals.css`:
```css
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sar: env(safe-area-inset-right, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
}
```

### Component Safe-Area Integration
1. **Top Header (`src/components/navigation/topbar.tsx`):**
   ```tsx
   pt-[max(0.625rem,env(safe-area-inset-top,0px))]
   pl-[max(0.625rem,env(safe-area-inset-left,0px))]
   pr-[max(0.625rem,env(safe-area-inset-right,0px))]
   ```
   Ensures brand logo, model indicators, and navigation controls sit safely below notches and dynamic islands.
2. **Landing Nav Bar (`src/components/landing/landing.css`):**
   ```css
   .landing-nav {
     padding: calc(12px + var(--sat)) 0 12px;
   }
   ```
3. **Mobile Drawer Panels (`src/components/landing/landing-nav.tsx` & `src/components/ui/sidebar.tsx`):**
   ```tsx
   pt-[calc(16px+var(--sat))] pb-[max(1.5rem,calc(16px+var(--sab)))]
   ```
   Ensures modal close buttons clear top cutouts and bottom action buttons (e.g. CTA buttons) stay elevated above the iOS home swipe bar.
4. **Chat Composer (`src/components/chat/chat-composer.tsx`):**
   ```tsx
   pb-[max(1rem,env(safe-area-inset-bottom,0px))]
   ```
   Maintains a comfortable touch buffer above the bottom edge of the device screen.
5. **Mobile Bottom Nav (`src/components/navigation/mobile-bottom-nav.tsx`):**
   ```tsx
   pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]
   ```

---

## 5. Mobile Virtual Keyboard Stabilization

### Virtual Keyboard Viewport Invariants
On iOS Safari and Android Chrome, the virtual keyboard opening causes two historical failure modes:
1. **Viewport Zooming:** When an input has a font size smaller than 16px, iOS Safari automatically triggers an irreversible viewport zoom-in, clipping horizontal page edges.
2. **Viewport Displacement / Composer Obscuration:** The virtual keyboard pushes or overlays the document without resizing the visual container, hiding the composer textarea or causing jarring jumps.

### Architectural Solutions in Radiance
1. **Viewport Meta Configuration (`src/app/layout.tsx`):**
   ```typescript
   export const viewport: Viewport = {
     width: "device-width",
     initialScale: 1,
     viewportFit: "cover",
     themeColor: "#06060a",
     interactiveWidget: "resizes-content",
   };
   ```
   `interactiveWidget: "resizes-content"` instructs mobile Chromium and modern mobile browsers to resize the layout viewport when the virtual keyboard engages, preventing layout clipping and overlay jumping.
2. **Mobile Typography Scale Guard:**
   The composer textarea applies `text-base sm:text-sm` (16px on mobile viewports, 14px on desktop). Because mobile font size is >=16px, iOS Safari never triggers automatic input zoom.
3. **Dynamic Chrome Demotion During Typing:**
   When the composer textarea receives focus (`onFocusChange(true)`), `MobileBottomNav` is conditionally unmounted (`if (isComposerFocused) return null;`). This grants 100% of the available vertical space above the virtual keyboard to the message stream and composer.
4. **Smooth Scroll Stabilization:**
   On textarea focus, `scrollIntoView({ behavior: "smooth", block: "nearest" })` aligns the active line without jarring vertical leaps.

---

## 6. Touch Ergonomics & WCAG 2.2 AA Compliance

### Minimum 44x44px Target Standard
All interactive elements implement the `.touch-target` design token or explicit Tailwind minimum boundary utilities (`min-w-[44px] min-h-[44px]`):

```css
/* In src/app/globals.css */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
}
```

### Audited Interactive Controls
- **Topbar Hamburger Menu Button:** `min-w-[44px] min-h-[44px] touch-target`
- **Language Switchers (EN / HI):** `min-w-[44px] min-h-[44px] touch-target`
- **Clear Active Conversation Button:** `min-w-[44px] min-h-[44px] touch-target`
- **Mobile Bottom Nav Action Buttons:** `min-w-[44px] min-h-[44px] touch-target`
- **Mobile Bottom Nav Center New Chat Button:** `w-11 h-11 min-w-[44px] min-h-[44px] touch-target`
- **History Drawer Pin & Delete Actions:** `min-w-[44px] min-h-[44px] touch-target`
- **History Drawer Modal Close Button:** `min-w-[44px] min-h-[44px] touch-target`
- **Sidebar Drawer Close Button:** `min-w-[44px] min-h-[44px] touch-target`
- **Message Action Bar Buttons:** `min-w-[44px] min-h-[44px] touch-target`
- **Follow-up Suggestion Chips:** `min-h-[44px] touch-target`
- **Welcome Card Starter Prompts:** `min-h-[44px] touch-target`
- **Hero Product Stage Suggestion Pills:** `min-height: 44px; touch-action: manipulation;`
- **Hero Product Stage Action & Send Buttons:** `min-width: 44px; min-height: 44px; touch-action: manipulation;`
- **Landing Navigation Menu Toggle:** `min-height: 44px; min-width: 44px;`

---

## 7. Mobile Navigation Dialog Semantics & Accessibility

### MobileSidebar Lifecycle & Invariants
`MobileSidebar` (`src/components/ui/sidebar.tsx`) implements strict accessible dialog specifications:
1. **Semantic Role & State:** Configured with `role="dialog"`, `aria-modal="true"`, and `aria-label="Mobile navigation drawer"`.
2. **Escape Dismissal:** Listens for `Escape` keyboard events on `window` and triggers `setOpen(false)`.
3. **Background Body Scroll Lock:** Upon opening, preserves `document.body.style.overflow` and sets it to `"hidden"`. Upon closing or unmounting, restores the original overflow value, preventing accidental underlying page scrolling.
4. **Accessible Focus Trap:** Automatically cycles keyboard focus between the first and last focusable elements via `Tab` and `Shift+Tab`.
5. **Initial Focus Management:** Sets focus to the close button (`IconX`) upon drawer entrance.

### Landing Navigation Dialog
`LandingNav` (`src/components/landing/landing-nav.tsx`) leverages `@radix-ui/react-dialog`:
- Radix Portal renders content in a detached DOM container to avoid z-index and clipping bugs.
- Auto-focuses on modal open and restores focus to the menu trigger button on exit.
- Smooth entrance animation via `--motion-ease-standard` with safe-area padding at both top and bottom edges.

---

## 8. Automated Verification Suite

The mobile and responsive architecture is verified by both unit and end-to-end test suites:

```bash
# Unit & Integration Tests (Vitest)
pnpm vitest run tests/unit/mobile-cross-browser.test.tsx tests/unit/navigation-drawers.test.tsx tests/unit/chat-composer.test.tsx

# End-to-End Responsive Multi-Viewport Suite (Playwright)
pnpm playwright test tests/e2e/chat.spec.ts tests/e2e/landing.spec.ts
```

### Verified Test Cases
1. `tests/unit/mobile-cross-browser.test.tsx`:
   - Viewport configuration with `viewportFit: "cover"`, `width: "device-width"`, and `interactiveWidget: "resizes-content"`.
   - Topbar hamburger toggle button with `>=44x44px` touch target.
   - Topbar language toggles and clear button with finger-friendly touch targets.
   - Composer bottom bar with safe-area bottom inset padding.
   - Textarea 16px (`text-base`) mobile sizing to prevent iOS auto-zoom.
   - Model trigger button mobile-first truncation (`max-w-[70px]`) preventing horizontal overflow.
   - AtmosphereCanvasEngine passive touch listeners for mobile performance.
   - Follow-up chips and welcome card prompt touch targets (`min-h-[44px]`).
   - MobileBottomNav center new chat button `>=44x44px`.
   - HistoryDrawer conversation action buttons `>=44x44px`.
   - ChatComposer `onFocusChange` keyboard coordination callback.
   - Global CSS `dvh`/`svh` and safe-area utility classes.
2. `tests/unit/navigation-drawers.test.tsx`:
   - MobileSidebar dialog attributes (`role="dialog"`, `aria-modal="true"`).
   - MobileSidebar body scroll locking and clean restoration.
   - MobileSidebar keyboard Escape dismissal.
   - MobileSidebar close button touch target `>=44x44px`.
3. `tests/e2e/chat.spec.ts`:
   - 390px and 320px workspace zero horizontal overflow verification (`scrollWidth <= clientWidth`).
4. `tests/e2e/landing.spec.ts`:
   - Multi-viewport zero horizontal overflow sweep across 320px, 360px, 375px, 390px, 414px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
   - Mobile menu entrance, section navigation, and closing behavior.
