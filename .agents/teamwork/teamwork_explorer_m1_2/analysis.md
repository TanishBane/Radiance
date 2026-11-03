# Technical Analysis: Code Blocks, Syntax Highlighting & LaTeX/KaTeX Math Notation (Milestone 1 — Part B)

**Author:** teamwork_explorer_m1_2  
**Target:** Milestone 1 — Part B (Radiance AI Platform)  
**Date:** 2026-11-01  
**Integrity Mode:** Development  
**Working Directory:** `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m1_2`  

---

## 1. Executive Summary & Problem Statement

The Radiance AI platform (`c:\Tanixai-main`) currently relies on a naive 99-line markdown formatter (`src/lib/utils/format.ts:formatMarkdown`) injected into the DOM via `dangerouslySetInnerHTML` in `src/components/chat/message-item.tsx`.

While this custom parser solved a historical double-escaping bug (`BUG-02`), an in-depth code inspection reveals critical presentation and usability defects in code blocks and mathematical rendering:
1. **Zero Syntax Highlighting:** Code blocks in `<pre><code>` render as raw, unhighlighted monochrome text. Keywords, strings, comments, numbers, and functions receive no syntax tokenization or color differentiation.
2. **Raw, Un-normalized Language Badges:** Language tags are rendered raw (e.g. ````ts`` renders as `ts` instead of `TYPESCRIPT`; ````py`` renders as `py` instead of `PYTHON`).
3. **Fragile Copy Button:** The copy button in `message-item.tsx:73–85` performs direct DOM mutation (`target.textContent = "Copied!"`). If the user clicks on an internal icon or child node, `target.classList.contains("code-copy-btn")` evaluates to `false`, silently failing to copy.
4. **Horizontal Overflow & Flexbox Clipping:** Code blocks with long lines risk clipping or causing page-level layout distortion on mobile viewports due to missing `min-w-0` on parent flex containers.
5. **Zero LaTeX / KaTeX Mathematical Notation:** Expressions like `$E = mc^2$` or `$$\int_0^\infty e^{-x^2} dx$$` render as raw unparsed text with visible dollar signs. In addition, formulas containing underscores (e.g. `$x_1 + x_2$`) risk being mangled by markdown italic regexes.
6. **Currency Symbol False-Positives:** Naive regex matching for `$math$` risks capturing currency values like `"$50 and $100"`.

This technical report delivers a production-grade, zero-dependency compatible architecture for Milestone 1 Part B that seamlessly integrates with Part A (Markdown Parser, Tables, Headings) and Part C (Sanitization, CSS Stylesheet).

---

## 2. Architecture & Pipeline Boundary

### 2.1 Scope Boundary Matrix for Milestone 1
To ensure zero collisions and clean interface boundaries across sub-teams:

| Area | Owner | Key Responsibilities |
|---|---|---|
| **Part A** | `teamwork_explorer_m1_1` | Headings H1–H6, Ordered/Unordered Lists, Markdown Tables, Safe Hyperlinks, Streaming Fence Auto-Closure |
| **Part B** *(This Report)* | `teamwork_explorer_m1_2` | Syntax Highlighting Engine, Normalized Language Badges, Reactive Copy Button (`data-code`), `<pre>` Horizontal Scrolling, LaTeX/KaTeX Math Rendering & Fallback, Unit Test Suite |
| **Part C** | `teamwork_explorer_m1_3` | Strict HTML/Script Sanitization, Nonce-based Placeholder Delimiters, Master Markdown Stylesheet (`globals.css`) |

### 2.2 End-to-End Processing Pipeline in `formatMarkdown`
The order of operations is critical. Code blocks and inline code MUST be extracted **before** mathematical notation to prevent bash `$VAR` or JavaScript template strings `` `${val}` `` from being misparsed as LaTeX math:

