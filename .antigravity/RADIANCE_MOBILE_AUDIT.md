# RADIANCE MOBILE-FIRST EXPERIENCE AUDIT (PHASE ZERO)

**Document ID:** RADIANCE-AUDIT-MOBILE-001  
**Project:** RADIANCE — AI Productivity Platform  
**Target:** Mobile & Tablet Experience Transformation (Smartphones, Tablets, Touch Devices)  
**Author:** Multidisciplinary Mobile Engineering & UX Architecture Team  
**Date:** November 2026  
**Status:** COMPLETE & BASELINED  

---

## 1. Executive Summary & Vision

Radiance is a premium AI workspace distinguished by deep dark surfaces, violet/indigo atmospheric lighting, refined serif headings (`Cormorant Garamond`), and modern sans-serif typography (`Plus Jakarta Sans`). While the desktop interface delivers high aesthetic craft and rich functionality (multi-model switching, streaming SSE, markdown rendering, syntax highlighting, LaTeX equations, conversation history, personalization), the mobile experience currently exhibits several critical responsive compromises:

1. **Desktop-First Navigation Paradigm:** The navigation relies either on a desktop topbar hamburger that triggers a left slide-over drawer or desktop-sized right-hand drawers, requiring high thumb reach to the top edges of large modern phones (e.g., iPhone 16 Pro Max, Pixel 9 Pro).
2. **Hero Overcrowding & Excessive Vertical Scrolling:** The welcome screen stacks 3 category columns containing 9 large prompt cards vertically on mobile (~600px of card height alone), completely submerging the input composer below the initial viewport fold.
3. **Cramped Composer Control Row:** The bottom composer forces 5 distinct interactive pills (Add files, Mode selector, Model selector, Voice recorder, Send button) into a single horizontal row. On viewports <= 375px, this causes severe button crowding, truncated labels, and risk of horizontal displacement.
4. **Desktop Dropdowns Floating Out of Bounds:** The model selector and build mode selector open as floating popovers positioned above the trigger (`bottom-full`). On short mobile viewports or when virtual keyboards engage, these popovers can clip off-screen or obscure the active input area.
5. **Three.js Particle Density & Battery Impact:** The ambient Three.js canvas in `ambient-canvas.tsx` initializes 2,200 particles with icosahedron deformation shaders and does not pause when hidden (`document.hidden`), needlessly draining battery and GPU cycles on mobile devices.
6. **Lack of Thumb-Zone Mobile Bottom Navigation:** Users have no immediate one-tap way to switch between Chat, History, and Settings from the lower thumb comfort zone.

---

## 2. Component Inventory & Audit Matrix

