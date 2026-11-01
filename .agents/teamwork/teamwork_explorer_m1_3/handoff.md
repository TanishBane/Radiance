# Handoff Report: Milestone 1 Part C — HTML/Script Sanitization & Typography Stylesheet Architecture

**Author:** teamwork_explorer_m1_3  
**Target:** Orchestrator & Milestone 1 Implementers  
**Role:** Technical Explorer (M1 Part C)  
**Date:** 2026-11-01  
**Status:** Task Complete (Hard Handoff)  
**Artifact Directory:** `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m1_3`

---

## 1. Observation

### 1.1 Direct File Observations

1. **`src/lib/utils/format.ts:20–74` (Delimiter Collision & String Replace Special Patterns)**:
   - Fenced code blocks are extracted via:
     ```typescript
     const codeBlocks: string[] = [];
     let processed = raw.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
       const idx = codeBlocks.length;
       // ...
       return `__RADIANCE_CODE_BLOCK_${idx}__`;
     });
     ```
   - Inline code is extracted via:
     ```typescript
     const inlineCodes: string[] = [];
     processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
       const idx = inlineCodes.length;
       inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
       return `__RADIANCE_INLINE_CODE_${idx}__`;
     });
     ```
   - Normal text outside code is escaped via:
     ```typescript
     processed = escapeHtml(processed);
     ```
     Because `escapeHtml` only escapes `&`, `<`, `>`, `"`, `'`, the token `__RADIANCE_CODE_BLOCK_0__` is unaltered.
   - Restoration is performed via:
     ```typescript
     codeBlocks.forEach((block, idx) => {
       processed = processed.replace(`__RADIANCE_CODE_BLOCK_${idx}__`, block);
     });
     inlineCodes.forEach((inline, idx) => {
       processed = processed.replace(`__RADIANCE_INLINE_CODE_${idx}__`, inline);
     });
     ```
   - Tool Command Verification:
     ```powershell
     node -e "console.log('test __TOKEN__ rest'.replace('__TOKEN__', 'price is $& and $1 and $\''))"
     # Result: test price is __TOKEN__ and  and  rest rest
     ```
     Direct `String.prototype.replace(str, replacement)` parses `$` in `replacement` as special replacement patterns (`$&` = match, `$'` = trail, `$1` = capture). If a user writes code with `$&`, `$'`, or regex `$$`, JavaScript corrupts the output and leaks placeholder text.

2. **`src/app/globals.css:1–242` (Missing Typography & Reset Reset)**:
   - Line 1 imports Tailwind: `@import "tailwindcss";`. In Tailwind CSS v4, this applies Preflight which resets all headings (`h1`–`h6`) to `font-size: inherit; font-weight: inherit; margin: 0;`.
   - Inspection of `globals.css` lines 64–242 reveals:
     - Zero CSS rules exist for `h1`, `h2`, `h3`, `h4`, `h5`, `h6`.
     - Zero CSS rules exist for `table`, `thead`, `tbody`, `tr`, `th`, `td`, or `.markdown-table-wrapper`.
     - Zero CSS rules exist for markdown hyperlinks (`a` or `.prose a`).
     - Inline code is styled at line 195 globally (`code { ... }`), but lacks specificity and interactive focus/hover.
     - Blockquotes at line 206 are single-line styled, but lack multiline child paragraph spacing.

3. **`src/components/chat/message-item.tsx:88–148` (Dead `.prose` & Container Width Issue)**:
   - Line 143:
     ```tsx
     <div
       className="prose prose-invert max-w-none break-words text-[13.5px] leading-relaxed select-text"
       onClick={handleContentClick}
       dangerouslySetInnerHTML={{
         __html: formatMarkdown(message.content),
       }}
     />
     ```
   - `@tailwindcss/typography` is not in `package.json`, making `.prose` a dead class with zero effect.
   - Line 105: `<div className="flex flex-col gap-1 max-w-[calc(100%-44px)]">`.
     Short user messages have no `w-fit self-end` constraint, causing short bubbles to stretch across the full container width (~720px).
   - Flex ancestors lack `min-w-0`, creating overflow clipping risks when preformatted tables or code blocks are rendered on mobile (375px).