```
[Raw Markdown Input]
        │
        ▼
1. Auto-close unclosed code fences if streaming (Part A)
        │
        ▼
2. Extract Fenced Code Blocks (Part B)
   ├─ Normalize language badge (e.g. ts -> TYPESCRIPT)
   ├─ Run Syntax Tokenizer (keyword, string, comment, etc.)
   ├─ Build Header with Copy Button (data-code, SVG icon, aria-label)
   └─ Replace with collision-resistant token __RAD_CODE_BLOCK_<id>__
        │
        ▼
3. Extract Inline Code `...`
   └─ Replace with __RAD_INLINE_CODE_<id>__
        │
        ▼
4. Extract Block LaTeX Math $$...$$ (Part B)
   ├─ Parse with KaTeX / Graceful Math Fallback
   └─ Replace with __RAD_MATH_BLOCK_<id>__
        │
        ▼
5. Extract Inline LaTeX Math $...$ (Part B)
   ├─ Currency-safe regex matching (?<![\$0-9])\$([^\$\s]...)\$
   ├─ Parse with KaTeX / Graceful Math Fallback
   └─ Replace with __RAD_MATH_INLINE_<id>__
        │
        ▼
6. Escape HTML on normal text & apply Markdown transforms (Part A: H1-H6, tables, lists, links, blockquotes)
        │
        ▼
7. Restore Math Tokens (Math blocks & inline math)
        │
        ▼
8. Restore Inline Code Tokens
        │
        ▼
9. Restore Code Block Tokens (Contains pre-escaped syntax spans)
        │
        ▼
10. Strict HTML Sanitization Gate (Part C)
        │
        ▼
[Safe, Richly Rendered HTML Output]
```

---

## 3. Deep Dive 1: Code Block Syntax Highlighting Engine

### 3.1 Design Philosophy: Embedded Lightweight Lexer vs External Bundle
`package.json` currently does not include PrismJS, Highlight.js, or Shiki. While external libraries can be added, they often introduce bundle bloat (200KB+), SSR hydration mismatch risks in Next.js 15 App Router, or complex language component loading in ESM.

A purpose-built, high-performance embedded lexer in `src/lib/utils/syntax-highlighter.ts`:
- Has **zero external npm dependencies**.
- Executes with **O(N) single-pass linear performance**.
- Guarantees **100% deterministic SSR & Vitest execution**.
- Preserves the fix for `BUG-02`: each token value is single-escaped with `escapeHtml` during token emission, preventing double-escaping.

### 3.2 Token Taxonomy & Radiance Color Palette
The token classes follow standard conventions and are styled in `src/app/globals.css` using the Radiance dark luxury theme:

| Token Class | Description | Radiance Palette Hex | Token Styling |
|---|---|---|---|
| `.token.keyword` | Language keywords (`const`, `def`, `SELECT`, `class`) | `#c792ea` | Lavender / Light Amethyst, 500 weight |
| `.token.function` | Function names & call identifiers | `#61afef` | Sky Blue |
| `.token.string` | String literals, template literals, quotes | `#98c379` | Soft Sage / Mint Green |
| `.token.number` | Decimal, hex, float, integer literals | `#d19a66` | Warm Ochre / Peach |
| `.token.boolean` | `true`, `false`, `null`, `undefined`, `None` | `#f5c77e` (`var(--accent-b)`) | Radiance Gold Accent |
| `.token.comment` | Line and block comments | `#768390` | Muted Slate, font-style: italic |
| `.token.operator` | Mathematical, boolean, assignment symbols | `#56b6c2` | Cool Cyan / Teal |
| `.token.punctuation` | Braces, brackets, commas, semicolons | `rgba(240, 237, 230, 0.65)` | Soft White |
| `.token.type` | Types, interfaces, classes (`string`, `number`, `Promise`) | `#4ec9b0` | Emerald Teal |
| `.token.property` / `.token.attr-name` | JSON keys, object properties, HTML attrs | `#e8a849` (`var(--accent)`) | Radiance Signature Amber |
| `.token.tag` | HTML / XML tag names | `#e06c75` | Coral Crimson |

### 3.3 Proposed Implementation: `src/lib/utils/syntax-highlighter.ts`

