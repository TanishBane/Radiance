# Handoff Report: Milestone 1 (Presentation & Typography Engine) — Part A

**Author**: `teamwork_explorer_m1_1`  
**Recipient**: `orchestrator` / `teamwork_implementer_m1`  
**Milestone**: Milestone 1 — Part A: Markdown Parser, Tables, Headings & Streaming Recovery  
**Target Files**: `src/lib/utils/format.ts`, `tests/unit/format.test.ts`, `src/app/globals.css`, `src/components/chat/message-item.tsx`  
**Date**: 2026-11-01  
**Handoff Type**: Hard (Investigation complete, verified via Node prototype test runner)

---

## 1. Observation

### 1.1 Baseline File Inspection: `src/lib/utils/format.ts`
- **Heading Defect**: Lines 51–53 match only `###`, `##`, `#`:
  ```typescript
  51:   .replace(/^### (.+)$/gm, "<h3>$1</h3>")
  52:   .replace(/^## (.+)$/gm, "<h2>$1</h2>")
  53:   .replace(/^# (.+)$/gm, "<h1>$1</h1>")
  ```
  Levels `####`, `#####`, `######` are completely unhandled. The rendered tags have no CSS class names, so Tailwind CSS v4's reset (`@layer base`) renders all headings at identical body font size, line-height, and weight.
- **List & Invalidation Defect**: Lines 59–65 use line-start regexes without indentation capture (`^\s*`), failing on nested lists (`  - item`). Line 65 converts every `\n` to `<br />`:
  ```typescript
  59:   .replace(/^(\d+)\. (.+)$/gm, "<li class=\"ol-item\">$2</li>")
  60:   .replace(/^[-*] (.+)$/gm, "<li class=\"ul-item\">$1</li>")
  61:   .replace(/(<li class="ol-item">.*<\/li>(\n|$))+/g, (m) => `<ol>${m}</ol>`)
  62:   .replace(/(<li class="ul-item">.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
  63:   .replace(/\n/g, "<br />");
  ```
  This injects invalid `<br />` tags directly into `<ul>` and `<ol>`, corrupting HTML semantics and producing irregular vertical spacing.
- **Table Defect**: `format.ts` contains zero table parsing logic. Standard GFM tables (`| col1 | col2 |`) render as raw text with pipe characters and `<br />`.
- **Link Defect**: `format.ts` contains zero hyperlink parsing logic. Markdown links `[label](url)` render as literal text without `<a>` tags.
- **Streaming Code Fence Defect**: Line 22 requires both opening and closing triple backticks:
  ```typescript
  22: let processed = raw.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
  ```
  During live token streaming before the closing fence is emitted, the regex fails to match. The unclosed code block falls through to plain text and line 65 `<br />` injection, resulting in raw backtick flashes and massive Cumulative Layout Shift (CLS).
- **Placeholder & Token Collision Risk**: Lines 21–36 use sequential static placeholders `__RADIANCE_CODE_BLOCK_${idx}__`. In Step 5 (lines 68–73), string replacement `processed.replace(placeholder, block)` interprets JavaScript replacement patterns (`$$`, `$&`, `$1`), corrupting code containing dollar signs (e.g. bash scripts or regexes).

### 1.2 Baseline Verification Execution
- Executed `npm.cmd test -- tests/unit/format.test.ts` via Vitest 3.0.8:
  - Command output: `✓ tests/unit/format.test.ts (4 tests) passed in 3.74s`.
  - All 4 legacy tests (`escapeHtml`, `BUG-02 no double-escaping`, `lists ol/ul`, `formatRelativeTime`) pass on the baseline.

### 1.3 Prototype Test Execution
- Created and executed prototype test runner at `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m1_1\prototype_test.mjs` via `node`:
  - Verified: Headings H1–H6 tags and classes render correctly.
  - Verified: Nested unordered and ordered lists produce valid W3C semantic hierarchy without `<br />` pollution.
  - Verified: Line-based GFM table parsing with column alignment (`:---`, `:---:`, `---:`) and responsive horizontal scroll wrapper (`<div class="table-wrapper overflow-x-auto">`).
  - Verified: Safe hyperlink parsing with `target="_blank" rel="noopener noreferrer"` and protocol whitelist (neutralizing `javascript:` and `data:` URIs).
  - Verified: Streaming unclosed code fence recovery renders immediately in `<div class="code-block-wrapper"><pre><code>` with zero raw backtick flash.
  - Verified: Dollar sign preservation in code blocks using `() => block` replacer functions.
  - Verified: 100% pass on all 4 regression tests.

---

## 2. Logic Chain