| Component | File Path | Current Mobile Implementation | Deficiencies & Edge Cases Identified |
|:---|:---|:---|:---|
| **Root Shell** | `src/app/page.tsx` | Fixed `h-[100dvh] w-full overflow-hidden` | Good dynamic viewport unit baseline (`100dvh`), but lacks unified mobile bottom navigation coordination with the composer. |
| **Topbar** | `src/components/navigation/topbar.tsx` | Sticky top with hamburger, mini logo, EN/HI toggle, clear chat | Functional, but high reachability burden for primary actions. Missing quick workspace title and model chip. |
| **Mobile Drawer** | `src/components/ui/sidebar.tsx` | `MobileSidebar` (slide-out from left, 280px width) | Slide-out requires reaching the top hamburger; lacks swipe-to-dismiss gesture and active state indication. |
| **Welcome Hero** | `src/components/chat/welcome-card.tsx` | Single-column stack on mobile with 3 categories and 9 prompt cards | Creates massive vertical overflow (> 650px) pushing the composer off the screen. Lack of horizontal category tab scrolling. |
| **Chat Workspace** | `src/features/chat/components/chat-workspace.tsx` | Scrollable message container with auto-scroll ref | Good message container, but needs safe-area padding at the bottom so last message isn't hidden under floating composer. |
| **Composer** | `src/components/chat/chat-composer.tsx` | Sticky bottom card with multiline textarea and control row | Crowded control bar on < 380px. Model & Mode selectors use absolute popovers instead of native-feeling mobile bottom sheets. |
| **Message Item** | `src/components/chat/message-item.tsx` | User bubble (85%) & AI bubble (100%) with 3-dots dropdown | 3-dots dropdown is functional, but lacks speech read-aloud option on mobile. Text size and code blocks need touch-optimized padding. |
| **Code Blocks** | `src/app/globals.css` (`.code-block-wrapper`) | Horizontal scroll with header buttons | Small touch targets on header action buttons on mobile (copy, download, collapse). |
| **Tables** | `src/lib/utils/format.ts` (`.table-wrapper`) | Horizontally scrolling container | Good scroll isolation, but table headers and cells need optimal minimum touch paddings. |
| **History Drawer** | `src/components/navigation/history-drawer.tsx` | Radix Dialog sliding from right (w-80, 88vw) | Reaching search bar and close button requires top reach. Could support bottom sheet transition on phones. |
| **Settings Drawer**| `src/components/navigation/settings-drawer.tsx` | Radix Dialog sliding from right (w-[480px]) | Wide drawer on tablets, but on phones fills 95vw. Dense grid of color palettes and atmosphere engines needs mobile-tuned spacing. |
| **Three.js Canvas**| `src/components/background/ambient-canvas.tsx` | WebGL 2,200 particles + 4 icosahedrons | High GPU burden for mobile batteries. No pause on tab hidden. No DPR cap on high-density mobile screens (e.g. 3x DPR). |

---

## 3. Detailed Audit of the 20 Core Mobile Problems

### 1. Horizontal Viewport Overflow
- **Finding:** Currently `390px` has `overflow-hidden` on body, but on narrower screens (`320px`), long URLs in messages or crowded composer rows can generate micro-overflow.
- **Remediation:** Strict `max-w-full`, `overflow-x-hidden` on shell containers, `break-words` and `min-w-0` on all flex child elements.

### 2. Desktop Sidebar Mobile Behavior
- **Finding:** Desktop sidebar collapses to 68px, while mobile uses a hamburger opening a 280px left drawer. While functional, closing requires tapping a small `x` in the top right or the backdrop.
- **Remediation:** Add bottom navigation shortcuts for instant access, touch-friendly dismiss buttons, and body scroll lock guarantees.

### 3. Compressed Topbar Controls
- **Finding:** Language switcher (EN/HI) and Clear Chat button are grouped on the right. While they have `min-h-[44px]`, having only a hamburger on the left leaves middle space empty while bottom screen space is unassisted.
- **Remediation:** Keep topbar sleek and focused (hamburger, centered brand symbol, clear chat / session indicator), while shifting destination navigation to the thumb reach zone.

### 4. Unusable Dropdown & Popover Positioning
- **Finding:** The Model Selector popover in `chat-composer.tsx` is positioned `bottom-full mb-2 -left-16 sm:left-0 w-72 sm:w-80`. On mobile phones with keyboard open or short height (e.g. landscape or older devices), the popover extends beyond screen boundaries.
- **Remediation:** Transform model selector and build mode selector on mobile viewports (`< 768px`) into smooth, accessible **Bottom Sheets** anchored to the bottom with rounded top corners, clear dismiss bars, and scrollable option lists.

### 5. Composer Obstruction & Floating Island Spacing
- **Finding:** The composer sits at the bottom of `ChatWorkspace` with `p-2 sm:p-4`. When lots of content is present, the message list scroll area does not have sufficient bottom clearance (`pb-28 sm:pb-32`), causing the last message or follow-up chips to be clipped beneath the composer.
- **Remediation:** Ensure dynamic bottom padding on the message scroll container matching the composer's measured height, plus safe-area insets (`env(safe-area-inset-bottom)`).

