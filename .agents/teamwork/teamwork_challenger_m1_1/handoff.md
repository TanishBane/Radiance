# Empirical Challenge Report: Milestone 1 — Presentation & Typography Engine

**Author**: `teamwork_challenger_m1_1` (Empirical Challenger)  
**Recipient**: `orchestrator` (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`)  
**Target Milestone**: Milestone 1: Presentation & Typography Engine  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_challenger_m1_1`  
**Date**: 2026-11-01T06:15:00Z  
**Verdict**: **`REQUEST_CHANGES`**  

---

## 1. Observation

### 1.1 Direct Empirical Observations & Reproductions

Two reproducible functional failure modes were uncovered by designing and running adversarial stress tests against `formatMarkdown` in `src/lib/utils/format.ts`:

#### Observation 1.1.1: Token Leakage in Table Cells (Bug 1 - HIGH)
- **Input**:
  ```markdown
  | Feature | Code Example | Math Formula |
  | --- | --- | --- |
  | Testing | `myFunc()` | $x^2 + y^2 = z^2$ |
  ```
- **Observed Rendered Output**:
  ```html
  <div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]"><table class="markdown-table w-full border-collapse text-left text-xs sm:text-sm"><thead class="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold"><tr><th class="px-3.5 py-2.5" style="text-align: left">Feature</th><th class="px-3.5 py-2.5" style="text-align: left">Code Example</th><th class="px-3.5 py-2.5" style="text-align: left">Math Formula</th></tr></thead><tbody class="divide-y divide-[var(--border)] text-[var(--txt-dim)]"><tr class="hover:bg-[var(--surface-hover)] transition-colors"><td class="px-3.5 py-2" style="text-align: left">Testing</td><td class="px-3.5 py-2" style="text-align: left"> __RAD_TOK_783fcc7a8d174ef387d0afcc73d4a4f5_0__ </td><td class="px-3.5 py-2" style="text-align: left"> __RAD_TOK_783fcc7a8d174ef387d0afcc73d4a4f5_1__ </td></tr></tbody></table></div>
  ```
- **Verbatim Error / Test Failure**:
  ```
  FAIL tests/unit/stress-verification.test.ts > FAILURE MODE 2: preserves inline code and math inside table cells without token leakage
  AssertionError: expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'
  Received: "<td ...> __RAD_TOK_783fcc7a8d174ef387d0afcc73d4a4f5_0__ </td>"
  ```
- **Also Independently Confirmed by Adversarial Suite**:
  In `tests/unit/format-security-adversarial.test.ts:332`:
  ```
  FAIL tests/unit/format-security-adversarial.test.ts > Adversarial Stress Test: Currency Strings vs LaTeX Math > renders LaTeX math notation inside table cells without token leakage
  AssertionError: expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'
  ```

#### Observation 1.1.2: Single-Column Table Delimiter Rejection (Bug 2 - MEDIUM)
- **Input**:
  ```markdown
  | Single Header |
  | --- |
  | Row item 1 |
  | Row item 2 |
  ```
- **Observed Rendered Output**:
  ```html
  | Single Header |<br />| --- |<br />| Row item 1 |<br />| Row item 2 |
  ```
- **Verbatim Node Evaluation**:
  ```javascript
  const regex = /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/;
  regex.test("| --- |"); // returns false
  regex.test("| --- | --- |"); // returns true
  ```
- **Verbatim Error / Test Failure**:
  ```
  FAIL tests/unit/stress-verification.test.ts > FAILURE MODE 1: single-column tables fail to render
  AssertionError: expected false to be true
  ```

### 1.2 Observations of Robust Areas (Passing Challenges)
Adversarial stress tests demonstrated robustness across the remaining target areas:
1. **Malformed Tables**:
   - Uneven column counts: row with fewer columns than header automatically pads with empty `<td>` elements; rows with extra columns gracefully truncate to header count.
   - Escaped pipes `\|` inside table headers and cell text are cleanly unescaped to literal `|` without breaking cell column splitting.
   - Missing delimiter rows gracefully fall back to plain prose text without throwing exceptions.
2. **Deeply Nested Mixed Lists**:
   - Lists indented to 6+ levels maintained strict tag balance (`<ul ...>` count === `</ul ...>` count).
   - Alternating ordered and unordered nested lists properly open and close `<ol>` and `<ul>` tags in valid hierarchical parentage.
   - Task list checkboxes (`- [ ]`, `- [x]`, `- [X]`) inside ordered and unordered lists render disabled `<input type="checkbox">` elements.
   - Irregular indentation jumps (e.g. 0 -> 7 -> 2 -> 11 spaces) do not crash or corrupt the DOM tree.
3. **Incomplete Streaming Inputs**:
   - Code fence auto-recovery correctly appends closing backticks when an odd fence count is detected at EOF.
   - Code blocks with unclosed quotes or unclosed strings during progressive streaming do not cause catastrophic backtracking (ReDoS) or parser crashes.
   - Character-by-character progressive streaming simulation across 100+ tokens produced zero exceptions.
4. **Massive Inputs & Performance**:
   - 150-row table rendered in ~3ms.
   - 1,000-line syntax highlighted code block rendered in ~24ms.
   - 500-item nested list rendered in ~2ms.
   - Zero stack overflows, heap growth was negligible.
5. **Polyglot XSS & Sanitization**:
   - `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, and active tags are stripped.
   - Inline `on*` event handlers and dangerous protocol schemes (`javascript:`, `vbscript:`, `data:`) are neutralized across all HTML elements.

---

## 2. Logic Chain

1. **Root Cause of Token Leakage (Observation 1.1.1)**:
   - In `src/lib/utils/format.ts`:
     - Step 3 extracts inline code `` `...` `` and registers placeholder tokens in `TokenManager` (e.g. `\x1a__RAD_TOK_..._0__\x1a`).
     - Step 4 & 5 extract block/inline LaTeX math formulas and register placeholder tokens (e.g. `\x1a__RAD_TOK_..._1__\x1a`).
     - Step 6 parses tables. It extracts table lines, builds `tableHtml`, and registers `tableHtml` as a new token in `TokenManager` (e.g. `\x1a__RAD_TOK_..._2__\x1a`). Notice that `tableHtml` now encapsulates the earlier tokens 0 and 1.
     - Step 15 invokes `tokenManager.restore(content)`.
     - `TokenManager.restore` (lines 51–57) executes a single pass:
       ```typescript
       public restore(content: string): string {
         let result = content;
         this.tokens.forEach((replacement, token) => {
           result = result.replaceAll(token, () => replacement);
         });
         return result;
       }
       ```
     - In JavaScript, `Map.prototype.forEach` iterates in insertion order.
     - Tokens 0 and 1 were inserted before token 2.
     - When `restore` processes token 0, `content` does NOT contain token 0 (token 0 is embedded inside token 2's replacement string in memory). Therefore, `result.replaceAll(token 0, ...)` performs no substitution.
     - When `restore` later processes token 2, it replaces token 2 with `tableHtml` in `result`. This introduces token 0 and token 1 into `result`.
     - The iteration completes without ever visiting tokens 0 or 1 again.
     - Consequently, raw internal token strings `__RAD_TOK_...__` remain permanently unexpanded in the final HTML delivered to the browser whenever inline code or math appears inside a table cell.

2. **Root Cause of 1-Column Table Rejection (Observation 1.1.2)**:
   - In `src/lib/utils/format.ts:237`:
     ```typescript
     const isDelimiter = nextLine && /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(nextLine);
     ```
   - In this regex:
     - The first group `(\s*:?-+:?\s*\|)+` matches the first cell delimiter with a terminating pipe `|` (e.g. ` --- |`).
     - The second part `\s*:?-+:?\s*` requires a second cell containing at least one dash `-+`.
     - Because `\s*:?-+:?\s*` requires `-+`, it cannot match an empty string.
     - Therefore, this regex matches only if there are at least two columns separated by pipes.
     - A standard single-column delimiter row such as `| --- |` or `---` fails this regex, setting `isDelimiter = false`.
     - Because `isDelimiter` is false, line 238 skips table parsing and emits the raw markdown table as plain text with line breaks.

3. **Severity and Impact Assessment**:
   - In developer tools, API documentation, and AI platform interactions, tables frequently contain inline code parameters (e.g. `| Flag | Type | Description | \n | `--port` | `number` | Port number |`).
   - Leaking raw token nonces (`__RAD_TOK_...__`) completely obliterates readability and presents broken UI to users.
   - Therefore, Milestone 1 cannot be approved in its current state.

---

## 3. Caveats

- **No Caveats Regarding Reproduction**: Both bugs are 100% reproducible with standalone minimal examples and automated Vitest runs.
- **Scope Boundary**: This review is strictly read-only per agent constraints; implementation code was not modified. Proposed fixes are detailed below for the worker agent to apply.

---

## 4. Conclusion

**Verdict**: **`REQUEST_CHANGES`**

Milestone 1 (Presentation & Typography Engine) is rejected pending remediation of two defects in `src/lib/utils/format.ts`:

### Required Remediation for Worker (`teamwork_worker_m1`):
1. **Fix Token Leakage in `TokenManager.restore` (`src/lib/utils/format.ts:51–57`)**:
   Implement an iterative multi-pass or recursive restore loop so that tokens unpacked from container blocks (such as tables) are subsequently resolved:
   ```typescript
   public restore(content: string): string {
     let result = content;
     let prev = "";
     while (prev !== result) {
       prev = result;
       this.tokens.forEach((replacement, token) => {
         result = result.replaceAll(token, () => replacement);
       });
     }
     return result;
   }
   ```
2. **Fix Single-Column Table Delimiter Regex (`src/lib/utils/format.ts:237`)**:
   Allow 1 or more columns in table delimiters:
   ```typescript
   const isDelimiter = nextLine && /^\s*\|?(\s*:?-+:?\s*\|?)+\s*$/.test(nextLine) && nextLine.includes("-");
   ```
   Or match any delimiter row where every pipe-separated cell contains at least three hyphens/colons:
   ```typescript
   const isDelimiter = nextLine && /^\s*\|?\s*:?-+:?\s*(\|?\s*:?-+:?\s*)*\|?\s*$/.test(nextLine);
   ```

---

## 5. Verification Method

To independently verify these failure modes and check the resolution after worker fixes:

1. **Execute Dedicated Stress Verification Suite**:
   ```powershell
   cmd /c npx vitest run tests/unit/stress-verification.test.ts
   ```
   - Currently, tests marked `it.fails` document the exact two failure modes. Once fixed, remove `.fails` to confirm both pass.

2. **Execute Adversarial Suite**:
   ```powershell
   cmd /c npx vitest run tests/unit/format-security-adversarial.test.ts
   ```
   - Currently fails on line 332: `renders LaTeX math notation inside table cells without token leakage`.
   - Once fixed, this test will pass.

3. **Execute Full Project Suite**:
   ```powershell
   cmd /c npm test
   ```
   - Target: All test files passing with exit code 0.

4. **Typecheck & Lint**:
   ```powershell
   cmd /c npm run typecheck
   cmd /c npm run lint
   ```
