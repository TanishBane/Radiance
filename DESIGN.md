---
name: Radiance
description: A dark-violet AI workspace with editorial serif headings and explicit user control.
colors:
  violet-primary: "#7c5cff"
  violet-lilac: "#bfa7ff"
  violet-orchid: "#e27aff"
  void: "#06050a"
  deep-violet: "#0c0b14"
  raised-surface: "rgba(16, 14, 24, 0.88)"
  hairline: "rgba(255, 255, 255, 0.09)"
  warm-ink: "#f3f1ec"
  muted-ink: "rgba(243, 241, 236, 0.72)"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontWeight: 500
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  label:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 600
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "22px"
components:
  button-primary:
    backgroundColor: "{colors.warm-ink}"
    textColor: "{colors.void}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.white}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.warm-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "0 18px"
    height: "44px"
  input-search:
    backgroundColor: "rgba(255, 255, 255, 0.035)"
    textColor: "{colors.warm-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "0 12px"
    height: "44px"
  surface-glass:
    backgroundColor: "{colors.raised-surface}"
    textColor: "{colors.warm-ink}"
    rounded: "{rounded.md}"
---

# Design System: Radiance

## Overview

**Creative North Star: “Radiance’s dark-violet workspace”**

Radiance uses a near-black violet canvas, a restrained violet accent range, and warm-white text. Editorial serif headings distinguish moments of emphasis from the Plus Jakarta Sans interface copy; JetBrains Mono is reserved for code and technical labels. The established identity comes from this pairing and its contrast, not from any one page arrangement.

Surfaces use quiet tonal differences, fine borders, and selective blur or shadow to establish depth. Controls retain familiar shapes and states, with visible focus and short transitions. Page structure belongs to the surface: the homepage’s annotated-reader composition is recorded in its surface brief and is not a global layout rule.

**Key Characteristics:**
- Dark violet ground with warm-white foreground text.
- Cormorant Garamond display voice, Plus Jakarta Sans interface copy, and JetBrains Mono technical labels.
- Violet accent is reserved for emphasis, selected states, links, and focus.
- Layered surfaces and fine borders provide depth without displacing content.

## Colors

The palette pairs a saturated violet accent with near-black violet surfaces and warm, slightly softened text.

### Primary
- **Radiance Violet** (`{colors.violet-primary}`): Primary emphasis for focus, links, selected states, and small brand marks.

### Secondary
- **Soft Lilac** (`{colors.violet-lilac}`): Lighter accent for highlighted text and restrained brand gradients.

### Tertiary
- **Orchid** (`{colors.violet-orchid}`): A limited highlight at the light end of the existing brand gradient.

### Neutral
- **Void** (`{colors.void}`): Main app and homepage background.
- **Deep Violet** (`{colors.deep-violet}`): Secondary dark surface behind the main canvas.
- **Raised Violet Surface** (`{colors.raised-surface}`): Translucent raised panels and overlays.
- **Quiet Hairline** (`{colors.hairline}`): Low-contrast separators and default outlines.
- **Warm White** (`{colors.warm-ink}`): Main foreground text and the filled homepage action surface.
- **Muted Warm White** (`{colors.muted-ink}`): Supporting copy and secondary navigation.
- **White** (`{colors.white}`): Hover fill for the filled homepage action.

## Typography

**Display Font:** Cormorant Garamond (with Georgia, serif fallback; loaded through `next/font/google` as `--font-serif`)
**Body Font:** Plus Jakarta Sans (with system sans-serif fallbacks; `--font-sans`)
**Label/Mono Font:** JetBrains Mono (with system monospace fallbacks; `--font-mono`)

**Character:** The display serif gives prominent headings an editorial voice. The sans-serif keeps interface copy direct, while the mono face marks code and technical details.

### Hierarchy
- **Display** (weight 500): Serif emphasis for prominent page headings and selected answer text.
- **Headline** (weight 500): Serif section headings; use the local surface scale rather than imposing one global size.
- **Body** (weight 400, 1rem): Default sans-serif interface copy.
- **Label** (weight 600, 0.6875rem, 0.06em): Compact uppercase technical labels and code-block language markers.