### 6. Keyboard-Related Layout Shifts & Viewport Jumps
- **Finding:** On mobile Safari and Android Chrome, the virtual keyboard triggers dynamic viewport resizing. Relying on `100vh` causes severe layout jumps and broken fixed positioning.
- **Remediation:** Enforce `100dvh` and dynamic viewport tracking with safe fallbacks. Avoid `scrollIntoView` jumps that shake the viewport.

### 7. Excessive Page Scrolling on Welcome Screen
- **Finding:** On a 390x844px phone screen, the hero title + 3 category columns containing 9 suggestions require ~650px of vertical scrolling before the user can even reach the composer.
- **Remediation:** Re-architect the mobile welcome experience:
  - Compact hero with condensed typography.
  - Horizontally scrollable category selector tabs ("Understand", "Create", "Explore", etc.) that show only the active category's prompts or a curated compact prompt carousel.
  - Keep initial viewport height compact so the composer is immediately visible without scrolling.

### 8. Incorrect Scroll Anchoring
- **Finding:** In `ChatWorkspace`, auto-scrolling is triggered on every token: `chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight`. When a user touches or scrolls up during generation to read previous messages, auto-scroll forcefully yanks them back down.
- **Remediation:** Implement intelligent scroll anchoring: detect if user has manually scrolled away from the bottom (e.g. `scrollHeight - scrollTop - clientHeight > 80px`). If user is reading previous text, don't forcefully yank them down; provide an intuitive "Scroll to bottom" pill.

### 9. Touch Target Ergonomics (< 44x44px)
- **Finding:** Some secondary controls (e.g. code block copy/download buttons in `globals.css` at `max-width: 480px` have `padding: 3px 6px; font-size: 9.5px`) have physical tap areas below the WCAG 2.5.5 minimum of 44x44 CSS pixels.
- **Remediation:** Apply pseudo-element hit-area expansion (`::after` with `min-w-[44px] min-h-[44px]`) or native 44px min-dimensions to all tappable controls.

### 10. Hover-Dependent Functionality
- **Finding:** On desktop, message action buttons (copy, edit, regenerate, speech, feedback, delete) appear on `:hover` (`hidden sm:flex group-hover:opacity-100`). While mobile has a 3-dots dropdown menu, it was missing the "Read Aloud" speech synthesis action, and the 3-dots trigger button is easy to miss.
- **Remediation:** Ensure all actions are 100% accessible via the mobile 3-dots action sheet, including Read Aloud, Thumbs Up/Down, Edit, Copy, Regenerate, Export Markdown, and Delete.

### 11. Excessive Animations on Lower-Powered Mobile SoCs
- **Finding:** Pulsing gradients, 4 glowing icosahedrons, and ambient particle animations run continuously on the main thread and GPU, leading to frame drops on mobile devices during fast typing.
- **Remediation:** Restrain non-essential CSS animations on mobile, optimize spring physics configs, and respect `prefers-reduced-motion` with instant 1ms transitions.

### 12. Heavy WebGL Background Rendering
- **Finding:** `AmbientCanvas` spawns 2,200 particles with 64x64 canvas textures, custom vertex/fragment shaders, and runs an unthrottled `requestAnimationFrame` loop even when the app is in the background.
- **Remediation:**
  - Cap mobile particle count to 600.
  - Lower icosahedron geometry detail on mobile (`subdivisions: 2` instead of `4`).
  - Cap device pixel ratio at `1.5` on mobile screens to save GPU fill rate.
  - Pause RAF loop immediately on `document.visibilitychange` when `document.hidden === true`.

### 13. Bundle & JavaScript Chunk Splitting
- **Finding:** Uncompressed dev chunks exceeded budgets; verified production build creates 712 kB gzip for `/page`, 182 kB gzip for `/layout`, well within production budgets, but client components must stay split and tree-shaken.
- **Remediation:** Maintain clean component boundaries, avoid importing unnecessary server packages into client files, dynamic import heavy dialogs where beneficial.

### 14. Unnecessary Component Rerendering
- **Finding:** In `page.tsx`, state changes in `streamingContent` re-evaluate the entire workspace tree.
- **Remediation:** Keep message list and composer memoized or isolate streaming cursor updates to eliminate re-renders of the topbar, sidebar, and background engines.

