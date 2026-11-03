# Radiance UI audit

Date: 2026-11-04
Scope: Current `feature/radiance-platform-transformation` checkout and local app.

## Product path and design constraints

The primary journey is: open the workspace, choose a prompt or enter a request, select a model when needed, receive a streamed answer, and continue through follow-up or conversation history. Preserve the existing **refined atmospheric editorial workspace**: near-black surfaces, violet illumination, serif display heading, compact navigation, and floating composer. The logo, palette, typography, and product structure are the recognition anchors.

Keep the interaction hierarchy direct: sending is immediate; motion confirms state or maintains spatial continuity. Use opacity and small transforms, with no decorative delay or character-by-character output. Keep the composer visible and the Cognitive Insight within the scrollable welcome content.

## Repository and component inventory

- Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4. `motion` and Three.js are already installed; no dependency change is needed for this pass.
- `src/app/page.tsx` owns workspace/session state and wires the shell, chat, history, settings, and shortcuts.
- `src/components/navigation/`: topbar, sidebar dock, history drawer, settings drawer.
- `src/components/chat/`: welcome card, composer, message item, and follow-up chips. `src/features/chat/components/chat-workspace.tsx` owns the message list, stream state, error card, and composer placement.
- `src/components/background/`: ambient WebGL and Canvas atmosphere effects, plus CSS/background layers.
- `src/app/globals.css` holds dark violet, surface, border, semantic status, radius, and layout variables plus markdown, code, math, and touch-target styles.
- Tests exist under `tests/unit/` and `tests/e2e/`; E2E covers initial load, composer entry, shortcuts, and history navigation.

## Existing interaction and motion inventory

- Motion for React is already used in the intro splash, desktop/mobile sidebar, and sidebar labels.
- The model menu and history/settings/shortcut overlays previously used separate `animate-in` classes. The model menu now uses the shared Motion presets; the history/settings/shortcut surfaces now use Radix Dialog for modal focus, Escape/outside dismissal, and shared CSS entrance/exit motion.
- Welcome and message action states had several independent CSS timings. The welcome's Cognitive Insight is in normal scroll flow; the composer is a separate fixed-height bottom region.
- Chat stream lifecycle, abort, markdown rendering, KaTeX, code highlighting, message actions, and attachment input are already implemented. Preserve these existing functions.
- Three.js and Canvas engines already cancel frame loops on unmount and pause on page visibility. `AtmosphereCanvasEngine` draws a static state for reduced motion. `AmbientCanvas` scales animation to 15% under reduced motion and pauses on document visibility; it does not currently handle WebGL context restoration.

## Observations and review risks

- Initial screenshots at 1366 × 900 and 390 × 844 exposed clipped desktop category labels and compressed mobile category labels/topbar controls. The row was widened/repacked for desktop and made non-wrapping/scrollable on mobile; the mobile logo is now an accessible icon button and the clear-chat action remains visible.
- Post-change Playwright checks verify category labels fit their button at 390 px, all desktop categories fit within the row at 1366 px, the mobile home and clear-chat controls remain visible, and the document has no horizontal overflow at 390 px.
- A local browser view at 714 × 668 showed the established welcome hierarchy, prompt categories, insight, topbar, and composer. This observation does not replace the full target-width matrix.
- Dialog focus, Escape close, model choice, and desktop/mobile drawer entry have browser coverage. Full screen-reader, focus restoration across every entry point, contrast, and browser accessibility audits remain unverified.
- Ambient WebGL uses a device-pixel-ratio cap of 2 and 2,200 particles. No frame-rate, GPU, bundle, or long-history profiling has been collected.
- No conversation send was exercised against a configured provider; that could incur external API usage. Streaming correctness has unit coverage, while provider-backed browser behavior remains unverified.

## Prioritized work order

1. Establish shared motion timing and reduced-motion behavior; apply to entry, messages, navigation, model menu, and dialog surfaces. (Implemented in this pass.)
2. Verify keyboard and touch operation for the shell, dialogs, menus, and composer at desktop/mobile widths. (Core paths covered by browser tests; broader assistive technology checks remain.)
3. Review overflow, fixed composer clearance, and long content at 390, 430, 768, 1024, 1366, and 1920 CSS pixels.
4. Inspect Three.js context recovery and lower-power behavior; profile before changing particle/render settings.
5. Expand browser coverage for menu, drawer, theme, prompt, message, and responsive states; retain mocked or local streaming to avoid unplanned provider use.
