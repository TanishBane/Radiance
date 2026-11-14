# RADIANCE — DEVELOPER REFERENCE & ENGINEERING PLAYBOOK

> **Target Audience:** Principal Architects, Senior Engineers & Autonomous AI Coding Agents  
> **Repository:** `Tanixai-main`  
> **Last Verified:** November 14, 2026  
> **Status:** ACTIVE DEVELOPER GUIDE  

---

## 1. QUICK START & LOCAL ENVIRONMENT SETUP

### Prerequisites
- **Node.js:** `v22.x` (or `v20.x`)
- **pnpm:** `v10.x` (or `v9.x`)
- **Git:** Git 2.40+

### Step-by-Step Initialization
```bash
# 1. Clone repository
git clone https://github.com/TanishBane/Tanixai.git
cd Tanixai

# 2. Install frozen dependencies
pnpm install --frozen-lockfile

# 3. Configure local environment
cp .env.example .env.local

# 4. Start local development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) for the landing page or [http://localhost:3000/chat](http://localhost:3000/chat) for the chat canvas.

---

## 2. OFFICIAL DEVELOPMENT & VERIFICATION COMMANDS

Radiance enforces an **evidence-before-claims** discipline (`verification-before-completion`). Always run the appropriate command and inspect exit code 0 before asserting completion.

| Command | Purpose | Underlying Tool | Execution Time | Current Status |
|:---|:---|:---|:---|:---|
| `pnpm dev` | Starts local Next.js App Router dev server on port 3000 | `next dev` | Background | VERIFIED IN CODE |
| `pnpm build` | Production compilation & static generation | `next build` | ~45s | VERIFIED IN CODE |
| `pnpm start` | Runs built production server | `next start` | Immediate | VERIFIED IN CODE |
| `pnpm typecheck` | Strict TypeScript compilation check | `tsc --noEmit` | ~5s | **PASSING (Exit Code 0)** |
| `pnpm lint` | ESLint static analysis | `next lint` | ~6s | **PASSING (0 warnings/errors)** |
| `pnpm test` | Automated unit & integration tests | `vitest run` | ~30s | **583 Passing / 13 Failing** |
| `pnpm test:watch` | Interactive Vitest test runner | `vitest` | Continuous | VERIFIED IN CODE |
| `pnpm test:e2e` | Cross-browser End-to-End matrix | `playwright test` | ~2m | VERIFIED IN CODE |
| `pnpm measure:bundle` | Performance budget verification | `scripts/measure-bundle.mjs` | ~1s | **PASSING (< 800kB /page)** |
| `pnpm docs:check` | Documentation link & asset audit | `scripts/check-docs.mjs` | ~1s | **PASSING (77 files checked)** |

---

## 3. TEST SUITE REALITY & DEFECT TRIAGE

### Test Execution Empirical Results (November 14, 2026)
- **Total Test Files:** 66
- **Total Test Cases:** 596
- **Passed:** 583 (97.8% pass rate)
- **Failed:** 13

### Root Cause Analysis of the 13 Failures
1. **`tests/unit/challenger-m3-ui-actions-blob.test.tsx` (9 tests) & `tests/unit/challenger-m3-workspace-lifecycle.test.tsx` (1 test):**
   - **Cause:** In recent working tree changes to [src/components/chat/message-item.tsx](file:///c:/Tanixai-main/src/components/chat/message-item.tsx), the individual per-message download (`export-message-button`) and deletion (`delete-message-button`) actions were removed from the message item UI, replaced by a centralized conversation export/deletion in Settings.
   - **Evidence:** [tests/unit/message-item.test.tsx](file:///c:/Tanixai-main/tests/unit/message-item.test.tsx#L356-L368) was updated to assert: `it("does not expose message download or deletion on desktop or mobile")`.
   - **Resolution:** The older challenger test suites (`challenger-m3-ui-actions-blob.test.tsx` and `challenger-m3-workspace-lifecycle.test.tsx`) need their assertions aligned with this updated message action policy.
2. **`tests/unit/dynamic-theme.test.ts` (1 test):**
   - **Cause:** In commit `8bb845f` (*"feat(settings): curate palettes and preview backgrounds"*), the themes in `COLOR_THEMES` were curated from 29 down to 24.
   - **Failure:** `AssertionError: expected 24 to be 29`.
   - **Resolution:** Update test expectation from 29 to 24 to match the curated palette count.
3. **`tests/unit/mobile-cross-browser.test.tsx` (1 test):**
   - **Cause:** Topbar language switcher was localized/refactored in commit `ae40f4c`.
   - **Failure:** `Unable to find an accessible element with the role "button" and name "EN"`.
4. **`tests/unit/settings-center.test.tsx` (1 test):**
   - **Cause:** Settings layout label updated during settings search enhancement.
   - **Failure:** `Unable to find a label with the text of: Response language`.

---

## 4. CURRENT WORKING-TREE STATUS & ACTIVE CHANGES

As of November 14, 2026, the working tree contains active, uncommitted enhancements:

### Modified Unstaged Files
- **`src/components/chat/message-item.tsx`:** Implements regeneration limits (displays "Regenerated once"), integrates `canRegenerateResponse`, and enforces the message action policy.
- **`src/features/chat/components/chat-workspace.tsx`:** Propagates response modes and action routes.
- **`src/features/chat/components/radiance-app.tsx`:** Wires single-regeneration handling with `markRegeneratedResponse`, saves `responseMode` on assistant messages.
- **`src/features/chat/hooks/use-chat-stream.ts`:** Captures `responseMode` on streamed and aborted assistant messages.
- **`src/lib/types/chat.ts`:** Adds `responseMode?: "ask" | "plan" | "build"`, `regenerationCount?: number`, `lastRegeneratedAt?: number`.
- **`tests/unit/message-item.test.tsx`:** Adds test for single regeneration and removal of message download/deletion buttons.
- **`playwright-report/index.html`:** E2E test report output.

### Untracked Files (DO NOT TOUCH OR REMOVE)
- **`src/lib/chat/regeneration-policy.ts`:** Implements `MAX_ASSISTANT_REGENERATIONS = 1`, `canRegenerateResponse(message)`, and `markRegeneratedResponse(previous, regenerated)`.
- **`docs/github/`:** Contains Git author attribution scripts and manifests. **STRICT USER DIRECTIVE: DO NOT TOUCH.**

---

## 5. SUBSYSTEM INSPECTION GUIDE BEFORE MODIFYING CODE

Before making changes to any core subsystem, inspect the corresponding authoritative files:

| Subsystem | Primary Files to Inspect | Crucial Invariants to Preserve |
|:---|:---|:---|
| **Chat Messaging & Markdown** | [src/components/chat/message-item.tsx](file:///c:/Tanixai-main/src/components/chat/message-item.tsx), [src/lib/utils/format.ts](file:///c:/Tanixai-main/src/lib/utils/format.ts), [src/lib/utils/syntax-highlighter.ts](file:///c:/Tanixai-main/src/lib/utils/syntax-highlighter.ts) | TokenManager fixed-point restore; strict script/iframe/on* sanitization; KaTeX math boundaries. |
| **Streaming & Abort** | [src/features/chat/hooks/use-chat-stream.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-stream.ts), [src/app/api/chat/route.ts](file:///c:/Tanixai-main/src/app/api/chat/route.ts) | Line buffer splitting on `\n`; stop button partial token retention; propagation of `req.signal`. |
| **Model Registry & Failover** | [src/lib/ai/models.ts](file:///c:/Tanixai-main/src/lib/ai/models.ts), [src/lib/ai/circuit-breaker.ts](file:///c:/Tanixai-main/src/lib/ai/circuit-breaker.ts), [src/lib/ai/providers.ts](file:///c:/Tanixai-main/src/lib/ai/providers.ts) | 3-failure threshold in 30s; 60s cooldown; multimodal auto-rerouting for vision/pdf attachments. |
| **Personal Intelligence** | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts), [retrieval.ts](file:///c:/Tanixai-main/src/features/intelligence/retrieval.ts), [profile-schema.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-schema.ts) | Secret blocking (private keys, tokens, SSN, credit cards); duplicate detection; lexical scoring; opt-in sharing. |
| **Prompt Engineering** | [src/lib/ai/prompts.ts](file:///c:/Tanixai-main/src/lib/ai/prompts.ts), [personalization-context.ts](file:///c:/Tanixai-main/src/lib/ai/personalization-context.ts) | System prompt instructs model that `<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>` is untrusted data and must never override safety. |
| **Settings & Appearance** | [src/features/settings/settings-service.ts](file:///c:/Tanixai-main/src/features/settings/settings-service.ts), [src/lib/types/theme.ts](file:///c:/Tanixai-main/src/lib/types/theme.ts) | Palette rotation through registered themes; CSS variable injection via `applyThemeToDom`. |
| **Persistence & Supabase** | [src/lib/db/conversations.ts](file:///c:/Tanixai-main/src/lib/db/conversations.ts), [src/lib/utils/storage.ts](file:///c:/Tanixai-main/src/lib/utils/storage.ts) | Always save locally first (`safeLocalStorage`); validate ID regex `/^[a-zA-Z0-9_-]{1,128}$/` before SQL queries. |
| **Rate Limiting & Security** | [src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts), [src/lib/security/sanitize.ts](file:///c:/Tanixai-main/src/lib/security/sanitize.ts) | Upstash Redis with local memory token bucket fallback; max 10,000 buckets bound; edge IP extraction. |

---

## 6. MULTI-AGENT DEVELOPMENT HISTORY & RECONNAISSANCE

Radiance has evolved through contributions across multiple AI development tools:
- **Antigravity (Google DeepMind):** Comprehensive architecture, security audits, mobile touch ergonomics, testing tracks, and documentation in `.antigravity/`.
- **Kilo Code:** Autonomous agent worktrees located in `.kilo/worktrees/` (`hill-backbone`, `joyous-kip`).
- **Jules (Google):** Accessibility improvements, ARIA labels, and touch targets (`.Jules/palette.md`).
- **Impeccable & Taste Skill:** Visual design review, anti-slop guidelines, typography curation (`DESIGN.md`, `.impeccable/`, `.taste-skill/`).
- **Superpowers Workflows:** Structured planning and execution in `docs/superpowers/plans/` and `.agents/teamwork/`.

### Development Rules for Future Agents
1. **Preserve Boundaries:** Next.js App Router, React 19, TypeScript, Tailwind, AI provider registry, and Supabase.
2. **Preserve Design Identity:** Dark violet ground, Cormorant Garamond display headings, and full multicolour accent tokens.
3. **Evidence Before Claims:** Never claim tests pass or builds succeed without executing the command in the current turn.
4. **Never Commit or Push Unless Asked:** Keep Git history intact; do not clean or overwrite working tree changes.
