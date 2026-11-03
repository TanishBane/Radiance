# Handoff Report: Milestone 1 Iteration 2 Remediation — Part A: Multi-Pass TokenManager Restoration

**Author**: `teamwork_explorer_m1_iter2_1`  
**Role**: Technical Explorer (Read-Only Investigation & Synthesis)  
**Recipient**: `orchestrator` (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`)  
**Target Milestone**: Milestone 1 Iteration 2 Remediation — Part A  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m1_iter2_1`  
**Handoff Type**: Hard (Investigation complete, actionable algorithm and test assertions delivered)  
**Date**: 2026-11-01  

---

## 1. Observation

### 1.1 Direct Empirical Reproduction of Token Leakage

Direct execution of the test suite confirmed the exact failure mode identified by Reviewer 2, Challenger 1, and Challenger 2:

- **Command Executed**:
  ```powershell
  cmd /c npm test -- tests/unit/format-security-adversarial.test.ts
  ```
- **Verbatim Error & Failure**:
  ```
  FAIL tests/unit/format-security-adversarial.test.ts > Adversarial Stress Test: Currency Strings vs LaTeX Math > renders LaTeX math notation inside table cells without token leakage
  AssertionError: expected '<div class="table-wrapper overflow-x-…' not to contain '__RAD_TOK_'

  Expected: "__RAD_TOK_"
  Received: "<div class=\"table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]\"><table class=\"markdown-table w-full border-collapse text-left text-xs sm:text-sm\"><thead class=\"bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold\"><tr><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Equation</th><th class=\"px-3.5 py-2.5\" style=\"text-align: left\">Description</th></tr></thead><tbody class=\"divide-y divide-[var(--border)] text-[var(--txt-dim)]\"><tr class=\"hover:bg-[var(--surface-hover)] transition-colors\"><td class=\"px-3.5 py-2\" style=\"text-align: left\"> __RAD_TOK_4e4cab55a7874e99a4427ec9bdf12650_0__ </td><td class=\"px-3.5 py-2\" style=\"text-align: left\">Mass-energy equivalence</td></tr></tbody></table></div>"

  ❯ tests/unit/format-security-adversarial.test.ts:332:26
      330|     ].join("\n");
      331|     const rendered = formatMarkdown(tableWithMath);
      332|     expect(rendered).not.toContain("__RAD_TOK_");
         |                          ^
      333|     expect(rendered).toContain('class="math-inline"');
  ```

- **Also Documented in `tests/unit/stress-verification.test.ts:85-95`**:
  ```typescript
  it.fails("FAILURE MODE 2: preserves inline code and math inside table cells without token leakage", () => {
    const input = [
      "| Feature | Code Example | Math Formula |",
      "| --- | --- | --- |",
      "| Testing | `myFunc()` | $x^2 + y^2 = z^2$ |",
    ].join("\n");
    const rendered = formatMarkdown(input);
    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain("<code>myFunc()</code>");
    expect(rendered).toContain("math-inline");
  });
  ```

### 1.2 Inspection of Existing Source Implementation

Inspection of `src/lib/utils/format.ts:25–58`:
```typescript
25: export class TokenManager {
26:   private nonce: string;
27:   private counter = 0;
28:   private tokens = new Map<string, string>();
...
41:   public register(html: string): string {
42:     const token = `\x1a__RAD_TOK_${this.nonce}_${this.counter++}__\x1a`;
43:     this.tokens.set(token, html);
44:     return token;
45:   }
...
51:   public restore(content: string): string {
52:     let result = content;
53:     this.tokens.forEach((replacement, token) => {
54:       result = result.replaceAll(token, () => replacement);
55:     });
56:     return result;
57:   }
58: }
```

In `formatMarkdown` (`src/lib/utils/format.ts`):
- Line 185: Inline code is registered as `Token 0` (e.g. `\x1a__RAD_TOK_<nonce>_0__\x1a`).
- Line 197: Inline LaTeX math is registered as `Token 1` (e.g. `\x1a__RAD_TOK_<nonce>_1__\x1a`).
- Line 288: The markdown table parser constructs `tableHtml` containing `Token 0` and `Token 1` in cell values, and registers the table as `Token 2` (e.g. `\x1a__RAD_TOK_<nonce>_2__\x1a`).
- Line 413: `tokenManager.restore(content)` is executed.

---

## 2. Logic Chain

1. **Ordering of `Map.prototype.forEach`**: JavaScript `Map` iterates keys in chronological insertion order. In `this.tokens`, `Token 0` (code) and `Token 1` (math) precede `Token 2` (table).
2. **Initial String Content**: At Step 15, `content` contains `Token 2`. It does not contain `Token 0` or `Token 1` directly; they are encapsulated inside the string value associated with `Token 2`.
3. **Pass Failure**:
   - `Token 0`: `result.replaceAll(Token 0, ...)` matches 0 instances. No substitution occurs.
   - `Token 1`: `result.replaceAll(Token 1, ...)` matches 0 instances. No substitution occurs.
   - `Token 2`: `result.replaceAll(Token 2, ...)` substitutes `tableHtml` into `result`.
4. **Leakage**: Once `tableHtml` enters `result`, `Token 0` and `Token 1` are now present in `result`. However, the loop has terminated because all keys in `this.tokens` were already visited.
5. **Fixed-Point Necessity**: A multi-pass loop that repeats until all tokens have converged (`while (prev !== result && result.includes("__RAD_TOK_"))`) guarantees that newly unveiled child tokens are visited in subsequent passes and expanded cleanly.
6. **Function Replacer Invariant**: In JavaScript, string replacement via `String.prototype.replaceAll(token, str)` treats `$&`, `$'`, `$$`, and `$1` as special replacement operators:
   - `$&` re-inserts the matched token, causing permanent token corruption.
   - `$$` collapses to `$`, corrupting LaTeX math notation and shell scripts.
   - Function replacers `() => replacement` bypass `GetSubstitution` in ECMAScript §22.1.3.17, guaranteeing 100% literal preservation of all dollar-sign patterns.

---

## 3. Caveats

- **Scope Boundary**: As a read-only explorer, no direct source code edits were committed to `src/lib/utils/format.ts`. The implementation must be applied by the designated worker agent.
- **Other Iteration 1 Defects**: This report specifically addresses **Part A: Multi-pass TokenManager Restoration**. Other defects identified in Iteration 1 (Part B: Single-Column Table Delimiter Rejection in `format.ts:237`, and Part C: Parenthesized Markdown URL Truncation in `format.ts:211`) are complementary and can be remediated in parallel or sequenced by the orchestrator.

---

## 4. Conclusion

### 4.1 Recommended Implementation for `TokenManager.restore()`

Replace lines 48–57 in `src/lib/utils/format.ts` with the following fixed-point algorithm:

```typescript
  /**
   * Restores all registered tokens using iterative fixed-point replacement with function-based replacers.
   * Multi-pass resolution unpacks nested tokens (e.g. inline code or LaTeX math inside table cells)
   * while eliminating JavaScript special replacement pattern corruption ($&, $', $$, $1).
   */
  public restore(content: string): string {
    let result = content;
    let prev = "";
    let passes = 0;
    const maxPasses = 10;

    while (prev !== result && result.includes("__RAD_TOK_") && passes < maxPasses) {
      prev = result;
      this.tokens.forEach((replacement, token) => {
        result = result.replaceAll(token, () => replacement);
      });
      passes++;
    }

    return result;
  }
```

### 4.2 Key Invariants Guaranteed by this Implementation

1. **Multi-Pass Convergence**: Unpacks nested tokens up to 10 passes (actual nesting depth in Markdown is $\le 2$).
2. **Fast Path for Plain Text**: If `content` has no tokens, `result.includes("__RAD_TOK_")` evaluates to `false` on the first check, running 0 passes in $O(1)$ time.
3. **Adversarial Termination**: If user content includes the literal substring `__RAD_TOK_`, after 1 pass no registered tokens match, `prev === result`, and the loop halts immediately.
4. **Dollar Preservation**: `() => replacement` is retained strictly intact, preventing any corruption of `$`, `$$`, `$&`, `$'`, or `$1`.

### 4.3 Unit Test Assertions to Add to `tests/unit/format.test.ts`

```typescript
describe("Nested Token Restoration & Container Expansion", () => {
  it("expands inline code and LaTeX math inside table cells without token leakage", () => {
    const markdown = [
      "| Operation | Code Example | Mathematical Model |",
      "| :--- | :--- | :--- |",
      "| Summation | `add(a, b)` | $s = a + b$ |",
      "| Square | `sqr(x)` | $f(x) = x^2$ |",
    ].join("\n");

    const rendered = formatMarkdown(markdown);

    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain("<table");
    expect(rendered).toContain("<code>add(a, b)</code>");
    expect(rendered).toContain("<code>sqr(x)</code>");
    expect(rendered).toContain('class="math-inline"');
  });

  it("safely preserves dollar-sign replacement patterns ($&, $1, $$, $') in table cell code", () => {
    const markdown = [
      "| Pattern | Code | Description |",
      "| --- | --- | --- |",
      "| Regex Match | `echo \"$&\"` | Matched text |",
      "| Group 1 | `echo \"$1\"` | Capture group |",
      "| Escaped Dollar | `echo \"$$\"` | Literal dollar |",
      "| Post-Match | `echo \"$'\"` | Following text |",
    ].join("\n");

    const rendered = formatMarkdown(markdown);

    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain("echo &quot;$&amp;&quot;");
    expect(rendered).toContain("echo &quot;$1&quot;");
    expect(rendered).toContain("echo &quot;$$&quot;");
    expect(rendered).toContain("echo &quot;$&#39;&quot;");
  });

  it("expands inline code and LaTeX math inside blockquotes", () => {
    const markdown = [
      "> Check the function `computeVelocity(t)`.",
      "> Velocity is defined as $v(t) = \\frac{ds}{dt}$.",
    ].join("\n");

    const rendered = formatMarkdown(markdown);

    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain("<blockquote>");
    expect(rendered).toContain("<code>computeVelocity(t)</code>");
    expect(rendered).toContain('class="math-inline"');
  });

  it("expands code and math inside ordered, unordered, and task lists", () => {
    const markdown = [
      "- [ ] Implement `calculatePayload()` for $x \\in \\mathbb{R}$",
      "- [x] Verified `compile()` step",
      "  1. Inner task with `validateSchema()`",
      "  2. Mathematical convergence: $\\lim_{n \\to \\infty} a_n = 0$",
    ].join("\n");

    const rendered = formatMarkdown(markdown);

    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain('class="markdown-ul"');
    expect(rendered).toContain('class="markdown-ol"');
    expect(rendered).toContain('class="task-checkbox');
    expect(rendered).toContain("<code>calculatePayload()</code>");
    expect(rendered).toContain("<code>compile()</code>");
    expect(rendered).toContain("<code>validateSchema()</code>");
    expect(rendered).toContain('class="math-inline"');
  });

  it("expands hyperlinks containing inline code inside table cells", () => {
    const markdown = [
      "| Method | Documentation |",
      "| --- | --- |",
      "| Fetch | [`fetchClient()`](https://radiance.ai/docs) |",
    ].join("\n");

    const rendered = formatMarkdown(markdown);

    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain('<a href="https://radiance.ai/docs"');
    expect(rendered).toContain("<code>fetchClient()</code>");
  });

  it("handles user content literally containing __RAD_TOK_ without infinite loops", () => {
    const markdown = "Here is a literal token example: `__RAD_TOK_user_example_0__`";
    const rendered = formatMarkdown(markdown);

    expect(rendered).toContain("<code>__RAD_TOK_user_example_0__</code>");
  });
});
```

### 4.4 Test Updates for Existing Suites

1. In `tests/unit/stress-verification.test.ts:85`:
   Change `it.fails("FAILURE MODE 2: preserves inline code and math inside table cells without token leakage", ...)` to `it("preserves inline code and math inside table cells without token leakage", ...)`.
2. In `tests/unit/format-security-adversarial.test.ts:325`:
   The existing failing test will pass immediately.

---

## 5. Verification Method

To independently verify this solution once applied by the worker:

1. **Verify Adversarial Test Suite Passes**:
   ```powershell
   cmd /c npx vitest run tests/unit/format-security-adversarial.test.ts
   ```
   *Expected Result*: 23 of 23 tests pass (100%), 0 failures.

2. **Verify Stress Verification Suite**:
   ```powershell
   cmd /c npx vitest run tests/unit/stress-verification.test.ts
   ```
   *Expected Result*: All tests pass including the un-failed `FAILURE MODE 2`.

3. **Verify Full Unit Test Suite**:
   ```powershell
   cmd /c npm test
   ```
   *Expected Result*: Exit code 0 across all 13 test files.

4. **Verify TypeScript & Linting Invariants**:
   ```powershell
   cmd /c npm run typecheck
   cmd /c npm run lint
   ```
   *Expected Result*: Exit code 0 with zero errors.

5. **Invalidation Conditions**:
   The fix is invalidated if:
   - Any rendered HTML output contains the literal substring `__RAD_TOK_` when inline code or LaTeX math is placed inside table cells or container elements.
   - Any dollar sign pattern such as `$&`, `$1`, `$$`, or `$'` in code blocks or table cells is stripped, expanded, or mangled.
   - An infinite loop occurs when user input literally contains `__RAD_TOK_`.
