# Contributing to Radiance

Thank you for your interest in contributing to **Radiance**! We welcome contributions that help us build a high-precision, beautifully crafted AI workspace engineered for multi-model reasoning, spatial computing, and user-controlled intelligence.

Please take a moment to review this guide before submitting issues or pull requests.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Setup](#local-setup)
- [Architectural & Design Invariants](#architectural--design-invariants)
  - [Component & Feature Boundaries](#component--feature-boundaries)
  - [Design System & Visual Identity](#design-system--visual-identity)
  - [Accessibility & Motion Standards](#accessibility--motion-standards)
- [Development Workflow](#development-workflow)
  - [Branching Conventions](#branching-conventions)
  - [Commit Message Format](#commit-message-format)
- [Quality Gates & Verification Discipline](#quality-gates--verification-discipline)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Reporting Issues & Feature Requests](#reporting-issues--feature-requests)

---

## Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any violations or unacceptable behavior privately to [@TanishBane](https://github.com/TanishBane) via the [Radiance Security Portal](https://github.com/TanishBane/Radiance/security/advisories/new).

---

## Getting Started

### Prerequisites

Ensure you have the following installed locally:

- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **pnpm:** `v9.x` or `v10.x` (`npm install -g pnpm`)
- **Git:** `v2.30+`

### Local Setup

1. **Fork the Repository:**  
   Fork [https://github.com/TanishBane/Radiance](https://github.com/TanishBane/Radiance) to your GitHub account.

2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/<your-username>/Radiance.git
   cd Radiance
   ```

3. **Install Dependencies:**  
   Install packages using the frozen lockfile to ensure identical dependency versions:
   ```bash
   pnpm install --frozen-lockfile
   ```

4. **Configure Environment Variables:**  
   Copy the example environment template:
   ```bash
   cp .env.example .env.local
   ```
   Configure at least one AI provider API key for local inference (`GROQ_API_KEY` or `GEMINI_API_KEY`). See [Environment Configuration Guide](docs/getting-started/environment.md) for complete parameter definitions.

5. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/chat](http://localhost:3000/chat) to enter the chat workspace.

---

## Architectural & Design Invariants

To keep Radiance modular, maintainable, and reliable, all contributors must observe these core project conventions:

### Component & Feature Boundaries
- **Layer Organization:**  
  - Route segments and layouts live in `src/app/`.  
  - Feature-specific hooks, stores, and controllers live in `src/features/` (`chat`, `intelligence`, `settings`).  
  - Reusable presentation components belong in `src/components/` (`chat`, `navigation`, `background`, `branding`, `ui`).  
  - Shared domain models, AI provider wrappers, database clients, and security utilities belong in `src/lib/`.
- **Minimal Dependencies:** Use native web APIs and existing packages (`@radix-ui/*`, `motion/react`, `lucide-react`, `@tabler/icons-react`, `zod`). Do not introduce extraneous dependencies without prior discussion.
- **Offline-First Resilience:** Conversation data is saved synchronously to `safeLocalStorage` before attempting cloud synchronization via Supabase. Never break offline availability.

### Design System & Visual Identity
- **Dark Violet Palette:** Preserve Radiance's atmospheric dark ground (`#06050a`), deep secondary violet (`#0c0b14`), and warm-white interface text (`#f3f1ec`).
- **Multicolour Accents:** Honor the established multicolour token palette defined in `src/app/globals.css`:
  - `--radiance-blue` (`#3b82f6`)
  - `--radiance-cyan` (`#06b6d4`)
  - `--radiance-violet` (`#8b5cf6`)
  - `--radiance-indigo` (`#6366f1`)
  - `--radiance-coral` (`#fb923c`)
  - `--radiance-rose` (`#f43f5e`)
  - `--radiance-emerald` (`#10b981`)
  - `--radiance-teal` (`#14b8a6`)
  - `--radiance-amber` (`#f59e0b`)
- **Typography Scale:**
  - Display / Editorial Headings: Cormorant Garamond (`--font-serif`, loaded via `next/font/google`).
  - Interface Reading: Plus Jakarta Sans (`--font-sans`).
  - Code & Badges: JetBrains Mono (`--font-mono`).
- **Semantic CSS:** Use semantic CSS variables (`var(--accent)`, `var(--surface)`, `var(--border)`). Avoid hardcoded arbitrary color values in components.

### Accessibility & Motion Standards
- **Touch Targets:** All interactive touch targets must be at least $44 \times 44\text{px}$ (`.touch-target`).
- **Focus Rings:** Maintain distinct, visible focus rings on all interactive elements (`:focus-visible`).
- **Reduced Motion:** Always respect user motion preferences by checking `useReducedMotion()` from `motion/react` and utilizing the presets in `src/lib/motion/presets.ts`.

---

## Development Workflow

### Branching Conventions

Create focused, single-purpose branches from `main`:

```bash
git checkout -b <type>/<short-description>
```

| Prefix | Scope | Example |
|:---|:---|:---|
| `feature/` | New user-facing functionality or enhancements | `feature/latex-copy-button` |
| `fix/` | Bug fixes and stability patches | `fix/stream-buffer-boundary` |
| `docs/` | Documentation improvements or corrections | `docs/update-contributing` |
| `perf/` | Performance tuning or bundle optimization | `perf/throttle-canvas-particles` |
| `test/` | Adding missing test suites or fixtures | `test/circuit-breaker-edge-cases` |
| `refactor/` | Structural code cleanups without behavior changes | `refactor/normalize-ai-telemetry` |

### Commit Message Format

Radiance adheres to [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short imperative description>

[optional detailed body]

[optional issue reference]
```

**Examples:**
- `feat(chat): make Ask the default response mode`
- `fix(stream): prevent token desync during connection timeout`
- `docs(readme): add verified architecture diagram`

---

## Quality Gates & Verification Discipline

Radiance enforces an **evidence-before-claims** discipline (`verification-before-completion`). Before opening a pull request, run and verify the following commands locally:

```bash
# 1. Strict TypeScript compilation check
pnpm typecheck

# 2. ESLint static code analysis
pnpm lint

# 3. Unit and integration tests (Vitest)
pnpm test

# 4. Cross-browser End-to-End matrix (Playwright)
pnpm test:e2e

# 5. Production Next.js build verification
pnpm build

# 6. Production bundle size budget audit (< 800kB /page, < 220kB /layout)
pnpm measure:bundle

# 7. Documentation link and asset integrity audit
pnpm docs:check
```

Every pull request is automatically verified against these checks in GitHub Actions CI (`.github/workflows/ci.yml`).

---

## Licensing & Contributor License Agreement (CLA)

Radiance is maintained under a source-available proprietary license model. We welcome contributions from the community to improve the platform, fix defects, and expand capabilities.

### 1. Contributor Copyright Retention
When you contribute code, documentation, or design assets to Radiance, **you retain full copyright ownership of your contributions**. You do not assign your copyright to Radiance or its maintainers.

### 2. Contributor License Grant (CLA)
All community contributions are subject to the [Radiance Contributor License Agreement (CLA)](CONTRIBUTOR_LICENSE_AGREEMENT.md). Under the CLA, you grant [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] a perpetual, worldwide, royalty-free, non-exclusive license to use, modify, sublicense, and distribute your contribution as part of the Radiance platform under our source-available and commercial licenses.

### 3. Developer Certificate of Origin (DCO) & CLA Acceptance
To ensure unambiguous legal validity, we separate certification of authorship from license grant acceptance:
- **Developer Certificate of Origin (DCO):** Contributors must include a `Signed-off-by` line in their commit messages (`git commit -s`):
  ```bash
  git commit -s -m "feat(chat): add streaming message retry logic"
  ```
  This certifies that the contribution is your original creation and that you have the legal right to submit it.
- **Explicit CLA Acceptance:** When submitting a pull request, you must confirm acceptance of the CLA by checking the affirmative agreement checkbox in the pull request description:
  ```markdown
  - [x] I have read and agree to the terms of the Radiance Contributor License Agreement (CLA).
  ```

### 4. Third-Party Code in Pull Requests
If your pull request incorporates third-party open-source code (e.g., from MIT or Apache-2.0 licensed projects), you must:
1. Conspicuously disclose the upstream origin and author in your pull request description.
2. Include the original copyright and license notice header in any new or modified files.
3. Ensure the upstream license is compatible with permissive commercial distribution (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [LICENSES/](LICENSES/)).

---

## Submitting a Pull Request

1. **Rebase on Main:** Ensure your branch is rebased on the latest `main` branch:
   ```bash
   git fetch origin
   git rebase origin/main
   ```
2. **Push Your Branch:**
   ```bash
   git push -u origin <type>/<short-description>
   ```
3. **Open a Pull Request:** Navigate to the [Radiance Pull Requests page](https://github.com/TanishBane/Radiance/pulls) and click **"New pull request"**.
4. **Complete the Template:** Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely, detailing:
   - What problem was solved.
   - Which files were modified.
   - Verification evidence (test outputs, typecheck logs).
   - Before and after screenshots or screen recordings for any visual UI changes.
5. **Code Review:** A maintainer will review your pull request, discuss trade-offs, and run automated CI checks.

---

## Reporting Issues & Feature Requests

### Bug Reports
Encountered an unexpected behavior? Open a [Bug Report](https://github.com/TanishBane/Radiance/issues/new?template=bug_report.yml) with:
- Clear steps to reproduce the issue.
- Expected vs. actual behavior.
- Operating system, browser, and version information.
- Browser console or server log excerpts (with secrets redacted).

### Feature Requests
Have an architectural suggestion or new capability idea? Submit a [Feature Request](https://github.com/TanishBane/Radiance/issues/new?template=feature_request.yml) describing the user problem, proposed technical design, and trade-offs.

### Security Disclosures
For potential security vulnerabilities, please **do not** use public issues. Follow our [Security Policy](SECURITY.md) to disclose issues privately.