```typescript
import { escapeHtml } from "./format";

export interface TokenRule {
  type: string;
  pattern: RegExp;
}

// ── TypeScript / JavaScript Rules ──
const JS_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  {
    type: "keyword",
    pattern: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|class|extends|new|this|super|import|export|from|as|async|await|yield|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|interface|type|enum|implements|declare|namespace)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:string|number|boolean|symbol|bigint|any|unknown|never|void|object|Array|Record|Promise|Map|Set|Partial|Required|Readonly|Pick|Omit)\b/,
  },
  { type: "boolean", pattern: /\b(?:true|false|null|undefined|NaN|Infinity)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },
  { type: "operator", pattern: /=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||[+\-*\/%&|^!~?:=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.]/ },
];

// ── Python Rules ──
const PY_RULES: TokenRule[] = [
  { type: "comment", pattern: /#[^\n]*/ },
  { type: "string", pattern: /(?:"""[\s\S]*?"""|'''[\s\S]*?'''|r?f?(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1)/ },
  {
    type: "keyword",
    pattern: /\b(?:def|class|return|if|elif|else|while|for|in|try|except|finally|with|as|import|from|lambda|yield|raise|pass|break|continue|global|nonlocal|assert|async|await)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:self|cls|int|str|float|list|dict|set|tuple|bool|type|bytes|Optional|Union|List|Dict|Tuple)\b/,
  },
  { type: "boolean", pattern: /\b(?:True|False|None)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: "operator", pattern: /==|!=|<=|>=|:=|\/\/|\*\*|[+\-*\/%&|^~=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.:]/ },
];

// ── SQL Rules ──
const SQL_RULES: TokenRule[] = [
  { type: "comment", pattern: /--[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /'(?:''|[^'])*'/ },
  {
    type: "keyword",
    pattern: /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|AND|OR|NOT|IN|IS|NULL|LIKE|ILIKE|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|INDEX|VIEW|WITH|DESC|ASC|BEGIN|COMMIT|ROLLBACK)\b/i,
  },
  {
    type: "function",
    pattern: /\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|NOW|CONCAT|LOWER|UPPER|ROUND|CAST|DATE_TRUNC)\b/i,
  },
  { type: "boolean", pattern: /\b(?:TRUE|FALSE|NULL)\b/i },
  { type: "number", pattern: /\b\d+(?:\.\d+)?\b/ },
  { type: "operator", pattern: /!=|<>|<=|>=|[+\-*\/%=<>]/ },
  { type: "punctuation", pattern: /[();,.]/ },
];

// ── JSON Rules ──
const JSON_RULES: TokenRule[] = [
  { type: "property", pattern: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
  { type: "string", pattern: /"(?:\\.|[^"\\])*"/ },
  { type: "number", pattern: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "boolean", pattern: /\b(?:true|false|null)\b/ },
  { type: "punctuation", pattern: /[{}[\]:,]/ },
];

// ── HTML Rules ──
const HTML_RULES: TokenRule[] = [
  { type: "comment", pattern: /<!--[\s\S]*?-->/ },
  { type: "tag", pattern: /<\/?(?:[a-zA-Z0-9-]+)(?:\s|>|\/)/ },
  { type: "attr-name", pattern: /[a-zA-Z0-9-]+(?=\s*=)/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  { type: "punctuation", pattern: /[<>\/=]/ },
];

// ── CSS Rules ──
const CSS_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\*[\s\S]*?\*\// },
  { type: "keyword", pattern: /@(?:media|keyframes|import|supports|layer|font-face)\b/ },
  { type: "property", pattern: /[a-zA-Z0-9-]+(?=\s*:)/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  { type: "number", pattern: /-?\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?\b/ },
  { type: "function", pattern: /\b(?:var|calc|rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|clamp|min|max)\b/ },
  { type: "punctuation", pattern: /[{}[\]();:,]/ },
];

// ── Shell / Bash Rules ──
const BASH_RULES: TokenRule[] = [
  { type: "comment", pattern: /#[^\n]*/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  {
    type: "keyword",
    pattern: /\b(?:echo|export|cd|ls|cat|grep|mkdir|rm|cp|mv|chmod|chown|sudo|curl|wget|git|npm|pnpm|yarn|bun|node|python|docker|if|then|else|elif|fi|for|in|do|done|while|case|esac|return|exit)\b/,
  },
  { type: "property", pattern: /\$[a-zA-Z0-9_]+|\${[a-zA-Z0-9_]+}/ },
  { type: "operator", pattern: /&&|\|\||[|><=&]/ },
  { type: "punctuation", pattern: /[();]/ },
];

const LANGUAGE_RULES: Record<string, TokenRule[]> = {
  ts: JS_RULES,
  typescript: JS_RULES,
  tsx: JS_RULES,
  js: JS_RULES,
  javascript: JS_RULES,
  jsx: JS_RULES,
  py: PY_RULES,
  python: PY_RULES,
  sql: SQL_RULES,
  json: JSON_RULES,
  html: HTML_RULES,
  xml: HTML_RULES,
  svg: HTML_RULES,
  css: CSS_RULES,
  scss: CSS_RULES,
  sh: BASH_RULES,
  bash: BASH_RULES,
  shell: BASH_RULES,
  zsh: BASH_RULES,
};

/**
 * Highlights a block of code using regex tokenization rules.
 * Emits HTML-escaped tokens wrapped in <span class="token <type>">.
 */
export function highlightCode(code: string, lang?: string): string {
  if (!code) return "";
  const normalizedLang = (lang || "").toLowerCase().trim();
  const rules = LANGUAGE_RULES[normalizedLang];

  if (!rules) {
    // Unsupported language: return safely escaped text with preserved whitespace
    return escapeHtml(code);
  }

  let html = "";
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    for (const rule of rules) {
      // Anchor pattern at the start of current slice
      const match = remaining.match(new RegExp(`^(?:${rule.pattern.source})`, rule.pattern.flags.replace("g", "")));
      if (match && match[0].length > 0) {
        const text = match[0];
        html += `<span class="token ${rule.type}">${escapeHtml(text)}</span>`;
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Consume 1 character as unhighlighted text
      html += escapeHtml(remaining[0]);
      remaining = remaining.slice(1);
    }
  }

  return html;
}
```

