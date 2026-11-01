# Handoff Report: Security, Sanitization & CSS Styling Review — Milestone 1: Presentation & Typography Engine

**Author**: `teamwork_reviewer_m1_2`  
**Role**: Reviewer & Adversarial Critic  
**Recipient**: `orchestrator` (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`)  
**Milestone**: Milestone 1: Presentation & Typography Engine  
**Verdict**: **`REQUEST_CHANGES`**  
**Date**: 2026-11-01  
**Handoff Type**: Hard (Review complete, actionable remediation provided)

---

## 1. Observation

### 1.1 Scope & Files Reviewed
The following implementation and test files were directly examined:
- `src/lib/utils/format.ts` (444 lines) — TokenManager, URL validation, HTML sanitization, streaming recovery, markdown parser.
- `src/lib/utils/syntax-highlighter.ts` (231 lines) — Token rules for 8 languages, badge normalization, HTML-escaped token spans.
- `src/lib/utils/math-renderer.ts` (134 lines) — KaTeX runtime integration and semantic HTML fallback for Greek letters, fractions, roots, subscripts/superscripts.
- `src/app/globals.css` (lines 134–589) — Typography hierarchy, table overflow styling, syntax token colors, touch targets, and focus rings.
- `tests/unit/format.test.ts` (413 lines) — Unit test suite for format utilities.
- `tests/unit/stress-verification.test.ts` (300 lines) — Empirical challenger test suite.
- `tests/unit/format-security-adversarial.test.ts` (360 lines) — Adversarial security stress tests.

### 1.2 Tool Execution Results

1. **TypeScript Typecheck (`cmd /c npm run typecheck`)**:
   ```
   > radiance@1.0.0 typecheck
   > tsc --noEmit
   Exit Code: 0
   ```
   Status: **PASS**.

2. **ESLint Lint Check (`cmd /c npm run lint`)**:
   ```
   > radiance@1.0.0 lint
   > next lint
   ✔ No ESLint warnings or errors
   Exit Code: 0
   ```
   Status: **PASS**.

3. **Vitest Test Suite (`cmd /c npm test`)**:
   ```
   > radiance@1.0.0 test
   > vitest run

   RUN  v3.2.7 C:/Tanixai-main

   ✓ tests/unit/models.test.ts (5 tests)
   ✓ tests/unit/storage.test.ts (2 tests)
   ✓ tests/unit/sanitize.test.ts (5 tests)
   ✓ tests/unit/format.test.ts (41 tests)
   ✓ tests/unit/format-security-adversarial.test.ts (17 tests)
   ✓ tests/unit/api-contract.test.ts (4 tests)
   ✓ tests/unit/theme-gradients.test.ts (8 tests)
   ❯ tests/unit/stress-verification.test.ts (21 tests | 3 failed)
     ...
     × Empirical Challenger Stress Test Suite > 1. Malformed Tables > BUG IDENTIFICATION: preserves inline code and math inside table cells without token leakage
       → expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'
     × Empirical Challenger Stress Test Suite > 2. Deeply Nested Mixed Lists > handles task checkboxes [ ] and [x] nested inside ordered and unordered lists
     × Empirical Challenger Stress Test Suite > 5. Security & Polyglot Injection Edge Cases > neutralizes nested script tags
   ✓ tests/unit/conversations.test.ts (3 tests)
   ✓ tests/unit/rate-limiter.test.ts (3 tests)
   ✓ tests/unit/documents.test.ts (4 tests)
   ✓ tests/unit/circuit-breaker.test.ts (3 tests)
   ✓ tests/unit/table-xss.test.ts (1 test)
   ✓ tests/unit/ui-welcome-card.test.ts (2 tests)

   Test Files  1 failed | 13 passed (14)
        Tests  3 failed | 116 passed (119)
     Duration  7.92s
   Exit Code: 1
   ```
   Status: **FAIL** (Exit code 1).

### 1.3 Concrete Code Observations & Flaws

#### Observation A: TokenManager Nested Token Leakage in Table Cells
In `src/lib/utils/format.ts`:
- **Line 185**: Inline code is matched and registered in `TokenManager`:
  ```typescript
  content = content.replace(/`([^`\n]+)`/g, (_, code) => {
    const inlineHtml = `<code>${escapeHtml(code)}</code>`;
    return tokenManager.register(inlineHtml);
  });
  ```
  Returns `\x1a__RAD_TOK_${nonce}_${counter++}__\x1a`.
