# Technical Analysis: Presentation & Typography Engine (Part A)
**Subagent:** `teamwork_explorer_m1_1`  
**Milestone:** Milestone 1 — Part A: Markdown Parser, Tables, Headings & Streaming Recovery  
**Target Codebase:** `src/lib/utils/format.ts`, `tests/unit/format.test.ts`, `src/app/globals.css`, `src/components/chat/message-item.tsx`  
**Date:** 2026-11-01  
**Integrity Mode:** Development  

---

## 1. Executive Summary

A comprehensive, read-only architectural investigation was performed on the Radiance AI formatting engine. The current implementation (`src/lib/utils/format.ts`) utilizes a 99-line handwritten regex replacement pipeline. While this baseline resolved a historical double-escaping bug (`BUG-02`), it possesses five critical functional and architectural deficiencies:

1. **Incomplete Heading Scale**: Only `#`, `##`, and `###` are recognized. Levels `####` through `######` remain unparsed, and rendered headings lack semantic CSS classes, causing Tailwind v4 reset styles to flatten all headings to identical unstyled body text.
2. **Brittle Lists & Zero Nesting**: Nested lists are completely unsupported. Indented items (`  - item`) fail regex matches, while global `\n` to `<br />` conversion injects invalid `<br />` elements inside `<ul>` and `<ol>`, corrupting HTML structure.
3. **Missing Table Support**: GitHub Flavored Markdown (GFM) pipe tables (`| col |`) are completely unhandled, rendering as raw pipe-separated text with `<br />` breaks. No responsive horizontal scroll wrapper exists.
4. **Missing Hyperlink Parsing & Security Whitelist**: Standard markdown links `[label](url)` are ignored and output as plain text. Furthermore, there is no URL scheme validation to neutralize dangerous protocols (`javascript:`, `data:`, `vbscript:`).
5. **Streaming Code Block Breakdown**: The regex requires matching closing fences (` ``` `). During live token generation, unclosed code blocks fail to match, causing raw backticks and unformatted code to flash in the chat bubble until generation finishes, inducing jarring Cumulative Layout Shift (CLS).
6. **Vulnerability to Token Collisions and Dollar Sign Mangling**: The placeholder tokens (`__RADIANCE_CODE_BLOCK_${idx}__`) are predictable, and restoring them via `String.prototype.replace(string, block)` interprets `$` characters in user code (e.g., `$1`, `$$` in bash/regex), corrupting code content.

To resolve these defects while preserving sub-millisecond synchronous parse performance, zero external runtime dependency overhead, and full backward compatibility with Next.js 15 and React 19, this report designs a **hardened, streaming-tolerant tokenizer and parsing engine** for `src/lib/utils/format.ts` accompanied by a comprehensive Vitest unit test suite.

---

## 2. Baseline Code Audit & Defect Root Causes

### 2.1 File: `src/lib/utils/format.ts`
Current flow in `formatMarkdown(raw: string)`:
```typescript
// Step 1: Extract code blocks
processed = raw.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, ...); // Requires closing fence
// Step 2: Extract inline code
processed = processed.replace(/`([^`\n]+)`/g, ...);
// Step 3: Escape normal text
processed = escapeHtml(processed);
// Step 4: Structural replacements
processed = processed
  .replace(/^### (.+)$/gm, "<h3>$1</h3>") // H1-H3 only, no classes
  .replace(/^## (.+)$/gm, "<h2>$1</h2>")
  .replace(/^# (.+)$/gm, "<h1>$1</h1>")
  .replace(/^---$/gm, "<hr />")
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.+?)\*/g, "<em>$1</em>")
  .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
  .replace(/^(\d+)\. (.+)$/gm, '<li class="ol-item">$2</li>')
  .replace(/^[-*] (.+)$/gm, '<li class="ul-item">$1</li>')
  .replace(/(<li class="ol-item">.*<\/li>(\n|$))+/g, (m) => `<ol>${m}</ol>`)
  .replace(/(<li class="ul-item">.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
  .replace(/\n/g, "<br />"); // Injects invalid <br/> inside lists and after headers
// Step 5: Restore placeholders
```

