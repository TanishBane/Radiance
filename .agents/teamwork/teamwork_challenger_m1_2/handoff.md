# Empirical Challenge Report: Milestone 1 — LaTeX Math & XSS Sanitization

**Author**: `teamwork_challenger_m1_2`  
**Recipient**: `orchestrator` (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`)  
**Milestone**: Milestone 1: Presentation & Typography Engine  
**Review Target**: `src/lib/utils/format.ts`, `src/lib/utils/math-renderer.ts`, `tests/unit/format.test.ts`  
**Date**: 2026-11-01  
**Verdict**: **`REQUEST_CHANGES`**

---

## 1. Observation

### 1.1 Empirical Test Execution Commands & Outputs

An extensive adversarial stress-test suite was implemented and executed in `tests/unit/format-security-adversarial.test.ts` covering over 100 hostile polyglot payloads, dangerous protocol link structures, currency strings vs math notation, broken math syntax, and boundary conditions in JSDOM.

#### 1. Full Vitest Test Suite Execution:
```powershell
Command: cmd /c npm test
Result: Exit code 1 (FAILED)
```
Verbatim failing output:
```
 FAIL  tests/unit/format-security-adversarial.test.ts > Adversarial Stress Test: Currency Strings vs LaTeX Math > renders LaTeX math notation inside table cells without token leakage
AssertionError: expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'

Expected: "__RAD_TOK_"
Received: "<div class=\"table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]\"><table class=\"markdown-table w-full border-collapse text-left text-xs sm:text-sm\"><thead class=\"bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold\"><tr><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Equation</th><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Description</th></tr></thead><tbody class=\"divide-y divide-[var(--border)] text-[var(--txt-dim)]\"><tr class=\"hover:bg-[var(--surface-hover)] transition-colors\"><td class=\"px-3.5 py-2\" style=\"text-align: left\"> __RAD_TOK_cec5d6627bf44d82a8c51f84bbe64e90_0__ </td><td class=\"px-3.5 py-2\" style=\"text-align: left\">Mass-energy equivalence</td></tr></tbody></table></div>"

 ❯ tests/unit/format-security-adversarial.test.ts:332:26
    330|     ].join("\n");
    331|     const rendered = formatMarkdown(tableWithMath);
    332|     expect(rendered).not.toContain("__RAD_TOK_");
       |                          ^
    333|     expect(rendered).toContain('class="math-inline"');
```

Also failing in `tests/unit/stress-verification.test.ts`:
```
 FAIL  tests/unit/stress-verification.test.ts > Empirical Challenger Stress Test Suite > 1. Malformed Tables > FAILURE MODE 2: preserves inline code and math inside table cells without token leakage
AssertionError: expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'

Expected: "__RAD_TOK_"
Received: "<div class=\"table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]\"><table class=\"markdown-table w-full border-collapse text-left text-xs sm:text-sm\"><thead class=\"bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold\"><tr><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Feature</th><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Code Example</th><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Math Formula</th></tr></thead><tbody class=\"divide-y divide-[var(--border)] text-[var(--txt-dim)]\"><tr class=\"hover:bg-[var(--surface-hover)] transition-colors\"><td class=\"px-3.5 py-2\" style=\"text-align: left\">Testing</td><td class=\"px-3.5 py-2\" style=\"text-align: left\"> __RAD_TOK_048ab0c520494046981d91443164fd64_0__ </td><td class=\"px-3.5 py-2\" style=\"text-align: left\"> __RAD_TOK_048ab0c520494046981d91443164fd64_1__ </td></tr></tbody></table></div>"
```

#### 2. TypeScript Typecheck Execution:
```powershell
Command: cmd /c npm run typecheck
Result: Exit code 0 (Passing)
```

### 1.2 Specific Defect Observation in Code:
In `src/lib/utils/format.ts:51-57`:
```typescript
  public restore(content: string): string {
    let result = content;
    this.tokens.forEach((replacement, token) => {
      result = result.replaceAll(token, () => replacement);
    });
    return result;
  }