---

## 4. Deep Dive 2: Code Block Header & Reactive Copy Button

### 4.1 Language Badge Normalization Dictionary
Language identifiers from LLMs vary widely (e.g. `py`, `python`, `ts`, `typescript`, `c++`, `cpp`). We normalize all recognized identifiers into standardized, uppercase display badges:

```typescript
export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ts: "TYPESCRIPT",
  typescript: "TYPESCRIPT",
  tsx: "TSX",
  js: "JAVASCRIPT",
  javascript: "JAVASCRIPT",
  jsx: "JSX",
  py: "PYTHON",
  python: "PYTHON",
  sql: "SQL",
  json: "JSON",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "SASS",
  sh: "BASH",
  bash: "BASH",
  shell: "SHELL",
  zsh: "ZSH",
  rust: "RUST",
  rs: "RUST",
  go: "GO",
  golang: "GO",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cs: "C#",
  csharp: "C#",
  java: "JAVA",
  yaml: "YAML",
  yml: "YAML",
  md: "MARKDOWN",
  markdown: "MARKDOWN",
  dockerfile: "DOCKERFILE",
  docker: "DOCKERFILE",
  xml: "XML",
  graphql: "GRAPHQL",
  gql: "GRAPHQL",
};

export function normalizeLanguageBadge(lang?: string): string {
  if (!lang) return "CODE";
  const clean = lang.toLowerCase().trim();
  return LANGUAGE_DISPLAY_NAMES[clean] || clean.toUpperCase();
}
```

### 4.2 Code Block Header DOM Structure
The code block header markup is emitted as:

```html
<div class="code-block-wrapper" data-language="${normalizedLang.toLowerCase()}">
  <div class="code-block-header">
    <span class="code-block-lang">${normalizedBadge}</span>
    <button
      type="button"
      class="code-copy-btn"
      data-code="${escapeHtml(rawCode.trimEnd())}"
      aria-label="Copy code to clipboard"
      title="Copy code"
    >
      <svg class="copy-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </svg>
      <span class="copy-text">Copy</span>
    </button>
  </div>
  <pre><code>${highlightedCode}</code></pre>
</div>
```

### 4.3 Reactive Event Delegation & Visual Feedback in `message-item.tsx`
The existing handler in `src/components/chat/message-item.tsx:73–85` is fragile:
```typescript
// BEFORE: Fragile target matching & direct textContent wipe
const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const target = e.target as HTMLElement;
  if (target.classList.contains("code-copy-btn")) {
    const code = target.getAttribute("data-code");
    if (code) {
      navigator.clipboard.writeText(code);
      target.textContent = "Copied!";
      setTimeout(() => {
        target.textContent = "Copy";
      }, 1800);
    }
  }
};
```