### 2.2 Root Cause Analysis

| Component | Defect Mechanism | Impact |
|---|---|---|
| **Headings H1–H6** | Lines 51–53 match only 1–3 hashes. No matchers for 4–6 hashes. Output has no class names (`<h3>` instead of `<h3 class="markdown-h3">`). | H4–H6 render as literal markdown `#### Text`. Because Tailwind v4 resets all headings, H1–H3 render with no font scaling, no line-height, and no margins. |
| **Lists & Nesting** | Lines 59–61 use `^` without leading whitespace matching (`^\s*`). Nesting is discarded. Line 65 converts all `\n` to `<br />`. | Nested lists break into plain text. `<ol>` and `<ul>` contain direct `<br />` children, violating W3C HTML5 specs and producing uneven spacing. |
| **Tables** | Zero table matching logic. | GFM tables render as raw text: `| Col 1 | Col 2 |<br />|---|---|`. On mobile, long rows overflow without scrolling. |
| **Hyperlinks** | Zero link matching logic. | `[Radiance](https://radiance.ai)` renders as plain text. |
| **Streaming Recovery** | Line 22 regex ````([a-zA-Z0-9_-]*)\n?([\s\S]*?)``` ` strictly requires opening and closing fences. | During token streaming, unclosed code blocks fail to match regex, displaying raw backticks and plain text until the stream completes. |
| **Token Collision & `$` Mangling** | Step 1 uses static string `__RADIANCE_CODE_BLOCK_${idx}__`. Step 5 uses `processed.replace(placeholder, block)`. | User input containing `__RADIANCE_CODE_BLOCK_0__` triggers token collision. Strings in code blocks containing `$1` or `$$` are mangled by JS regex replacement pattern expansion. |

---

## 3. Detailed Architecture & Design Specifications

### 3.1 Streaming Code Fence Auto-Closure & Recovery
To eliminate raw backtick flash and layout jumps during active token streaming:

