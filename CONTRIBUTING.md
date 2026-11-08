# Contributing to RADIANCE

Thank you for your interest in contributing to **RADIANCE**! We welcome contributions that align with our mission of building a high-precision, beautifully crafted AI workspace.

Please read this guide before submitting issues or pull requests.

---

## 1. Code of Conduct

All contributors and maintainers are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior privately through our official channels.

---

## 2. Getting Started

### Prerequisites
- **Node.js**: v20 or v22 LTS
- **Package Manager**: `pnpm` v9 or v10 (`npm install -g pnpm`)
- **Git**: v2.30+

### Setup Local Environment
1. Fork the repository on GitHub: `https://github.com/TanishBane/Tanixai`
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/Tanixai.git
   cd Tanixai
   ```
3. Install dependencies with exact lockfile matching:
   ```bash
   pnpm install --frozen-lockfile
   ```
4. Configure local environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Add your API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`, etc.) in `.env.local`.
5. Start the development server:
   ```bash
   pnpm dev
   ```
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Branching Strategy

- **Default Branch**: `main` (production-ready code).
- **Feature Branches**: Branch from `main` using structured prefixes:
  - `feature/<short-description>`: New functionality or enhancements.
  - `fix/<bug-description>`: Bug fixes or stability improvements.
  - `docs/<topic>`: Documentation updates and guides.
  - `perf/<optimization>`: Performance or WebGL tuning.

---

## 4. Coding Standards

- **TypeScript**: Strict typechecking with no implicit `any`. All props and function returns should be typed.
- **Components**: Functional React 19 components with explicit interface contracts.
- **Styling**: Tailwind CSS v4 using semantic custom properties (`var(--accent)`, `var(--surface)`). Avoid hardcoded arbitrary color codes.
- **Motion**: Use Motion for React (`motion/react`) with spring physics or centralized motion presets in `src/lib/motion/presets.ts`. Always respect `useReducedMotion()`.
- **Accessibility**: All interactive elements must maintain a minimum touch target of 44x44px (`.touch-target`), visible focus rings (`:focus-visible`), and ARIA labels.

---

## 5. Verification & Testing Discipline

Before submitting a Pull Request, run all verification commands locally:

```bash
# 1. Typecheck
pnpm run typecheck

# 2. Linting
pnpm run lint

# 3. Vitest Unit & Integration Tests
pnpm run test

# 4. Playwright E2E Tests
pnpm run test:e2e

# 5. Production Build
pnpm run build
```

Every PR must pass all checks in GitHub Actions CI (`.github/workflows/ci.yml`).

---

## 6. Commit Message Guidelines

We follow Conventional Commits:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: A new user-facing feature.
- `fix`: A bug fix.
- `docs`: Documentation changes only.
- `style`: Changes that do not affect code logic (formatting, whitespace).
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `perf`: Code change that improves performance.
- `test`: Adding missing tests or correcting existing tests.
- `chore`: Build tasks, package updates, or configuration.

---

## 7. Submitting a Pull Request

1. Ensure your branch is rebased on the latest `main`.
2. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md) completely.
3. Include screenshots or screen recordings for any UI changes.
4. Maintainers will review your PR and provide constructive feedback.
