# Radiance motion system

## Direction

Refined atmospheric editorial motion. Keep the violet identity and content hierarchy intact. A transition should explain a state change, reveal content, or preserve spatial continuity. Use opacity and small translations/scales; send and stop actions remain immediate.

## Shared presets

`src/lib/motion/presets.ts` defines shared durations:

| Preset | Duration | Use |
| --- | ---: | --- |
| feedback | 150 ms | quick visual confirmation |
| interaction | 200 ms | menus and selected-state changes |
| entrance | 280 ms | welcome and new-message entrance |
| drawer | 240 ms | sidebar width/position transition |

Standard easing is `[0.2, 0.8, 0.2, 1]`; entrance easing is `[0.16, 1, 0.3, 1]`. `getMotionTransition` returns a zero-duration transition when reduced motion is requested. CSS duration tokens live beside the existing design tokens in `src/app/globals.css`; a reduced-motion media query reduces CSS animation and transition timing.

## Current application

- Welcome workspace: 12 px upward fade, once on mount.
- New message: 8 px upward fade; no per-character text animation.
- Desktop sidebar: 64 px ↔ 260 px width transition using the shared drawer preset.
- Mobile sidebar: overlay fade and slide, with reduced-motion aware timing.
- Model menu: short fade/scale entrance and exit; selected model label crossfades.
- History, personalization, and shortcut dialogs: Radix Dialog provides focus management and dismissal; shared CSS keyframes fade the overlay and slide/scale the panel on open and close.
- Mobile topbar: compact icon mark and truncated single-line model label keep language and clear-chat controls visible. Prompt-category tabs remain non-wrapping and horizontally scrollable on narrow screens; the desktop row keeps every tab inside its visible bounds.
- Other simple color/hover feedback stays CSS based.
- Three.js and Canvas effects remain owned by their existing background components.

## Accessibility and performance

Use Motion's `useReducedMotion` for coordinated Motion transitions and the CSS media query for CSS effects. Keep animation on opacity/transform except the sidebar width, whose geometry must change to express expansion. Avoid adding timers, per-frame React updates, or stagger to message text. Verify interrupted/open/closed states and reduced motion in a real browser before claiming full coverage.

## Follow-up

Theme color interpolation, context restoration in `AmbientCanvas`, reduced-motion browser preference checks, and full target-width/device profiling are still outstanding.