### 15. Typography & Font Loading on Variable Networks
- **Finding:** Cormorant Garamond is loaded via `next/font/google` with `display: "swap"`, which prevents blocking, but font sizing on mobile needs modular scaling (`clamp(1.5rem, 5vw, 2.5rem)`).
- **Remediation:** Use fluid clamp typography for hero headings and mobile-calibrated line heights (1.4–1.6) to prevent awkward word wrapping.

### 16. Image & Attachment Upload Ergonomics
- **Finding:** In `chat-composer.tsx`, clicking `+` immediately opens the system file picker directly. On mobile, users often want a dedicated bottom sheet presenting clear options: "Photos & Media", "Documents / PDF", "Camera", or clipboard paste.
- **Remediation:** Implement an accessible mobile attachment action sheet when `+` is tapped on mobile viewports.

### 17. Unresponsive Dialogs on Small Viewports
- **Finding:** `SettingsDrawer` has `w-[480px] max-w-[95vw]` which on a 320px phone viewport leaves only 8px margins on each side, squeezing the 2-column theme cards.
- **Remediation:** Optimize drawer padding and card grids for narrow viewports (`grid-cols-1` on < 380px, `grid-cols-2` on >= 380px).

### 18. Safe Area Handling (iOS Home Indicator & Android Gestures)
- **Finding:** While `--sab: env(safe-area-inset-bottom)` is defined in `globals.css`, several containers use standard `pb-4` or `p-2` without adding `env(safe-area-inset-bottom)`.
- **Remediation:** Standardize `.pb-safe` and explicit `max(0.75rem, env(safe-area-inset-bottom))` across mobile topbar, bottom navigation, bottom sheets, and the composer.

### 19. Landscape Orientation Behavior
- **Finding:** In mobile landscape (e.g. 844x390px), vertical height is extremely limited (390px). A fixed 140px composer plus topbar leaves almost no space for conversation messages.
- **Remediation:** In landscape orientation (`@media (max-height: 500px)`), compact the topbar to 38px, reduce composer textarea max-height, and streamline suggestion rows.

### 20. Mobile Accessibility (WCAG 2.1 AA Compliance)
- **Finding:** Screen-reader users on VoiceOver (iOS) and TalkBack (Android) need clear live-region announcements that don't overwhelm with every streaming token.
- **Remediation:** Keep `aria-live="polite"` on status containers; only announce completion or critical errors; ensure all bottom sheets have `role="dialog"`, accessible labels, and focus traps.

---

## 4. Remediation Plan & Execution Sequence

1. **Phase 1 — Mobile Architecture & Design System Tokens:** Create responsive tokens (`--bottom-nav-h`, safe areas, touch targets, mobile typography).
2. **Phase 2 — Mobile Application Shell & Thumb-Zone Navigation:** Build mobile topbar, thumb-friendly bottom navigation bar, and accessible bottom-sheet primitives.
3. **Phase 3 — Mobile Welcome Experience:** Recompose hero into a clean, compact greeting with a horizontally scrollable category pill selector and responsive prompt cards.
4. **Phase 4 — Mobile Conversation & Content Polish:** Enhance message reading width, table touch scrolling, code block touch controls, KaTeX responsive wrapping, and complete mobile action menus with speech read-aloud.
5. **Phase 5 — Mobile Unified AI Composer:** Refactor composer with 100dvh safe-area anchoring, bottom-sheet model and mode selection, responsive control wrapping, and attachment bottom sheet.
6. **Phase 6 — History & Personalization Drawers:** Refine drawer responsiveness for phones (320px–430px) and tablets.
7. **Phase 7 — Performance Optimization:** Three.js mobile particle throttle, DPR cap, background pause on `visibilitychange`, CSS GPU compositing.
8. **Phase 8 & 9 — Automated E2E Testing & Verification:** Comprehensive mobile Playwright test suite across viewports and regression verification.