```
And in `src/lib/utils/format.ts`:
- Step 3 (line 185) extracts inline code into `TokenManager` (e.g. `Token 0`).
- Steps 4 & 5 (lines 191, 197) extract block and inline LaTeX math into `TokenManager` (e.g. `Token 1`).
- Step 6 (lines 220-288) parses Markdown Tables. Table cells already contain `Token 0` and `Token 1`. The entire table is then registered into `TokenManager` as `Token 2`.
- Step 15 (line 413) executes `tokenManager.restore(content)`.

---

## 2. Logic Chain

1. **Token Hierarchy & Order of Registration**:
   In `format.ts`, code blocks, inline code, and LaTeX math notation are extracted into placeholder tokens before table processing. When a table contains an inline math expression (e.g., `| $E = mc^2$ | Description |`), step 5 extracts `$E = mc^2$` into `Token 0` (`\x1a__RAD_TOK_<nonce>_0__\x1a`).
2. **Table Container Encapsulation**:
   At step 6, the table is parsed. The cell content now contains `\x1a__RAD_TOK_<nonce>_0__\x1a`. The table HTML is constructed and registered into `TokenManager` as `Token 1`.
3. **Linear Single-Pass Restoration Failure**:
   `TokenManager.restore()` executes a single `forEach` loop over `this.tokens` in forward insertion order:
   - Pass 1: `token` is `Token 0`. `result` is searched for `Token 0`. However, `result` at this stage only contains `Token 1` (the table wrapper). `Token 0` is inside the stored replacement string for `Token 1`, not in `result`. Hence, `replaceAll` replaces nothing.
   - Pass 2: `token` is `Token 1`. `replaceAll` substitutes the table HTML into `result`. This introduces `Token 0` into `result`.
   - The loop finishes because all registered tokens in the map have been visited once.
4. **Token Leakage & Display Corruption**:
   `Token 0` remains permanently un-substituted in the final output string. Instead of rendering `<span class="math-inline" ...>E = mc<sup>2</sup></span>`, the client browser receives `__RAD_TOK_<nonce>_0__`.
5. **Contract & Requirement Invalidation**:
   This directly violates `PROJECT.md` M1 Acceptance Criteria: *"Standard mathematical notation renders properly without raw unparsed syntax"* and compromises the platform's presentation engine by exposing internal token delimiters to end users.
6. **XSS Defense Assessment (Positive Finding)**:
   All XSS sanitization dimensions tested passed completely:
   - Active tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<base>`, `<form>`) are neutralized.
   - All inline `on*` event handlers across all attribute quoting/casing forms are stripped.
   - Dangerous protocol links (`javascript:`, `vbscript:`, `data:`, `file:`, `blob:`, and entity-encoded variants) are neutralized to `<span class="unsafe-link">`.
   - Math fallback renderer escapes all HTML entities (`<` -> `&lt;`), preventing injection via `\text{<script>}`.
   - Currency strings (`$50`, `$3.50`, `$50,000`, `$10 to $20`) are correctly preserved and not mistaken for math delimiters.

---

## 3. Caveats

1. **Scope of Defect**:
   The defect is localized to nested token restoration in `TokenManager.restore()`. It affects any markdown block construct (such as GFM tables) that contains inline code or LaTeX math notation.
2. **XSS Engine Robustness**:
   No active executable XSS payloads were able to achieve script execution in JSDOM. The HTML escaping and sanitization pipeline is sound; the failure is strictly a functional token-replacement defect.
3. **No other caveats.**

---

## 4. Conclusion

**Verdict: `REQUEST_CHANGES`**

Milestone 1 **cannot be approved** until the following change is made by `teamwork_worker_m1`:
- **Fix `TokenManager.restore()`**:
  Update `TokenManager.restore()` in `src/lib/utils/format.ts` to support multi-pass or recursive token restoration so that placeholders embedded within table HTML (or any other container blocks) are fully restored to their formatted HTML elements (e.g., using a loop while tokens remain or until `result` stabilizes).
- **Verify All Unit Tests Pass**:
  After fixing, `cmd /c npm test` must pass 100% of all unit tests (including `tests/unit/format-security-adversarial.test.ts` and `tests/unit/stress-verification.test.ts`) with zero test failures.

---

## 5. Verification Method

To independently verify this failure:

1. **Execute Vitest on the Adversarial Test Suite**:
   ```powershell
   cmd /c npx vitest run tests/unit/format-security-adversarial.test.ts
   ```
   *Current Result*: 1 failure: `renders LaTeX math notation inside table cells without token leakage`.

2. **Execute Full Repository Test Suite**:
   ```powershell
   cmd /c npm test
   ```
   *Current Result*: Exits with code 1.

3. **Minimal Repro Script**:
   ```typescript
   import { formatMarkdown } from "@/lib/utils/format";
   const input = "| Equation |\n| --- |\n| $E = mc^2$ |";
   const output = formatMarkdown(input);
   console.log(output); // Contains __RAD_TOK_ instead of math-inline
   ```