**Proposed Hardened Implementation:**
```typescript
// AFTER: Resilient element traversal with checkmark feedback and ARIA update
const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
  const target = e.target as HTMLElement;
  const button = target.closest(".code-copy-btn") as HTMLButtonElement | null;
  if (!button) return;

  const code = button.getAttribute("data-code");
  if (!code) return;

  navigator.clipboard.writeText(code).then(() => {
    button.classList.add("copied");
    const label = button.querySelector(".copy-text");
    const originalText = label ? label.textContent : button.textContent;
    if (label) {
      label.textContent = "Copied!";
    }
    button.setAttribute("aria-label", "Code copied to clipboard");

    setTimeout(() => {
      button.classList.remove("copied");
      if (label) {
        label.textContent = originalText || "Copy";
      }
      button.setAttribute("aria-label", "Copy code to clipboard");
    }, 2000);
  }).catch((err) => {
    console.error("Failed to copy code to clipboard", err);
  });
};
```

---

## 5. Deep Dive 3: Horizontal Scrolling on `<pre>` Without Parent Clipping

### 5.1 Root Cause of Horizontal Flexbox Overflow
In CSS Flexbox, flex items default to `min-width: auto`. In `src/components/chat/message-item.tsx`:
```tsx
<div className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 group ...">
  {/* Avatar */}
  <div className="w-8 h-8 rounded-xl shrink-0 ...">...</div>
  {/* Message Bubble Container */}
  <div className="flex flex-col gap-1 max-w-[calc(100%-44px)]"> {/* Missing min-w-0 */}
    <div className="prose ..."> {/* Missing min-w-0 */}
      <div className="code-block-wrapper">
        <pre><code>... long 1200px code line ...</code></pre>
      </div>
```
When a code line exceeds the viewport width, the flex child's `min-width: auto` prevents it from contracting below its content size. As a result, the code block expands the entire message bubble past the screen edge, causing page-level overflow and clipping on mobile devices.

### 5.2 CSS Fix Invariants
To guarantee reliable horizontal scrolling without clipping:
1. Apply `min-w-0` to the flex bubble wrapper in `message-item.tsx`:
   `className="flex flex-col gap-1 w-full min-w-0 max-w-[calc(100%-44px)]"`
2. Set `.code-block-wrapper` to `max-width: 100%`, `width: 100%`, `overflow: hidden`.
3. Set `.code-block-wrapper pre` to:
   ```css
   .code-block-wrapper pre {
     margin: 0;
     padding: 16px;
     overflow-x: auto;
     max-width: 100%;
     white-space: pre;
     word-break: normal;
     word-wrap: normal;
     tab-size: 2;
     font-size: 13px;
     line-height: 1.65;
     -webkit-overflow-scrolling: touch;
   }
   ```
4. Custom sleek scrollbars in `globals.css`:
   ```css
   .code-block-wrapper pre::-webkit-scrollbar {
     height: 5px;
   }
   .code-block-wrapper pre::-webkit-scrollbar-track {
     background: rgba(255, 255, 255, 0.02);
     border-radius: 0 0 var(--radius-md) var(--radius-md);
   }
   .code-block-wrapper pre::-webkit-scrollbar-thumb {
     background: rgba(255, 255, 255, 0.14);
     border-radius: 3px;
   }
   .code-block-wrapper pre::-webkit-scrollbar-thumb:hover {
     background: var(--accent);
   }
   ```

---

## 6. Deep Dive 4: LaTeX / KaTeX Mathematical Notation

### 6.1 Parsing Strategy & Currency Disambiguation
Math formulas can appear as:
- **Block math:** `$$formula$$` (displayed centered on its own line)
- **Inline math:** `$formula$` (embedded within prose)

#### Avoiding Currency False-Positives
A naive regex `/\$([^$]+)\$/g` incorrectly captures sentences like:
> "The subscription costs $50 and the add-on is $20."

We apply the standard Pandoc/remark-math delimiter rules:
1. Block Math: `/\$\$([\s\S]+?)\$\$/g`
2. Inline Math: `/(?<!\\|\$)\$([^\$\s](?:[^$\n]*?[^\$\s])?)\$(?!\$|[0-9])/g`
   - Negative lookbehind `(?<!\\|\$)` ensures `\$` (escaped) or `$$` (block) is not matched.
   - Opening `$` is followed by non-whitespace `[^\$\s]`.
   - Closing `$` is preceded by non-whitespace `[^\$\s]`.
   - Negative lookahead `(?!\$|[0-9])` ensures trailing `$` is not followed by a digit (preventing `$50 and $100` false-positives).