1. **Heading Hierarchy**: From Observation 1.1, headings lack H4–H6 matchers and CSS classes. Replacing the 3 individual regexes with `/^(#{1,6})\s+(.+?)(?:\s+#+)?$/gm` captures levels 1–6 dynamically. Emitting `<h${level} class="markdown-h${level}">${text.trim()}</h${level}>` couples with CSS typography tokens in `globals.css` to re-establish modular typographic hierarchy and proper proportional spacing.
2. **List Parsing & Nesting**: From Observation 1.1, regex replacement cannot track nesting depth. Implementing a line-by-line scanner with an indentation stack (`listStack: Array<{ type: 'ul' | 'ol', indent: number }>`) guarantees that child lists are placed inside parent `<li>` elements, task list markers (`[ ]`, `[x]`) are converted to disabled checkboxes, and no stray `<br />` tags are inserted.
3. **GFM Tables & Mobile Responsiveness**: From Observation 1.1, tables are unparsed. Implementing a line-based table scanner before general text escaping extracts table headers, delimiter rows, and data rows. Generating `<div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]">` ensures that wide tables scroll horizontally without clipping or blowing out mobile chat bubbles (375px viewport constraint).
4. **Safe Hyperlinks**: From Observation 1.1, links are ignored. Matching `\[([^\n\]]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+|\/[^\s\)]+|#[^\s\)]+|[^\s\)]+)\)` with a strict protocol whitelist (`isSafeUrl`) guarantees that `javascript:alert(1)` and `data:text/html` are rendered as inert `<span class="unsafe-link">` elements while valid URLs are rendered with `target="_blank" rel="noopener noreferrer"`.
5. **Streaming Resilience**: From Observation 1.1, unclosed fences during inference break rendering. Counting code fences with `content.match(/(?:^|\n)\s*```/g)` detects odd counts. Appending `\n``` ` auto-closes the active fence before the extractor runs. When the user watches tokens stream, the code container appears immediately upon receiving the opening fence, eliminating layout jumps.
6. **Dollar Sign & Collision Safety**: From Observation 1.1, string replacement mangles `$`. Using randomized non-printable tokens (`\x1aRD_CB_${salt}_`) and function replacers `replace(token, () => block)` guarantees zero placeholder collisions and prevents regex `$n` pattern expansion.

---

## 3. Caveats

1. **Syntax Highlighting & LaTeX/KaTeX Scope Separation**: This Part A analysis specifically designs the markdown parsing engine (headings, lists, tables, links, streaming recovery). Syntax highlighting tokenization (Prism/Shiki) and KaTeX math expressions are investigated by explorers 2 and 3 and can be cleanly integrated into the code block and inline extraction phases.
2. **CSS Integration Requirement**: The new heading, table, and link classes (`markdown-h1`–`markdown-h6`, `table-wrapper`, `markdown-table`, `markdown-link`) require the companion CSS rules documented in `analysis.md` to be appended to `src/app/globals.css`.
3. **Caller Integration**: In `src/components/chat/message-item.tsx:146`, the call to `formatMarkdown(message.content)` should be updated to `formatMarkdown(message.content, { isStreaming })` for full stream awareness.

---

## 4. Conclusion

The proposed implementation in `analysis.md` completely resolves all Part A requirements:
- Headings H1–H6 with modular semantic tags and proportional spacing.
- Nested ordered and unordered lists with task checkboxes and valid W3C DOM structure.
- CommonMark/GFM table parsing with column alignment and responsive horizontal overflow wrapper.
- Safe hyperlinks with `target="_blank" rel="noopener noreferrer"` and protocol security whitelist.
- Streaming-tolerant markdown auto-closing incomplete fences to eliminate raw backtick flash.
- 100% backward compatibility with existing tests and verified immunity to token collision / `$` mangling bugs.

The exact code implementation is ready for drop-in implementation into `src/lib/utils/format.ts` and `tests/unit/format.test.ts`.

---

## 5. Verification Method

### 5.1 Unit Test Verification
1. Open `tests/unit/format.test.ts` and add the 14 new test cases provided in `analysis.md:Section 5`.
2. Execute the test command in workspace terminal:
   ```powershell
   npm.cmd test -- tests/unit/format.test.ts
   ```
3. Pass criteria:
   - All 4 legacy tests pass.
   - All 14 new tests pass with zero failures.
   - Total test suite duration < 5 seconds.

### 5.2 Typecheck & Lint Verification
1. Run TypeScript check:
   ```powershell
   npm.cmd run typecheck
   ```
   Pass criteria: Exit code 0, zero diagnostic errors.
2. Run ESLint:
   ```powershell
   npm.cmd run lint
   ```
   Pass criteria: Exit code 0, zero warnings or errors.

### 5.3 Invalidation Conditions
- If `npm.cmd test` fails on any legacy test (e.g. `does NOT double-escape code blocks`), verify that HTML escaping order in `formatMarkdown` preserves code block placeholders before `escapeHtml(processed)`.
- If an unclosed code block flashes raw backticks during active inference, verify that `isFenceOpen` calculation in `formatMarkdown` correctly evaluates `fenceMatches.length % 2 === 1`.