### Named Rules
**The Two-Voice Rule.** Use the editorial serif for display emphasis and the sans-serif for interface reading; keep mono to technical content and labels.

## Layout

The global stylesheet does not define a universal page grid or spacing scale. Layout is owned by each route and feature. Preserve the root app’s safe-area helpers, usable touch targets of at least 44px, and its existing responsive behavior. The homepage’s shell widths, folio grid, and section rhythm remain local to the homepage stylesheet.

## Elevation & Depth

Radiance uses both tonal layering and restrained shadows. Glass surfaces use translucent dark fills, a fine light border, blur, and a subtle inset highlight; raised overlays use a broader, darker shadow. Keep elevation tied to actual grouping or overlay behavior.

### Shadow Vocabulary
- **Glass panel** (`0 4px 20px -2px rgba(0, 0, 0, 0.45), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)`): Standard glass surfaces.
- **Raised glass panel** (`0 16px 40px -8px rgba(0, 0, 0, 0.65), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`): Overlays and elevated content.
- **Modal** (`0 20px 50px -10px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)`): Modal layering.
- **Tooltip** (`0 8px 24px rgba(0, 0, 0, 0.5)`): Compact floating labels.

## Shapes

Controls and panels use rounded corners at a small set of established radii. Thin borders distinguish fields and quiet actions; larger panels keep their shape within the same restrained family. Use square or hairline-led geometry only where the owning surface already establishes it.

## Components

### Buttons
- **Shape:** Gently rounded corners (`{rounded.sm}`).
- **Primary:** The homepage’s filled chat action uses warm-white fill and void text, with a 44px minimum height and 18px horizontal padding.
- **Hover / Focus:** The filled action brightens to white; actions shift by 1px on press. Focus is a visible 2px violet outline with a 2px offset (4px on the homepage).
- **Ghost:** Transparent fill, warm-white text, and a fine border; hover adds a quiet surface fill and strengthens the border.

### Inputs / Fields
- **Style:** Dark translucent fill, fine border, established rounded shape, and 12px horizontal padding; fields in Personal Intelligence have a 44px minimum height.
- **Focus:** A visible 2px violet ring on fields that define their own focus treatment; other controls inherit the global 2px violet outline.
- **Placeholder:** Muted foreground text.

### Navigation
- **Style:** Sans-serif links use muted foreground at rest and main foreground on hover. The homepage switches to a dialog menu on narrower widths; preserve its labeled trigger and native keyboard behavior.

### Cards / Containers
- **Corner Style:** Medium rounded corners (`{rounded.md}`) for the global glass panel.
- **Background:** Translucent raised violet surface with a fine border.
- **Shadow Strategy:** Use the glass-panel shadow from Elevation & Depth; reserve the raised variant for overlays.
- **Internal Padding:** Let the containing feature set the panel’s padding.

### Feedback
- **Focus:** A 2px violet outline with 2px offset is the global keyboard-focus treatment.
- **Motion:** Default state transitions are short (150–200ms); entrance transitions remain brief (280ms). Honor reduced-motion preferences.

## Do's and Don'ts

### Do:
- **Do** use the established dark-violet surfaces and warm-white text roles.
- **Do** keep display headings serif, interface copy sans-serif, and code or technical markers monospace.
- **Do** use violet for focus and concise emphasis, not as a replacement for readable body text.
- **Do** retain visible keyboard focus, touch targets, and reduced-motion behavior.
- **Do** let each route define its own composition while reusing Radiance’s identity and interaction patterns.

### Don't:
- **Don't** treat the homepage’s annotated folio, margin, or composition as a global layout requirement.
- **Don't** use serif body copy for dense interface controls or mono for ordinary reading.
- **Don't** remove the global focus treatment or make state changes depend on motion.
- **Don't** imply unimplemented product capabilities through visual labels or component examples.