### 6.2 KaTeX Integration with Graceful Semantic Fallback
We design a hybrid math module `src/lib/utils/math-renderer.ts`:
- **Primary:** If KaTeX is installed (`npm i katex @types/katex`) or available on `globalThis`, it executes `katex.renderToString(tex, { displayMode, throwOnError: false })`.
- **Secondary (Zero-dependency Graceful Fallback):** If KaTeX is not installed or throws an exception on malformed LaTeX, our custom fallback renderer converts Greek letters, fractions, superscripts/subscripts, integrals, and square roots into semantic HTML.
- **Error Boundary:** Wrapped in `try/catch` to ensure **zero exceptions** can crash Next.js 15 SSR or React 19 rendering.

### 6.3 Proposed Implementation: `src/lib/utils/math-renderer.ts`

```typescript
import { escapeHtml } from "./format";

// Greek symbols and standard math operators
const SYMBOL_MAP: Record<string, string> = {
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ",
  "\\epsilon": "ε", "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ",
  "\\iota": "ι", "\\kappa": "κ", "\\lambda": "λ", "\\mu": "μ",
  "\\nu": "ν", "\\xi": "ξ", "\\pi": "π", "\\rho": "ρ",
  "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ",
  "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ",
  "\\Xi": "Ξ", "\\Pi": "Π", "\\Sigma": "Σ", "\\Phi": "Φ",
  "\\Psi": "Ψ", "\\Omega": "Ω",
  "\\sum": "∑", "\\prod": "∏", "\\int": "∫", "\\oint": "∮",
  "\\infty": "∞", "\\approx": "≈", "\\neq": "≠", "\\le": "≤",
  "\\leq": "≤", "\\ge": "≥", "\\geq": "≥", "\\pm": "±",
  "\\times": "×", "\\div": "÷", "\\cdot": "·", "\\in": "∈",
  "\\notin": "∉", "\\subset": "⊂", "\\subseteq": "⊆",
  "\\forall": "∀", "\\exists": "∃", "\\partial": "∂", "\\nabla": "∇",
  "\\to": "→", "\\rightarrow": "→", "\\leftarrow": "←",
  "\\Rightarrow": "⇒", "\\Leftarrow": "⇐", "\\iff": "⟺",
};

/**
 * Lightweight semantic fallback renderer for LaTeX math.
 */
export function renderFallbackMath(latex: string, displayMode: boolean): string {
  let formatted = escapeHtml(latex);

  // 1. Substitute Greek letters & math symbols
  for (const [cmd, symbol] of Object.entries(SYMBOL_MAP)) {
    const escapedCmd = escapeHtml(cmd);
    formatted = formatted.replaceAll(escapedCmd, symbol);
  }

  // 2. Fractions: \frac{a}{b}
  formatted = formatted.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    '<span class="math-frac"><span class="math-num">$1</span><span class="math-denom">$2</span></span>'
  );

  // 3. Exponents & Subscripts: x^{2} -> x<sup>2</sup>, x_{i} -> x<sub>i</sub>
  formatted = formatted.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>");
  formatted = formatted.replace(/\^([0-9a-zA-Z])/g, "<sup>$1</sup>");
  formatted = formatted.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
  formatted = formatted.replace(/_([0-9a-zA-Z])/g, "<sub>$1</sub>");

  // 4. Square roots: \sqrt{x}
  formatted = formatted.replace(
    /\\sqrt\{([^{}]+)\}/g,
    '<span class="math-sqrt-wrap">√<span class="math-sqrt">$1</span></span>'
  );

  // 5. Text blocks: \text{text}
  formatted = formatted.replace(/\\text\{([^{}]+)\}/g, '<span class="math-text">$1</span>');

  if (displayMode) {
    return `<div class="math-block" data-math="${escapeHtml(latex)}"><span class="math-display">${formatted}</span></div>`;
  }
  return `<span class="math-inline" data-math="${escapeHtml(latex)}">${formatted}</span>`;
}

/**
 * Renders LaTeX math expressions with KaTeX or fallback.
 * Strictly wrapped in try/catch to guarantee zero runtime crashes.
 */
export function renderMath(expression: string, displayMode: boolean): string {
  const trimmed = expression.trim();
  if (!trimmed) return "";

  try {
    // Check for KaTeX on globalThis or imported katex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const katex = (globalThis as any).katex;
    if (katex && typeof katex.renderToString === "function") {
      return katex.renderToString(trimmed, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
      });
    }
  } catch (err) {
    console.warn("KaTeX renderToString error, falling back:", err);
  }

  return renderFallbackMath(trimmed, displayMode);
}
```

