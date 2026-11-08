# Changelog

All notable changes to the **RADIANCE** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-08

### Added
- **Multi-Provider AI Orchestration:** Frontier model routing across Groq (Llama 3.3 70B, Llama 3.1 8B), Google Gemini (2.5 Flash, 1.5 Pro), and OpenRouter reasoning models via Vercel AI SDK.
- **Real-Time Streaming Engine:** Server-Sent Events (SSE) streaming pipeline with persistent cross-chunk line buffer, token deduplication, and partial token retention upon user abort.
- **Advanced Markdown & Mathematics Engine:** Full CommonMark and GitHub Flavored Markdown support with syntax highlighting, tokenized code block controls (copy, download, collapse), inline `$math$` and display `$$math$$` LaTeX formulas powered by KaTeX.
- **Responsive GFM Tables:** Auto-wrapping container (`overflow-x-auto`) with alternating row tints, styled header cells, and responsive minimum column widths.
- **Dynamic Theming System:** 16 OKLCH color palettes with automated visitor rotation, persistent manual theme selection, and customizable atmosphere engine styles (Waves, Nebula, Radiant).
- **Procedural Spatial Computing:** Atmospheric background engine combining Three.js 3D celestial particle field and procedural shader deformation with adaptive mobile DPR and particle throttle.
- **Mobile-First Touch Ergonomics:** Dedicated thumb-zone mobile bottom navigation bar, mobile-optimized topbar with session badges, and horizontally scrollable category tabs.
- **Enterprise Observability:** Comprehensive error monitoring via Sentry (`@sentry/nextjs`), performance monitoring via Vercel Speed Insights, and dedicated health probes (`/api/health`, `/api/health/ready`).
- **Defensive Security & Rate Limiting:** Sliding-window token bucket rate limiting via Upstash Redis, Content Security Policy (CSP), strict input sanitization, and dependency scanning.
- **Community Health & Repository Governance:** Added MIT `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `SUPPORT.md`, pull request template, and structured GitHub issue forms.
- **SEO & Discoverability Infrastructure:** Dynamic XML sitemap generator (`src/app/sitemap.ts`), robots generator (`src/app/robots.ts`), Schema.org JSON-LD structured data, and high-resolution OpenGraph/Twitter social cards.

### Changed
- Standardized UI typography scale to fluid Cormorant Garamond display headings and Plus Jakarta Sans body font.
- Pinned bottom composer to dynamic viewport units (`100dvh`) with safe-area insets (`env(safe-area-inset-bottom)`).
- Recomposed mobile welcome screen from a vertical card barrier into an interactive category pill browser.

### Fixed
- Fixed unclosed code fence layout breaks during rapid streaming updates with an auto-closing token parser.
- Prevented cross-session token contamination when switching active conversations during an active inference stream.
- Resolved mobile horizontal page clipping by enforcing strict overflow boundaries on all text and table wrappers.

### Security
- Automated dependency vulnerability scanning integrated via Dependabot, GitHub CodeQL, Dependency Review, and Gitleaks secret scanning.