- **Line 197**: Inline math is matched and registered in `TokenManager`:
  ```typescript
  content = content.replace(/(?<!\\|\$)\$([^\$\s](?:[^$\n]*?[^\$\s])?)\$(?!\$|[0-9])/g, (_, math) => {
    const mathHtml = renderMath(math, false);
    return tokenManager.register(mathHtml);
  });
  ```
- **Lines 234–288**: Tables are parsed. Cell contents containing registered inline code or math tokens are placed directly into `tableHtml`. At line 288:
  ```typescript
  nonTableLines.push(tokenManager.register(tableHtml));
  ```
  The table HTML is registered as a subsequent token.
- **Lines 51–57 (`TokenManager.restore`)**:
  ```typescript
  public restore(content: string): string {
    let result = content;
    this.tokens.forEach((replacement, token) => {
      result = result.replaceAll(token, () => replacement);
    });
    return result;
  }
  ```
  `this.tokens` is a `Map` that iterates in insertion order. When `restore()` iterates:
  1. The inline code/math tokens (registered first) are replaced in `content`. At this moment, `content` only contains the un-expanded table token. The inline code/math tokens are NOT yet in `content`, so 0 replacements occur.
  2. The table token is replaced in `content`, expanding the table HTML. The table HTML contains the un-expanded inline code/math tokens.
  3. The loop completes without making a second pass.
  4. The rendered HTML output contains un-substituted token nonces:
     `"<td class=\"px-3.5 py-2\" style=\"text-align: left\"> __RAD_TOK_fc53bb276edc4ba3b0f0c4902b2eefb2_0__ </td>"`.

#### Observation B: Truncation of Markdown URLs with Balanced Parentheses
In `src/lib/utils/format.ts:211`:
```typescript
.replace(/\[([^\n\]]+)\]\(\s*([^\)\n]*(?:\([^\)\n]*\)[^\)\n]*)*)\s*\)/g, (_, label, url) => {
```
When parsing markdown links where the URL contains parentheses, e.g.:
`[Wiki](https://en.wikipedia.org/wiki/Function_(mathematics))`
The leading `[^\)\n]*` subpattern matches `https://en.wikipedia.org/wiki/Function_(mathematics`. The inner `)` then prematurely matches the outer closing delimiter `\)`. The final closing parenthesis `)` is left unparsed as literal text outside the link.
Verbatim output:
```html
<a href="https://en.wikipedia.org/wiki/Function_(mathematics" target="_blank" rel="noopener noreferrer" class="markdown-link">Wiki</a>)
```
The URL is corrupted/truncated.

#### Observation C: Security & Sanitization Verification (Strengths Observed)
- In `src/lib/utils/format.ts:65–82` (`isSafeUrl`), URLs are decoded for HTML numeric/hex entities, control characters, colons (`&colon;`, `%3a`), and tested against a protocol blacklist (`javascript:`, `vbscript:`, `data:`, `file:`, `blob:`) and a strict scheme whitelist (`https?://`, `mailto:`, `tel:`, `/`, `#`). Obfuscated protocols like `javascript&#58;`, `java\x00script:`, `JAVASCRIPT:`, `data:text/html` are consistently rejected and rendered as `<span class="unsafe-link">`.
- In `src/lib/utils/format.ts:99–138` (`sanitizeHtml`), active executable tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<base>`, `<form>`) are stripped.
- In `src/lib/utils/format.ts:118`, inline event handlers `on[a-zA-Z]+\s*=` are stripped across all quote formats (`"..."`, `'...'`, `&quot;...&quot;`, unquoted).
- In `src/lib/utils/format.ts:298`, all raw text prose is escaped via `escapeHtml(content)`, preventing any user-typed tags from executing as DOM elements.
- In `src/lib/utils/format.ts:31–58`, `TokenManager` generates 128-bit random nonces (`crypto.randomUUID()` or crypto-fallback) and delimiters `\x1a`, preventing predictable collision attacks, and uses function replacers `() => replacement` to eliminate `$1`, `$&`, `$$` corruption.

#### Observation D: CSS Styling & Accessibility Inspection
- In `src/app/globals.css`:
  - Typography: calibrated modular scale from H1 (`1.45rem`, bold, bottom border) down to H6 (`0.75rem`, uppercase, muted). Headings include `:first-child { margin-top: 0; }`.
  - Tables: `.table-wrapper` has `width: 100%`, `overflow-x: auto`, `-webkit-overflow-scrolling: touch`, alternating row striping, subtle hover highlight, and custom 4px scrollbars.
  - Code Blocks: `.code-block-wrapper` has `overflow-x: auto`, uppercase normalized language badges, and copy buttons with feedback states (`.copied`).
  - Accessibility: `:focus-visible` with 2px accent outline (WCAG 2.4.7), `.touch-target` with `min-height: 44px; min-width: 44px` (WCAG 2.5.5), and text contrast ratio exceeding WCAG AA (>4.5:1).

---

## 2. Logic Chain

1. **Test Suite Failure**: Observation 1.2 shows that `cmd /c npm test` exits with code 1. A passing test suite is an explicit invariant and dispatch requirement.
2. **Reproducible Defect in TokenManager**: From Observation 1.3(A), `TokenManager` registers tokens in forward sequence: `code -> math -> table`. In `restore()`, iterating over `this.tokens` replaces inline code and math before the table token is unpacked. Because replacement is single-pass, any inline code or math token nested within table HTML remains un-substituted, leaking raw control strings (`__RAD_TOK_<nonce>_<id>__`) into the user interface.
3. **Reproducible Defect in Hyperlink Parsing**: From Observation 1.3(B), markdown links with parenthesized URLs (standard in Wikipedia and technical documentation) are truncated due to greedy matching preceding the parenthesis group, creating broken links with stray trailing characters.
4. **Conclusion**: While security sanitization, XSS neutralization, safe protocol filtering, and CSS typography are well-crafted and robust, the test failure (exit code 1) and the token leakage defect in tables prevent an unconditional approval. Milestone 1 requires targeted remediation before advancing to Milestone 2.

---

## 3. Caveats

1. **Flawed Adversarial Assertions in Tests**:
   In `tests/unit/format-security-adversarial.test.ts:347,356`, the challenger wrote a test assertion expecting `$1` to appear when the input table only contained `$&` and `$'`. This was a test error, not an implementation error.
   Similarly, in `tests/unit/stress-verification.test.ts:290`, the test asserted `not.toContain("alert(1)")` on nested script tags, whereas `formatMarkdown` correctly escaped them into harmless literal text (`&lt;&lt;SCRIPT...`), neutralizing execution.