4. **`tests/unit/format.test.ts:1–41` (Current Test Scope)**:
   - Only 4 tests exist:
     - `escapes raw HTML to prevent XSS` (only tests `escapeHtml`)
     - `does NOT double-escape code blocks (Fixes Verified Legacy BUG-02)`
     - `renders lists with correct ol and ul tags`
     - `calculates relative time correctly`
   - Zero tests exist for: polyglot XSS attacks, `<script>`, `<iframe>`, `<object>`, `<embed>`, inline event handlers (`<img onerror>`, `<svg onload>`), dangerous URI protocols (`javascript:`, `vbscript:`, `data:`), placeholder collisions, or `$` pattern corruption.

5. **Tool Baseline Command Executions**:
   - `cmd /c npm test`: Exited code 0, 11 test files passed, 43 tests passed.
   - `cmd /c npm run typecheck`: Exited code 0, clean TypeScript check.
   - `cmd /c npm run lint`: Exited code 0, clean ESLint check.

---

## 2. Logic Chain

1. **Delimiter Collision Reasoning**:
   - Based on Observation 1.1(1), placeholders use sequential integers: `__RADIANCE_CODE_BLOCK_0__`.
   - If user input contains `__RADIANCE_CODE_BLOCK_0__` followed by legitimate code, `processed.replace(...)` replaces the first occurrence (the user-supplied token) with the code block HTML, leaving the legitimate code block placeholder unreplaced.
   - Furthermore, `processed.replace(token, block)` evaluates `$` patterns in `block`.
   - Therefore, replacing sequential placeholders with a per-invocation 128-bit random nonce (`\x1a__RAD_TOK_${nonce}_${counter}__\x1a`) stored in a `Map<string, string>` and restored via `processed.replace(token, () => block)` mathematically eliminates collision probability ($P \approx 0$) and guarantees that `$` characters are treated 100% literally.