#### Mechanism:
Before code block extraction, detect if the markdown input ends with an open (unclosed) code fence.
1. Match all fence delimiters beginning at start of text or after a newline: `/(?:^|\n)\s*```/g`.
2. If the delimiter count is odd (`fenceMatches.length % 2 === 1`), the final code fence has not been closed.
3. Check if a newline exists after the last ` ``` ` (e.g., ` ```typescript ` vs ` ```typescript\nconst a = 1; `).
4. If no newline exists yet, append `\n``` `. If content is already present, append `\n``` ` (or ` ``` ` if trailing newline exists).
5. The downstream code block extractor immediately matches the balanced fence, wrapping the partial tokens inside `<div class="code-block-wrapper"><pre><code>` from the very first streamed token!

#### Interface Contract:
```typescript
export interface FormatMarkdownOptions {
  isStreaming?: boolean;
}

export function formatMarkdown(raw: string, options?: FormatMarkdownOptions): string;
```
*Note:* Auto-closure runs both when `options?.isStreaming === true` and automatically as a fallback whenever an unclosed fence is detected at EOF (protecting aborted/truncated generations).

---

### 3.2 Headings H1–H6 with Modular Semantic Tags
CommonMark heading syntax supports 1 to 6 `#` characters followed by at least one space, with optional trailing `#` characters.

#### Implementation:
```typescript
processed = processed.replace(/^(#{1,6})\s+(.+?)(?:\s+#+)?$/gm, (_, hashes, text) => {
  const level = hashes.length;
  return `<h${level} class="markdown-h${level}">${text.trim()}</h${level}>`;
});
```

#### Typography Scale & Gestalt Spacing (`src/app/globals.css`):
```css
/* ══ MARKDOWN HEADING SCALE & PROPORTIONAL SPACING ══ */
.markdown-h1 {
  font-size: 1.45rem;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--txt);
  margin-top: 1.25rem;
  margin-bottom: 0.6rem;
}
.markdown-h2 {
  font-size: 1.25rem;
  font-weight: 650;
  line-height: 1.35;
  letter-spacing: -0.015em;
  color: var(--txt);
  margin-top: 1.1rem;
  margin-bottom: 0.5rem;
}
.markdown-h3 {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--txt);
  margin-top: 0.95rem;
  margin-bottom: 0.45rem;
}
.markdown-h4 {
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--txt);
  margin-top: 0.85rem;
  margin-bottom: 0.4rem;
}
.markdown-h5 {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--txt-dim);
  margin-top: 0.75rem;
  margin-bottom: 0.35rem;
}
.markdown-h6 {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--txt-muted);
  margin-top: 0.65rem;
  margin-bottom: 0.3rem;
}

/* Eliminate awkward top margin when heading is the first element */
.markdown-h1:first-child,
.markdown-h2:first-child,
.markdown-h3:first-child,
.markdown-h4:first-child,
.markdown-h5:first-child,
.markdown-h6:first-child {
  margin-top: 0;
}
```

---

### 3.3 Nested Ordered and Unordered Lists
To prevent invalid `<br />` injection and support arbitrary nesting depths and mixed list types (`ul` inside `ol` and vice versa), we employ a **stack-based line scanner**:

#### Algorithm:
1. Scan lines for list item prefixes:
   - Unordered: `/^(\s*)([-*+])\s+(.*)$/`
   - Ordered: `/^(\s*)(\d+)\.\s+(.*)$/`
2. Maintain a stack `listStack: Array<{ type: 'ul' | 'ol', indent: number }>`.
3. Indentation handling:
   - `indent > stack.top.indent`: Open nested `<ul/ol>` within current `<li>`.
   - `indent < stack.top.indent`: Pop and close nested lists until matching level.
   - `indent === stack.top.indent`: Close previous `</li>` and open new `<li>`. If list type differs, close old list and open new.
4. Support task lists:
   - Detect `[ ] ` -> render `<input type="checkbox" disabled class="task-checkbox mr-2 align-middle" />`
   - Detect `[x] ` or `[X] ` -> render `<input type="checkbox" disabled checked class="task-checkbox mr-2 align-middle" />`
5. On encountering non-list text: Close all open tags in stack.

#### Resulting Semantic Structure:
```html
<ul class="markdown-ul">
  <li class="ul-item">Parent Item
    <ul class="markdown-ul">
      <li class="ul-item">Nested Child A</li>
      <li class="ul-item">Nested Child B</li>
    </ul>
  </li>
  <li class="ul-item">Parent Item 2</li>
</ul>
```

---

### 3.4 Markdown Table Parsing (GFM Syntax) & Horizontal Scroll Wrapper

#### Parsing Architecture:
Tables are parsed via line-based scanning before general text escaping to protect table structure.
1. **Detection**: Line containing `|` followed immediately by a delimiter line matching `/^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/`.
2. **Cell Splitting**: Split rows by `|`, accounting for escaped pipes (`\|`).
3. **Alignment Extraction**: Delimiter cells evaluated:
   - `:---:` -> `text-align: center`
   - `---:` -> `text-align: right`
   - `:---` or `---` -> `text-align: left`
4. **Cell Formatting**: Each cell is sanitized with `escapeHtml` and formatted for inline markdown (`**bold**`, `*italic*`, links, code).
5. **Responsive DOM Wrapper**:
   ```html
   <div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]">
     <table class="markdown-table w-full border-collapse text-left text-xs sm:text-sm">
       <thead class="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold">
         <tr>
           <th class="px-3.5 py-2.5" style="text-align: left">Col 1</th>
           <th class="px-3.5 py-2.5" style="text-align: center">Col 2</th>
         </tr>
       </thead>
       <tbody class="divide-y divide-[var(--border)] text-[var(--txt-dim)]">
         <tr class="hover:bg-[var(--surface-hover)] transition-colors">
           <td class="px-3.5 py-2" style="text-align: left">Data 1</td>
           <td class="px-3.5 py-2" style="text-align: center">Data 2</td>
         </tr>
       </tbody>
     </table>
   </div>
   ```
6. **Horizontal Scroll Guarantee**: On mobile screens (e.g. 375px), `.table-wrapper` with `overflow-x-auto` allows wide tables to scroll horizontally inside the message bubble without forcing viewport overflow or clipping.

---

### 3.5 Safe Hyperlink Parsing & Protocol Whitelist
Markdown links `[label](url)` are parsed with strict security enforcement.

#### Security Policy:
- **Allowed Schemes**: `https://`, `http://`, `mailto:`, relative paths (`/path`, `#hash`).
- **Disallowed Schemes**: `javascript:`, `data:`, `vbscript:`, `file:`.
- If an unsafe scheme is detected, the URL is rejected and rendered as an inert `<span class="unsafe-link">${label}</span>`.
- All safe links are rendered with `target="_blank" rel="noopener noreferrer"` to prevent tab-napping and referrer leaks.
- All URL attributes are strictly sanitized via `escapeHtml(url)` to prevent attribute breakout attacks (e.g. `[link](https://test.com" onclick="alert(1))`).

#### Output HTML:
```html
<a href="https://tanixai.org" target="_blank" rel="noopener noreferrer" class="markdown-link">
  Link Text
</a>
```

---

### 3.6 Collision-Resistant Placeholders & `$` Replacement Safety
To permanently eliminate placeholder hijacking and `$` token mangling:
1. Generate per-invocation randomized non-printable tokens:
   ```typescript
   const salt = Math.random().toString(36).slice(2, 8);
   const BLOCK_TOKEN = `\x1aRD_CB_${salt}_`;
   const INLINE_TOKEN = `\x1aRD_INL_${salt}_`;
   const TABLE_TOKEN = `\x1aRD_TBL_${salt}_`;
   ```
2. Restore placeholders using JavaScript replacer functions `() => block`:
   ```typescript
   tables.forEach((table, idx) => {
     processed = processed.replace(`${TABLE_TOKEN}${idx}`, () => table);
   });
   inlineCodes.forEach((inline, idx) => {
     processed = processed.replace(`${INLINE_TOKEN}${idx}`, () => inline);
   });
   codeBlocks.forEach((block, idx) => {
     processed = processed.replace(`${BLOCK_TOKEN}${idx}`, () => block);
   });
   ```
   *Rationale:* Using `() => block` completely bypasses JavaScript's string replacement pattern substitution where `$$`, `$&`, and `$1` would otherwise be mangled.

---

## 4. Proposed Code Implementation for `src/lib/utils/format.ts`

```typescript
/**
 * Escapes raw HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Validates that a hyperlink URL uses a safe protocol.
 * Rejects javascript:, data:, vbscript:, etc.
 */
function isSafeUrl(url: string): boolean {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (trimmed.startsWith("mailto:")) return true;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  return false;
}

export interface FormatMarkdownOptions {
  isStreaming?: boolean;
}

/**
 * Formats markdown into safe HTML without double-escaping entities in code blocks.
 * Supports H1-H6, nested lists, GFM tables, safe hyperlinks, and streaming code fence recovery.
 */
export function formatMarkdown(raw: string, options?: FormatMarkdownOptions): string {
  if (!raw) return "";

  let content = raw;

  // 1. Streaming Code Fence Recovery
  // Detect unclosed code block fences and close them so they render cleanly during inference
  const fenceMatches = content.match(/(?:^|\n)\s*```/g);
  const isFenceOpen = fenceMatches && fenceMatches.length % 2 === 1;

  if (isFenceOpen) {
    const lastFenceIdx = content.lastIndexOf("```");
    const afterLastFence = content.slice(lastFenceIdx + 3);
    if (!afterLastFence.includes("\n")) {
      content = content + "\n```";
    } else {
      content = content + (content.endsWith("\n") ? "```" : "\n```");
    }
  }

  // Generate collision-resistant unique tokens for this pass
  const salt = Math.random().toString(36).slice(2, 8);
  const BLOCK_TOKEN = `\x1aRD_CB_${salt}_`;
  const INLINE_TOKEN = `\x1aRD_INL_${salt}_`;
  const TABLE_TOKEN = `\x1aRD_TBL_${salt}_`;

  // 2. Extract fenced code blocks
  const codeBlocks: string[] = [];
  let processed = content.replace(/(?:^|\n)```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escapedCode = escapeHtml(code.trimEnd());
    const langAttr = lang ? ` data-language="${escapeHtml(lang)}"` : "";
    codeBlocks.push(
      `<div class="code-block-wrapper"${langAttr}>` +
        `<div class="code-block-header">` +
          `<span class="code-block-lang">${escapeHtml(lang || "code")}</span>` +
          `<button class="code-copy-btn" data-code="${escapeHtml(code.trimEnd())}">Copy</button>` +
        `</div>` +
        `<pre><code>${escapedCode}</code></pre>` +
      `</div>`
    );
    return `\n${BLOCK_TOKEN}${idx}\n`;
  });

  // 3. Extract inline code
  const inlineCodes: string[] = [];
  processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `${INLINE_TOKEN}${idx}`;
  });

  // Helper for inline markdown (bold, italic, links)
  const formatInline = (str: string): string => {
    return str
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(
        /\[([^\n\]]+)\]\((https?:\/\/[^\s\)]+|mailto:[^\s\)]+|\/[^\s\)]+|#[^\s\)]+|[^\s\)]+)\)/g,
        (_, label, url) => {
          if (isSafeUrl(url)) {
            const safeUrl = escapeHtml(url.trim());
            return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="markdown-link">${label}</a>`;
          }
          return `<span class="unsafe-link">${label}</span>`;
        }
      );
  };

  // 4. Extract and parse Markdown Tables (GFM syntax)
  const tables: string[] = [];
  const lines = processed.split("\n");
  const nonTableLines: string[] = [];
  let lineIdx = 0;

  const splitCells = (line: string): string[] =>
    line
      .replace(/\\\|/g, "\x1bPIPE\x1b")
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((c) => c.replace(/\x1bPIPE\x1b/g, "|").trim());

  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    const nextLine = lines[lineIdx + 1];
    const isDelimiter = nextLine && /^\s*\|?(\s*:?-+:?\s*\|)+\s*:?-+:?\s*\|?\s*$/.test(nextLine);

    if (line.includes("|") && isDelimiter) {
      const tableLines: string[] = [line, nextLine];
      lineIdx += 2;
      while (lineIdx < lines.length && lines[lineIdx].includes("|") && lines[lineIdx].trim() !== "") {
        tableLines.push(lines[lineIdx]);
        lineIdx++;
      }

      const headerCells = splitCells(tableLines[0]);
      const delimiterCells = splitCells(tableLines[1]);

      const alignments = delimiterCells.map((d) => {
        const left = d.startsWith(":");
        const right = d.endsWith(":");
        if (left && right) return "center";
        if (right) return "right";
        if (left) return "left";
        return "left";
      });

      let theadHtml = "<tr>";
      headerCells.forEach((cell, i) => {
        const align = alignments[i] || "left";
        const formatted = formatInline(escapeHtml(cell));
        theadHtml += `<th class="px-3.5 py-2.5" style="text-align: ${align}">${formatted}</th>`;
      });
      theadHtml += "</tr>";

      let tbodyHtml = "";
      for (let r = 2; r < tableLines.length; r++) {
        const rowCells = splitCells(tableLines[r]);
        tbodyHtml += `<tr class="hover:bg-[var(--surface-hover)] transition-colors">`;
        headerCells.forEach((_, i) => {
          const align = alignments[i] || "left";
          const cellVal = rowCells[i] !== undefined ? rowCells[i] : "";
          const formatted = formatInline(escapeHtml(cellVal));
          tbodyHtml += `<td class="px-3.5 py-2" style="text-align: ${align}">${formatted}</td>`;
        });
        tbodyHtml += `</tr>`;
      }

      const tableHtml =
        `<div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]">` +
          `<table class="markdown-table w-full border-collapse text-left text-xs sm:text-sm">` +
            `<thead class="bg-[var(--surface-raised)] border-b border-[var(--border)] text-[var(--txt)] font-semibold">${theadHtml}</thead>` +
            `<tbody class="divide-y divide-[var(--border)] text-[var(--txt-dim)]">${tbodyHtml}</tbody>` +
          `</table>` +
        `</div>`;

      const tIdx = tables.length;
      tables.push(tableHtml);
      nonTableLines.push(`${TABLE_TOKEN}${tIdx}`);
    } else {
      nonTableLines.push(line);
      lineIdx++;
    }
  }

  processed = nonTableLines.join("\n");

  // 5. Escape HTML in regular text
  processed = escapeHtml(processed);

  // 6. Headings H1–H6 with modular semantic tags
  processed = processed.replace(/^(#{1,6})\s+(.+?)(?:\s+#+)?$/gm, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level} class="markdown-h${level}">${text.trim()}</h${level}>`;
  });

  // 7. Horizontal Rules
  processed = processed.replace(/^---$/gm, '<hr class="markdown-hr" />');

  // 8. Blockquotes
  processed = processed.replace(/^&gt;\s*(.+)$/gm, "<blockquote>$1</blockquote>");

  // 9. Nested Ordered & Unordered Lists
  const listLines = processed.split("\n");
  const resultLines: string[] = [];
  const listStack: Array<{ type: "ul" | "ol"; indent: number }> = [];

  const closeListsToIndent = (targetIndent: number): string => {
    let html = "";
    while (listStack.length > 0 && listStack[listStack.length - 1].indent > targetIndent) {
      const popped = listStack.pop()!;
      html += `</li></${popped.type}>`;
    }
    return html;
  };

  const closeAllLists = (): string => {
    let html = "";
    while (listStack.length > 0) {
      const popped = listStack.pop()!;
      html += `</li></${popped.type}>`;
    }
    return html;
  };

  for (let i = 0; i < listLines.length; i++) {
    const line = listLines[i];
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (ulMatch || olMatch) {
      const indent = (ulMatch || olMatch)![1].length;
      const type = ulMatch ? "ul" : "ol";
      let itemText = (ulMatch || olMatch)![3];

      if (itemText.startsWith("[ ] ")) {
        itemText = `<input type="checkbox" disabled class="task-checkbox mr-2 align-middle" />` + itemText.slice(4);
      } else if (itemText.startsWith("[x] ") || itemText.startsWith("[X] ")) {
        itemText = `<input type="checkbox" disabled checked class="task-checkbox mr-2 align-middle" />` + itemText.slice(4);
      }

      let lineHtml = "";

      if (listStack.length === 0) {
        listStack.push({ type, indent });
        lineHtml = `<${type} class="markdown-${type}"><li class="${type}-item">${itemText}`;
      } else {
        const top = listStack[listStack.length - 1];
        if (indent > top.indent) {
          listStack.push({ type, indent });
          lineHtml = `<${type} class="markdown-${type}"><li class="${type}-item">${itemText}`;
        } else if (indent < top.indent) {
          lineHtml += closeListsToIndent(indent);
          const currentTop = listStack[listStack.length - 1];
          if (currentTop && currentTop.type === type) {
            lineHtml += `</li><li class="${type}-item">${itemText}`;
          } else {
            if (currentTop) {
              listStack.pop();
              lineHtml += `</li></${currentTop.type}>`;
            }
            listStack.push({ type, indent });
            lineHtml += `<${type} class="markdown-${type}"><li class="${type}-item">${itemText}`;
          }
        } else {
          if (top.type === type) {
            lineHtml = `</li><li class="${type}-item">${itemText}`;
          } else {
            listStack.pop();
            listStack.push({ type, indent });
            lineHtml = `</li></${top.type}><${type} class="markdown-${type}"><li class="${type}-item">${itemText}`;
          }
        }
      }
      resultLines.push(lineHtml);
    } else {
      if (listStack.length > 0) {
        resultLines.push(closeAllLists());
      }
      resultLines.push(line);
    }
  }

  if (listStack.length > 0) {
    resultLines.push(closeAllLists());
  }

  processed = resultLines.join("\n");

  // 10. Inline styles (Bold, Italic, Links) outside tables
  processed = formatInline(processed);

  // 11. Soft breaks and paragraph formatting without polluting block elements
  processed = processed
    .replace(/\n{2,}/g, "<br /><br />")
    .replace(/\n/g, "<br />")
    .replace(/<br \/>\s*(<\/?(?:h[1-6]|ul|ol|li|div|table|thead|tbody|tr|th|td|blockquote|pre|hr))/gi, "$1")
    .replace(/(<\/(?:h[1-6]|ul|ol|li|div|table|thead|tbody|tr|th|td|blockquote|pre|hr)>)\s*<br \/>/gi, "$1");

  // 12. Restore protected tables, inline codes, and code blocks using function replacers
  tables.forEach((table, idx) => {
    processed = processed.replace(`${TABLE_TOKEN}${idx}`, () => table);
  });
  inlineCodes.forEach((inline, idx) => {
    processed = processed.replace(`${INLINE_TOKEN}${idx}`, () => inline);
  });
  codeBlocks.forEach((block, idx) => {
    processed = processed.replace(`${BLOCK_TOKEN}${idx}`, () => block);
  });

  return processed.trim();
}