2. **Review-Only Constraint**:
   Per the reviewer constraint, no source files were modified by this agent. All findings must be addressed by the worker agent.

---

## 4. Conclusion

### **VERDICT: `REQUEST_CHANGES`**

The implementation demonstrates strong security engineering, complete sanitization against XSS vectors, and clean CSS typography. However, changes are requested to resolve two concrete defects and restore clean test passing:

### Required Remediation (Action Items for Worker):

1. **Fix TokenManager Nested Replacement in `src/lib/utils/format.ts:51–57`**:
   Update `TokenManager.restore()` to run a fixed-point loop until all tokens are resolved, or resolve nested tokens:
   ```typescript
   public restore(content: string): string {
     let result = content;
     let prev: string;
     do {
       prev = result;
       this.tokens.forEach((replacement, token) => {
         result = result.replaceAll(token, () => replacement);
       });
     } while (result !== prev && result.includes("__RAD_TOK_"));
     return result;
   }
   ```
2. **Fix Markdown Link Parentheses Parsing in `src/lib/utils/format.ts:211`**:
   Refine the regex in `formatInline` so that URLs containing balanced parentheses (e.g. `https://en.wikipedia.org/wiki/Function_(mathematics)`) are not truncated.
3. **Verify Clean Test Run**:
   Ensure `cmd /c npm test` passes with exit code 0 across all test files.

---

## 5. Verification Method

To independently verify these findings:

1. **Reproduce Test Failure**:
   ```powershell
   cmd /c npm test
   ```
   *Observed*: Exit code 1 with failure in `tests/unit/stress-verification.test.ts`.

2. **Reproduce Table Inline Code Token Leak**:
   ```powershell
   cmd /c npx tsx -e "import { formatMarkdown } from './src/lib/utils/format'; console.log(formatMarkdown('| Feature | Code |\n| --- | --- |\n| Test | \`foo()\` |'));"
   ```
   *Observed*: Output contains `__RAD_TOK_` instead of `<code>foo()</code>`.

3. **Reproduce Parenthesized Link Truncation**:
   ```powershell
   cmd /c npx tsx -e "import { formatMarkdown } from './src/lib/utils/format'; console.log(formatMarkdown('[Wiki](https://en.wikipedia.org/wiki/Function_(mathematics))'));"
   ```
   *Observed*: Output ends with `mathematics" ...>Wiki</a>)`.

4. **Verify Typecheck and Linting (Passing Baseline)**:
   ```powershell
   cmd /c npm run typecheck
   cmd /c npm run lint
   ```
   *Observed*: Both exit with code 0.