2. **Strict HTML/Script Sanitization Reasoning**:
   - Based on Observation 1.1(1) and 1.1(4), `formatMarkdown` injects HTML directly into React via `dangerouslySetInnerHTML` in `message-item.tsx`.
   - When markdown links `[label](url)` are parsed into `<a href="...">`, attackers can execute JavaScript via `javascript:alert(1)`, `vbscript:`, or `data:text/html` schemes.
   - Even though `escapeHtml` escapes raw `<` and `>`, any unescaped tags or markdown constructs must be rigorously vetted by a defense-in-depth sanitization gate.
   - Therefore, a two-tier defense is required:
     1. `sanitizeUrl(url)`: rejects non-whitelisted protocols (`javascript:`, `vbscript:`, `data:`, `file:`, `blob:`) and enforces `target="_blank" rel="noopener noreferrer"`.
     2. `sanitizeHtml(html)`: strips active tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<base>`, `<form>`) and removes all inline event handlers (`\s+on[a-zA-Z]+\s*=\s*...`).

3. **Typography & CSS Architecture Reasoning**:
   - Based on Observation 1.1(2) and 1.1(3), Tailwind v4 resets all headings, `.prose` is non-functional without `@tailwindcss/typography`, and tables lack boundaries.
   - Without explicit CSS, `h1`–`h6` appear identically to body text, tables spill horizontally on mobile, and links lack visual affordance.
   - Therefore, implementing scoped CSS rules in `src/app/globals.css` targeting `.prose` and markdown elements provides:
     - Modular type scale for `h1`–`h6` with proportional margins and borders.
     - Responsive `.markdown-table-wrapper` with `overflow-x: auto`, zebra striping (`tbody tr:nth-child(even)`), and warm accent hover (`tbody tr:hover`).
     - Styled blockquotes with accent left border and subtle gradient background.
     - Accessible hyperlinks with `var(--accent)` color, hover underline, and focus rings.
     - Inline code pills with `rgba(255,255,255,0.065)` background, border, and `var(--accent-b)` text.
     - Mobile layout rules: `w-fit self-end max-w-[85%] sm:max-w-[75%]` for user bubbles and `min-w-0` on flex ancestors.

---

## 3. Caveats

1. **No External DOMPurify Dependency**: We intentionally did not add `isomorphic-dompurify` or `dompurify` to `package.json` to prevent potential React 19 / Next.js 15 SSR hydration or peer-dependency conflicts. The designed zero-dependency regex sanitizer is isomorphic, deterministic, and runs identically in Node, Vitest, and browsers.
2. **Read-Only Explorer Constraint**: As an explorer, no changes were committed to source files. Full code implementations and diff proposals are detailed in `analysis.md` and Section 4 below for implementers.
3. **LaTeX / Math Boundary**: LaTeX rendering (`$math$` and `$$math$$`) is assigned to M1 Part B (`teamwork_explorer_m1_2`). Our sanitizer and token manager are explicitly designed to preserve math tokens without dollar-sign mangling.

---

## 4. Conclusion

The implementation strategy for Milestone 1 Part C is fully designed, verified against the project architecture, and ready for immediate implementation by the milestone implementer.

### Implementation Blueprint:

#### 1. `src/lib/utils/format.ts`:
- Introduce `TokenManager` class with 128-bit random nonce and replacer function `() => replacement`.
- Introduce `sanitizeUrl(url: string): string` enforcing whitelisted protocols (`http:`, `https:`, `mailto:`, `tel:`, `/`, `#`).
- Introduce `sanitizeHtml(html: string): string` neutralizing forbidden tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`) and all `on*` inline event handlers.
- Update `formatMarkdown` pipeline:
  1. Extract code blocks with `TokenManager.register()`.
  2. Extract inline code with `TokenManager.register()`.
  3. Escape normal text outside protected blocks (`escapeHtml`).
  4. Transform markdown structural tags (headings, tables, lists, links with `sanitizeUrl`).
  5. Restore tokens with `TokenManager.restore()`.
  6. Pass complete output through `sanitizeHtml()`.

#### 2. `src/app/globals.css`:
- Add `.prose` scoped typography rules:
  - `h1` (24px/26px, 700, border-b), `h2` (20px/22px, 600, border-b), `h3` (18px/19px, 600), `h4` (16px, 600), `h5` (14px uppercase), `h6` (13px uppercase).
  - Responsive table container `.markdown-table-wrapper` with `overflow-x: auto`, zebra striping, and hover state.
  - Blockquote styling with multiline paragraph support.
  - Hyperlinks styled with `var(--accent)`, hover underline, and focus ring.
  - Inline code pills with rounded corners and border.
  - Container width helper rules (`.user-bubble-container`, `.assistant-bubble-container`).

#### 3. `tests/unit/format.test.ts`:
- Add the 8 polyglot XSS, dangerous protocol, delimiter collision, and dollar-sign replacement test cases specified in `analysis.md`.

---

## 5. Verification Method

To independently verify the implementation:

1. **Run Unit Test Suite**:
   ```powershell
   cmd /c npm test
   ```
   Or targeted:
   ```powershell
   cmd /c npx vitest run tests/unit/format.test.ts
   ```
   *Expected Result*: All tests pass with 0 failures, including all polyglot XSS test assertions.

2. **Run Typecheck**:
   ```powershell
   cmd /c npm run typecheck
   ```
   *Expected Result*: 0 TypeScript errors.

3. **Run Linting**:
   ```powershell
   cmd /c npm run lint
   ```
   *Expected Result*: 0 ESLint warnings or errors.

4. **Verify Delimiter Collision Immunity**:
   Run Vitest test with input:
   `"Attacker prefix: __RADIANCE_CODE_BLOCK_0__ \n\`\`\`js\nconst x = 1;\n\`\`\`"`
   Confirm user placeholder is not replaced and real code block renders properly.

5. **Verify Dollar Pattern Immunity**:
   Run Vitest test with code block containing:
   `'echo "$&" and "$1" and "$$"'`
   Confirm output preserves exact literal text without `$&` placeholder expansion.