/**
 * Returns formatted relative time (e.g. 'just now', '5m ago', '3h ago').
 */
export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return "just now";
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
```

---

## 5. Designed Unit Test Suite for `tests/unit/format.test.ts`

The following test suites must be appended to `tests/unit/format.test.ts` to comprehensively verify all Milestone 1 Part A requirements:

```typescript
describe("Headings H1-H6 Hierarchy & Semantic Tags", () => {
  it("renders all heading levels H1 through H6 with correct tags and classes", () => {
    const input = [
      "# Heading 1",
      "## Heading 2",
      "### Heading 3",
      "#### Heading 4",
      "##### Heading 5",
      "###### Heading 6",
    ].join("\n");
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<h1 class="markdown-h1">Heading 1</h1>');
    expect(rendered).toContain('<h2 class="markdown-h2">Heading 2</h2>');
    expect(rendered).toContain('<h3 class="markdown-h3">Heading 3</h3>');
    expect(rendered).toContain('<h4 class="markdown-h4">Heading 4</h4>');
    expect(rendered).toContain('<h5 class="markdown-h5">Heading 5</h5>');
    expect(rendered).toContain('<h6 class="markdown-h6">Heading 6</h6>');
  });

  it("handles optional trailing hashes in headings", () => {
    const input = "## Heading With Trailing Hashes ##";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('<h2 class="markdown-h2">Heading With Trailing Hashes</h2>');
  });

  it("does not treat hashtags without space as headings", () => {
    const input = "#hashtag #123";
    const rendered = formatMarkdown(input);
    expect(rendered).not.toContain("<h1");
  });
});