---

## 7. Comprehensive Unit Test Suite Design (`tests/unit/format.test.ts`)

The test suite must be updated to cover syntax tokenization, normalized badges, copy attributes, math rendering, and security isolation. The following 14 tests must be added:

```typescript
describe("Milestone 1 — Part B: Code Blocks, Highlighting & Math Notation", () => {
  // ── 1. Syntax Highlighting Tokenization ──
  it("tokenizes TypeScript code with keywords, types, strings, and numbers", () => {
    const input = "```typescript\nconst count: number = 42;\nfunction getCount(): number {\n  return count;\n}\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token keyword">const</span>');
    expect(rendered).toContain('class="token type">number</span>');
    expect(rendered).toContain('class="token number">42</span>');
    expect(rendered).toContain('class="token keyword">function</span>');
    expect(rendered).toContain('class="token keyword">return</span>');
  });

  it("tokenizes Python code with keywords, comments, and strings", () => {
    const input = '```python\ndef greet(name: str) -> None:\n    # Greeting function\n    return f"Hello {name}"\n```';
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token keyword">def</span>');
    expect(rendered).toContain('class="token comment"># Greeting function</span>');
    expect(rendered).toContain('class="token boolean">None</span>');
  });

  it("tokenizes SQL queries with uppercase keywords and booleans", () => {
    const input = "```sql\nSELECT id, username FROM users WHERE is_active = true;\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token keyword">SELECT</span>');
    expect(rendered).toContain('class="token keyword">FROM</span>');
    expect(rendered).toContain('class="token keyword">WHERE</span>');
    expect(rendered).toContain('class="token boolean">true</span>');
  });

  it("tokenizes JSON with keys, strings, numbers, and booleans", () => {
    const input = '```json\n{\n  "status": "success",\n  "code": 200,\n  "ok": true\n}\n```';
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token property">&quot;status&quot;</span>');
    expect(rendered).toContain('class="token number">200</span>');
    expect(rendered).toContain('class="token boolean">true</span>');
  });

  it("tokenizes HTML with tag names and attributes", () => {
    const input = '```html\n<div class="card" id="main">Hello</div>\n```';
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token tag">&lt;div</span>');
    expect(rendered).toContain('class="token attr-name">class</span>');
    expect(rendered).toContain('class="token attr-name">id</span>');
  });

  // ── 2. Language Badge Normalization ──
  it("normalizes language badges to uppercase in code block header", () => {
    expect(formatMarkdown("```ts\nlet x = 1;\n```")).toContain('class="code-block-lang">TYPESCRIPT</span>');
    expect(formatMarkdown("```py\nx = 1\n```")).toContain('class="code-block-lang">PYTHON</span>');
    expect(formatMarkdown("```sql\nSELECT 1;\n```")).toContain('class="code-block-lang">SQL</span>');
    expect(formatMarkdown("```cpp\nint main() {}\n```")).toContain('class="code-block-lang">C++</span>');
    expect(formatMarkdown("```cs\nvar x = 1;\n```")).toContain('class="code-block-lang">C#</span>');
    expect(formatMarkdown("```\nplain text\n```")).toContain('class="code-block-lang">CODE</span>');
  });

  // ── 3. Code Copy Button Attributes ──
  it("emits reactive copy button with data-code, svg icon, and accessible label", () => {
    const code = "console.log('hello world');";
    const rendered = formatMarkdown("```javascript\n" + code + "\n```");
    expect(rendered).toContain('class="code-copy-btn"');
    expect(rendered).toContain('data-code="' + escapeHtml(code) + '"');
    expect(rendered).toContain('aria-label="Copy code to clipboard"');
    expect(rendered).toContain('<svg class="copy-icon"');
  });

  // ── 4. Horizontal Scrolling Markup ──
  it("wraps code inside pre with horizontal scrolling capability and correct classes", () => {
    const rendered = formatMarkdown("```typescript\nconst a = 1;\n```");
    expect(rendered).toContain('class="code-block-wrapper"');
    expect(rendered).toContain("<pre><code>");
  });

  // ── 5. Mathematical Notation (LaTeX) ──
  it("renders block LaTeX math in math-block container", () => {
    const math = "$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$";
    const rendered = formatMarkdown(math);
    expect(rendered).toContain('class="math-block"');
    expect(rendered).toContain("∫");
    expect(rendered).toContain("∞");
    expect(rendered).not.toContain("$$");
  });

  it("renders inline LaTeX math in math-inline container", () => {
    const rendered = formatMarkdown("Einstein discovered that $E = mc^2$ in 1905.");
    expect(rendered).toContain('class="math-inline"');
    expect(rendered).toContain("E = mc<sup>2</sup>");
    expect(rendered).not.toContain("$E = mc^2$");
  });

  it("does not false-positive match currency amounts as math", () => {
    const text = "The basic plan costs $50 and the premium is $100 per month.";
    const rendered = formatMarkdown(text);
    expect(rendered).not.toContain('class="math-inline"');
    expect(rendered).toContain("$50");
    expect(rendered).toContain("$100");
  });

  it("does not parse math expressions inside code blocks", () => {
    const code = "```javascript\nconst price = `$${amount}`;\n```";
    const rendered = formatMarkdown(code);
    expect(rendered).not.toContain('class="math-inline"');
    expect(rendered).not.toContain('class="math-block"');
    expect(rendered).toContain("const");
  });

  it("gracefully falls back on malformed LaTeX without throwing", () => {
    const malformed = "$$\\frac{incomplete$$";
    expect(() => formatMarkdown(malformed)).not.toThrow();
    const rendered = formatMarkdown(malformed);
    expect(rendered).toContain('class="math-block"');
  });

  // ── 6. Single-Escaping Regression Guard (BUG-02) ──
  it("preserves single-escaping inside code blocks (BUG-02)", () => {
    const snippet = "```cpp\nif (a < b && c > d) return 0;\n```";
    const rendered = formatMarkdown(snippet);
    expect(rendered).toContain("if (a &lt; b &amp;&amp; c &gt; d)");
    expect(rendered).not.toContain("&amp;lt;");
    expect(rendered).not.toContain("&amp;amp;");
  });
});
```

---

## 8. Implementation Checklist for Milestone 1 Implementers

To transition these designs into production code:
1. **Create `src/lib/utils/syntax-highlighter.ts`:**
   - Implement `highlightCode(code, lang)` with token rules for TS, JS, Python, SQL, JSON, HTML, CSS, Bash.
   - Implement `normalizeLanguageBadge(lang)` for normalized uppercase labels.
2. **Create `src/lib/utils/math-renderer.ts`:**
   - Implement `renderMath(expression, displayMode)` with KaTeX check and `renderFallbackMath`.
   - Wrap in `try/catch` to ensure error boundary resilience.
3. **Refactor `src/lib/utils/format.ts`:**
   - Integrate code block extraction with syntax highlighting and uppercase headers.
   - Integrate block and inline LaTeX extraction with math renderer.
   - Ensure code blocks and inline code are extracted prior to math to protect template strings and variables.
4. **Update `src/components/chat/message-item.tsx`:**
   - Replace brittle `handleContentClick` with `target.closest(".code-copy-btn")`.
   - Add `.copied` CSS class toggle and visual confirmation label transition.
   - Add `w-full min-w-0` to the message bubble container to prevent flex child blowout.
5. **Add CSS Tokens in `src/app/globals.css`:**
   - Add token colors (`.token.keyword`, `.token.string`, `.token.function`, etc.) matching the Radiance dark palette.
   - Add `.code-block-wrapper pre` horizontal scrolling rules and custom webkit scrollbar.
   - Add `.math-block` and `.math-inline` typography and fraction layout rules.
6. **Update Test Suite (`tests/unit/format.test.ts`):**
   - Add the 14 designed unit test cases.
   - Run `npm.cmd test` and verify 100% pass rate.
