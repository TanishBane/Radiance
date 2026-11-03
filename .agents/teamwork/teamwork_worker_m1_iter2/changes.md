# Changes Summary: Milestone 1 Iteration 2 Remediation

## Files Modified

### 1. `src/lib/utils/format.ts`
- **Fixed-Point Token Restoration (`TokenManager.restore()`)**:
  - Replaced single-pass token restoration with bounded iterative fixed-point loop (`while (prev !== result && result.includes("__RAD_TOK_") && passes < maxPasses)`).
  - Unpacks nested tokens (such as inline code `<code>` or LaTeX math `<span class="math-inline">` inside table cells and container blocks) while preserving literal function replacers `() => replacement` to prevent `$`, `$$`, `$&`, `$'`, or `$1` corruption.
- **Parenthesized Markdown URL Support**:
  - Updated hyperlink regex at line 219 from `[^\)\n]` to balanced parentheses expression `/\[([^\n\]]+)\]\(\s*([^()\n]*(?:\((?:[^()\n]|\([^()\n]*\))*\)[^()\n]*)*)\s*\)/g`.
  - Accurately captures URLs with balanced parentheses (e.g., Wikipedia articles `https://en.wikipedia.org/wiki/Function_(mathematics)`) without premature truncation or trailing parenthesis leaks.
- **Single-Column & Multi-Column GFM Table Delimiter**:
  - Replaced multi-column-only delimiter regex with linear-time GFM delimiter matcher:
    ```typescript
    const isDelimiter = Boolean(
      nextLine &&
      nextLine.includes("|") &&
      nextLine.includes("-") &&
      /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(nextLine)
    );
    ```
  - Enforces GFM 4.10 requirement for single-column and multi-column tables, supports column alignments, and is completely immune to ReDoS (0.28 ms on 10,000 characters).

### 2. `tests/unit/stress-verification.test.ts`
- Converted Challenger 1's `it.fails` tests to regular `it` assertions:
  - `FAILURE MODE 1`: Single-column table rendering.
  - `FAILURE MODE 2`: Preservation of inline code and math inside table cells without `__RAD_TOK_` leakage.

### 3. `tests/unit/format.test.ts`
- Added comprehensive unit tests under `GFM Tables with Responsive Wrapper`:
  - Single-column table rendering inside responsive wrapper (`overflow-x-auto`).
  - Column alignment support (`:---:`, `---:`, `:---`) for single-column tables.
  - Rectangularity preservation with uneven cell counts.
  - Horizontal rules not treated as tables.
- Added test suite `Nested Token Restoration & Container Expansion`:
  - Inline code and LaTeX math inside table cells.
  - Preservation of special dollar patterns (`$&`, `$1`, `$$`, `$'`).
  - Inline code and math inside blockquotes and nested/task lists.
  - Hyperlinks containing inline code inside table cells.
  - Safe handling of literal `__RAD_TOK_` in user content without infinite loops.
- Added test suite `Parenthesized Markdown Hyperlinks`:
  - Wikipedia URLs with balanced parentheses.
  - Multiple balanced parentheses pairs.
  - Two-level nested parentheses.
  - Prose enclosing parentheses preservation.
  - Multiple parenthesized hyperlinks on a single line.

## Build and Test Verification
- `npm run typecheck`: Exit code 0, 0 errors.
- `npm run lint`: Exit code 0, 0 warnings or errors.
- `npm test`: Exit code 0, 13 of 13 test files passed, 140 of 140 tests passed (100%).