describe("Nested & Task Lists", () => {
  it("renders nested unordered lists with valid W3C hierarchy", () => {
    const input = "- Level 1\n  - Level 2\n  - Level 2b\n- Level 1b";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<ul class="markdown-ul">');
    expect(rendered).toContain('Level 1<ul class="markdown-ul"><li class="ul-item">Level 2</li>');
    // Ensure no invalid <br /> inside lists
    expect(rendered).not.toContain("<br /><li");
    expect(rendered).not.toContain("</li><br />");
  });

  it("renders mixed nested lists (ordered parent with unordered children)", () => {
    const input = "1. Step 1\n   - Detail A\n   - Detail B\n2. Step 2";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<ol class="markdown-ol">');
    expect(rendered).toContain('<ul class="markdown-ul">');
    expect(rendered).toContain("Detail A");
    expect(rendered).toContain("Detail B");
    expect(rendered).toContain("Step 2");
  });

  it("renders interactive task list checkboxes", () => {
    const input = "- [ ] Pending item\n- [x] Completed item";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<input type="checkbox" disabled class="task-checkbox');
    expect(rendered).toContain('<input type="checkbox" disabled checked class="task-checkbox');
  });
});

describe("GFM Tables with Responsive Wrapper", () => {
  it("renders table inside horizontal overflow wrapper with correct column alignments", () => {
    const input = [
      "| Feature | Alignment | Priority |",
      "| :--- | :---: | ---: |",
      "| Headings | Center | High |",
      "| Tables | Right | Critical |",
    ].join("\n");
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<div class="table-wrapper overflow-x-auto');
    expect(rendered).toContain('<table class="markdown-table');
    expect(rendered).toContain('style="text-align: left">Feature</th>');
    expect(rendered).toContain('style="text-align: center">Alignment</th>');
    expect(rendered).toContain('style="text-align: right">Priority</th>');
    expect(rendered).toContain('style="text-align: left">Headings</td>');
    expect(rendered).toContain('style="text-align: center">Center</td>');
    expect(rendered).toContain('style="text-align: right">High</td>');
  });

  it("handles escaped pipes inside table cells", () => {
    const input = [
      "| Command | Syntax |",
      "| --- | --- |",
      "| Pipe test | a \\| b |",
    ].join("\n");
    const rendered = formatMarkdown(input);

    expect(rendered).toContain("a | b");
  });
});

