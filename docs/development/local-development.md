# Local Development Guide

This guide describes how to configure, develop, and maintain the Radiance application locally.

---

## 1. Prerequisites

Ensure your environment satisfies the following baseline requirements:
- **Node.js:** `v20.x` or `v22.x` (LTS recommended)
- **Package Manager:** `pnpm` (version `9.x` or higher)
- **Git:** Modern git with LF line-ending support

Verify installed versions:
```bash
node -v
pnpm -v
git --version
```

---

## 2. Getting Started

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/TanishBane/Tanixai.git
   cd Tanixai
   ```

2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment:**
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   Populate the required API keys (at least one AI provider key such as `GROQ_API_KEY` or `GEMINI_API_KEY` is required for inference). See [Environment Variable Specifications](../getting-started/environment.md) for full details.

4. **Start the Development Server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 3. Verified Development Commands

| Command | Description |
|:---|:---|
| `pnpm dev` | Starts Next.js development server with hot-module reloading |
| `pnpm build` | Executes production Next.js compilation |
| `pnpm start` | Boots production server from compiled `.next` build |
| `pnpm typecheck` | Runs TypeScript compiler checks without emitting files (`tsc --noEmit`) |
| `pnpm lint` | Executes Next.js ESLint static analysis |
| `pnpm test` | Runs the Vitest unit, regression, and stress test suites |
| `pnpm test:e2e` | Runs Playwright end-to-end integration tests across browsers |
| `pnpm measure:bundle` | Validates client JavaScript bundle budgets against strict gzip thresholds |
| `pnpm docs:check` | Validates markdown internal links, assets, and documentation integrity |

---

## 4. Architecture & Coding Conventions

### 4.1 Boundary Invariants
- **UI & Presentation:** Resides in `src/app`, `src/components`, and `src/features`.
- **Core AI & Streaming:** Resides in `src/lib/ai` and `src/features/chat`.
- **Database & Persistence:** Resides in `src/lib/db`.
- **Design Tokens:** Defined centrally in `src/app/globals.css`. Do not hardcode arbitrary hexadecimal color codes; always utilize semantic CSS variables (`var(--accent)`, `var(--void)`, `var(--txt)`, etc.).

### 4.2 Motion & Animation
- Use the centralized motion presets in `src/lib/motion/presets.ts`.
- Always respect user accessibility preferences using `useReducedMotion()`. When reduced motion is preferred, disable layout animations and substitute instantaneous or opacity-only transitions.

### 4.3 Git & Branch Discipline
- Maintain evidence-before-claims verification discipline (`verification-before-completion`).
- Run `pnpm typecheck` and `pnpm test` before submitting changes.