describe("Safe Hyperlinks & Protocol Whitelist", () => {
  it("renders safe external links with target=_blank and rel=noopener noreferrer", () => {
    const input = "Visit [Radiance Docs](https://radiance.ai/docs) for info.";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain(
      '<a href="https://radiance.ai/docs" target="_blank" rel="noopener noreferrer" class="markdown-link">Radiance Docs</a>'
    );
  });

  it("neutralizes malicious javascript: and data: URIs", () => {
    const input = "Click [here](javascript:alert(1)) or [download](data:text/html,bad).";
    const rendered = formatMarkdown(input);

    expect(rendered).not.toContain("javascript:");
    expect(rendered).not.toContain("data:");
    expect(rendered).toContain('<span class="unsafe-link">here</span>');
    expect(rendered).toContain('<span class="unsafe-link">download</span>');
  });

  it("escapes quotes in URLs to prevent attribute breakout", () => {
    const input = '[exploit](https://example.com" onclick="alert(1))';
    const rendered = formatMarkdown(input);

    expect(rendered).not.toContain('onclick="alert(1)"');
    expect(rendered).toContain("&quot;");
  });
});

describe("Streaming Code Fence Recovery & Resilience", () => {
  it("auto-closes unclosed code fence during streaming without backtick flash", () => {
    const input = "Here is the code:\n```typescript\nconst active = true;";
    const rendered = formatMarkdown(input, { isStreaming: true });

    expect(rendered).toContain('class="code-block-wrapper" data-language="typescript"');
    expect(rendered).toContain("const active = true;");
    expect(rendered).not.toContain("```");
  });

  it("handles streaming fence with language but no newline yet", () => {
    const input = "Processing:\n```python";
    const rendered = formatMarkdown(input, { isStreaming: true });

    expect(rendered).toContain('class="code-block-wrapper" data-language="python"');
    expect(rendered).not.toContain("```");
  });

  it("safely handles dollar signs in code blocks without regex replacement corruption", () => {
    const input = "```bash\necho $1 and $2 for $TOTAL\n```";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain("echo $1 and $2 for $TOTAL");
  });
});
```

---

## 6. Integration Alignment

- **Milestone 1 Part B (Syntax Highlighting & KaTeX Math)**:
  - Code blocks emitted by `formatMarkdown` provide the normalized `<div class="code-block-wrapper" data-language="...">` and raw code string in `data-code="..."`. Part B can inject tokenized syntax highlighting inside the `<pre><code>` block or apply Prism/Shiki tokenization directly within the extractor.
  - KaTeX math delimiters (`$...$` and `$$...$$`) can be processed alongside inline code or as a step immediately before HTML escaping.
- **Milestone 3 (Message Presentation & Actions)**:
  - In `src/components/chat/message-item.tsx`, update line 146 from `formatMarkdown(message.content)` to `formatMarkdown(message.content, { isStreaming })`.
  - In `src/app/globals.css`, append the modular typography rules for `.markdown-h1` through `.markdown-h6`, `.table-wrapper`, `.markdown-table`, and `.markdown-link`.
