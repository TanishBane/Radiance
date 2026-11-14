import { highlightCode, normalizeLanguageBadge } from "./syntax-highlighter";
import { renderMath } from "./math-renderer";

export interface FormatMarkdownOptions {
  isStreaming?: boolean;
}

/**
 * Escapes raw HTML characters to prevent XSS.
 */
export function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Collision-proof token manager for protecting syntax blocks during markdown parsing.
 * Uses a 128-bit random nonce per invocation and non-printable control boundaries (\x1a).
 */
export class TokenManager {
  private nonce: string;
  private counter = 0;
  private tokens = new Map<string, string>();

  constructor() {
    this.nonce =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "")
        : Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  }

  /**
   * Registers an HTML block and returns an unguessable placeholder token.
   * Uses ASCII \x1a (SUB - Substitute) as boundary delimiter.
   */
  public register(html: string): string {
    const token = `\x1a__RAD_TOK_${this.nonce}_${this.counter++}__\x1a`;
    this.tokens.set(token, html);
    return token;
  }

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
}

/**
 * Validates whether a URL uses an allowed, safe scheme.
 * Whitelisted: http:, https:, mailto:, tel:, relative paths (/ or #).
 * Disallowed: javascript:, vbscript:, data:, file:, blob:.
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();

  // Decode numeric & hex HTML entities, colons, and control characters to detect obfuscation
  const decoded = trimmed
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&colon;/gi, ":")
    .replace(/%3a/gi, ":")
    .replace(/[\x00-\x1f\x7f-\x9f\s]/g, "");

  if (/^(?:javascript|vbscript|data|file|blob):/i.test(decoded)) {
    return false;
  }

  return /^(?:https?:\/\/|mailto:|tel:|\/|#)/i.test(trimmed);
}

/**
 * Sanitizes URLs for markdown hyperlinks, disallowing dangerous protocols.
 */
export function sanitizeUrl(url: string): string {
  if (isSafeUrl(url)) {
    return escapeHtml(url.trim());
  }
  return "#blocked-dangerous-protocol";
}

/**
 * Strict defense-in-depth HTML sanitizer.
 * Neutralizes active executable elements (<script>, <iframe>, <object>, <embed>, <form>)
 * and strips all inline on* event handler attributes (both raw and escaped forms).
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  let sanitized = html;

  // 1. Strip active executable elements and embedded contexts completely
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<applet\b[^<]*(?:(?!<\/applet>)<[^<]*)*<\/applet>/gi, "")
    .replace(/<embed\b[^>]*\/?>/gi, "")
    .replace(/<meta\b[^>]*\/?>/gi, "")
    .replace(/<base\b[^>]*\/?>/gi, "")
    .replace(/<form\b[^<]*(?:(?!<\/form>)<[^<]*)*<\/form>/gi, "")
    .replace(/<\/?(?:script|iframe|object|embed|applet|meta|base|form)\b[^>]*>/gi, "");

  // 2. Strip all inline on* event handler attributes (raw or escaped forms)
  sanitized = sanitized.replace(/(?:\s+|\/)on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|&quot;.*?&quot;|[^\s>]+)/gi, "");

  // 3. Neutralize dangerous protocols in href attributes
  sanitized = sanitized.replace(/href\s*=\s*(["'])(.*?)\1/gi, (match, quote, val) => {
    const cleanVal = val.trim().replace(/[\x00-\x1f\x7f-\x9f\s]/g, "");
    if (/^(?:javascript|vbscript|data):/i.test(cleanVal)) {
      return `href=${quote}#blocked-dangerous-protocol${quote}`;
    }
    return match;
  });

  // 4. Neutralize dangerous protocols in src attributes
  sanitized = sanitized.replace(/src\s*=\s*(["'])(.*?)\1/gi, (match, quote, val) => {
    const cleanVal = val.trim().replace(/[\x00-\x1f\x7f-\x9f\s]/g, "");
    if (/^(?:javascript|vbscript|data:text\/html):/i.test(cleanVal)) {
      return `src=${quote}about:blank${quote}`;
    }
    return match;
  });

  return sanitized;
}

/**
 * Formats raw markdown into sanitized, accessible, styled HTML.
 * Supports H1-H6, GFM tables, nested lists, KaTeX math, syntax highlighting,
 * and streaming code fence auto-recovery.
 */
export function formatMarkdown(raw: string, options?: FormatMarkdownOptions): string {
  if (!raw) return "";

  let content = raw;

  // 1. Streaming code fence auto-recovery:
  // Detect if content has an odd number of code fence delimiters (unclosed fence during streaming)
  const fenceMatches = content.match(/(?:^|\n)\s*```/g);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    if (!content.endsWith("\n")) {
      content += "\n```";
    } else {
      content += "```";
    }
  }

  const tokenManager = new TokenManager();

  // 2. Extract fenced code blocks with language badge normalization & syntax highlighting
  content = content.replace(/```([a-zA-Z0-9_+-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const rawTrimmed = code.trimEnd();
    const cleanLang = (lang || "").trim();

    // Check if block is specifically designated as math or latex
    if (cleanLang === "math" || cleanLang === "latex" || cleanLang === "katex") {
      const mathHtml = renderMath(rawTrimmed, true);
      return tokenManager.register(mathHtml);
    }

    const normalizedBadge = normalizeLanguageBadge(cleanLang);
    const highlightedCode = highlightCode(rawTrimmed, cleanLang);
    const langAttr = cleanLang ? ` data-language="${escapeHtml(cleanLang.toLowerCase())}"` : "";

    const lineCount = rawTrimmed.split("\n").length;
    const lines = highlightedCode.split("\n");
    const codeBody =
      lineCount > 1
        ? lines
            .map(
              (line, idx) =>
                `<span class="code-line"><span class="code-line-num" aria-hidden="true">${idx + 1}</span><span class="code-line-text">${line || " "}</span></span>`
            )
            .join("\n")
        : highlightedCode;

    const blockHtml =
      `<div class="code-block-wrapper"${langAttr}>` +
        `<div class="code-block-header">` +
          `<div class="code-block-header-left">` +
            `<span class="code-block-lang">${escapeHtml(normalizedBadge)}</span>` +
            `<span class="code-block-line-count">${lineCount} ${lineCount === 1 ? "line" : "lines"}</span>` +
          `</div>` +
          `<div class="code-block-header-right">` +
            `<button class="code-collapse-btn" aria-label="Toggle code collapse" title="Collapse code block"><span class="collapse-icon">−</span></button>` +
            `<button class="code-download-btn" data-code="${escapeHtml(rawTrimmed)}" data-lang="${escapeHtml(cleanLang)}" aria-label="Download code snippet" title="Download code">Download</button>` +
            `<button class="code-copy-btn" data-code="${escapeHtml(rawTrimmed)}" aria-label="Copy code to clipboard" title="Copy code">Copy</button>` +
          `</div>` +
        `</div>` +
        `<pre><code>${codeBody}</code></pre>` +
      `</div>`;

    return tokenManager.register(blockHtml);
  });

  // 3. Extract inline code with automatic mathematical formula detection
  // (Prevents formulas like Attention(Q,K,V) = softmax(...) from rendering as plain inline code badges,
  // while preserving explicit inline code containing LaTeX snippets like `$E = mc^2$`)
  const isMathFormula = (str: string): boolean => {
    const trimmed = str.trim();
    if (trimmed.startsWith("$") && trimmed.endsWith("$")) {
      return false;
    }
    // LaTeX backslash commands
    if (
      /\\(?:frac|sqrt|sum|prod|int|partial|alpha|beta|gamma|delta|epsilon|theta|lambda|mu|nu|xi|pi|rho|sigma|tau|phi|chi|psi|omega|Gamma|Delta|Theta|Lambda|Xi|Pi|Sigma|Phi|Psi|Omega|infty|approx|neq|le|ge|pm|times|div|cdot|in|notin|subset|forall|exists|to|leftarrow|rightarrow|Rightarrow|Leftarrow|iff|left|right|text|operatorname|mathrm|mathbf)\b/.test(
        trimmed
      )
    ) {
      return true;
    }
    // Attention or softmax formulas with mathematical notation
    if (
      /(?:Attention|softmax|argmax|argmin)\s*\([^\)]*\)/i.test(trimmed) &&
      /(?:[\^_\/\\=]|sqrt|frac)/i.test(trimmed)
    ) {
      return true;
    }
    return false;
  };

  content = content.replace(/`([^`\n]+)`/g, (_, code) => {
    if (isMathFormula(code)) {
      const cleanExpr = code.trim().replace(/^\$+|\$+$/g, "").trim();
      const mathHtml = renderMath(cleanExpr, cleanExpr.length > 50 || cleanExpr.includes("\n"));
      return tokenManager.register(mathHtml);
    }
    const inlineHtml = `<code>${escapeHtml(code)}</code>`;
    return tokenManager.register(inlineHtml);
  });

  // 4. Extract Block LaTeX Math ($$math$$, \[math\], and \begin{equation} environments)
  content = content.replace(/(?:\$\$|\\\[)([\s\S]+?)(?:\$\$|\\\])/g, (_, math) => {
    const mathHtml = renderMath(math, true);
    return tokenManager.register(mathHtml);
  });

  content = content.replace(/\\begin\{(?:equation|align|gather)\*?\}([\s\S]+?)\\end\{(?:equation|align|gather)\*?\}/g, (fullMatch) => {
    const mathHtml = renderMath(fullMatch, true);
    return tokenManager.register(mathHtml);
  });

  // 5. Extract Inline LaTeX Math ($math$ and \(math\)), currency-safe
  content = content.replace(/(?<!\\|\$)\$([^\$\s](?:[^$\n]*?[^\$\s])?)\$(?!\$|[0-9])/g, (_, math) => {
    const mathHtml = renderMath(math, false);
    return tokenManager.register(mathHtml);
  });

  content = content.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    const mathHtml = renderMath(math, false);
    return tokenManager.register(mathHtml);
  });

  // Unescape escaped dollar signs (\$ -> $)
  content = content.replace(/\\(\$)/g, "$1");

  // Helper for inline markdown transforms (Images, Bold, Italic, Strikethrough, Hyperlinks, Citations)
  const formatInline = (str: string): string => {
    return str
      // Images: ![alt](url) with nested parentheses URL support
      .replace(
        /!\[([^\]\n]*)\]\(\s*([^()\n]*(?:\((?:[^()\n]|\([^()\n]*\))*\)[^()\n]*)*)\s*\)/g,
        (_, alt, url) => {
          const cleanUrl = url.trim();
          if (isSafeUrl(cleanUrl)) {
            return `<span class="markdown-image-wrapper"><img src="${escapeHtml(cleanUrl)}" alt="${escapeHtml(alt)}" loading="lazy" class="markdown-image" /></span>`;
          }
          return `<span class="unsafe-image-placeholder">[Image blocked: unsafe protocol]</span>`;
        }
      )
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/\[([^\n\]]+)\]\(\s*([^()\n]*(?:\((?:[^()\n]|\([^()\n]*\))*\)[^()\n]*)*)\s*\)/g, (_, label, url) => {
        const cleanUrl = url.trim();
        if (isSafeUrl(cleanUrl)) {
          return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="markdown-link">${label}</a>`;
        }
        return `<span class="unsafe-link">${label}</span>`;
      })
      // Citations: [^1] or [1]
      .replace(/\[\^?(\d+)\]/g, `<sup class="citation-ref"><span class="citation-badge" title="Citation $1">[$1]</span></sup>`);
  };

  // 6. Extract and parse Markdown Tables (GFM syntax)
  const lines = content.split("\n");
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
    const isDelimiter = Boolean(
      nextLine &&
      nextLine.includes("|") &&
      nextLine.includes("-") &&
      /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/.test(nextLine)
    );

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

      nonTableLines.push(tokenManager.register(tableHtml));
    } else {
      nonTableLines.push(line);
      lineIdx++;
    }
  }

  content = nonTableLines.join("\n");

  // 7. Escape HTML on regular prose text
  content = escapeHtml(content);

  // 8. Headings H1-H6 with modular semantic tags & classes
  content = content.replace(/^(#{1,6})\s+(.+?)(?:\s+#+)?$/gm, (_, hashes, text) => {
    const level = hashes.length;
    return `<h${level} class="markdown-h${level}">${text.trim()}</h${level}>`;
  });

  // 9. Horizontal Rules
  content = content.replace(/^---$/gm, '<hr class="markdown-hr" />');

  // 10. Blockquotes
  content = content.replace(/^&gt;\s*(.+)$/gm, "<blockquote>$1</blockquote>");

  // 11. Nested Ordered and Unordered Lists with Task Checkboxes
  const listLines = content.split("\n");
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
  const closeAllLists = (): string => closeListsToIndent(-1);

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

  content = resultLines.join("\n");

  // 12. Inline formatting (bold, italic, strikethrough, links) outside code/math/tables
  content = formatInline(content);

  // 13. Soft breaks and paragraph spacing without polluting block elements
  content = content
    .replace(/\n{2,}/g, "<br /><br />")
    .replace(/\n/g, "<br />")
    .replace(/<br \/>\s*(<\/?(?:h[1-6]|ul|ol|li|div|table|thead|tbody|tr|th|td|blockquote|pre|hr))/gi, "$1")
    .replace(/(<\/(?:h[1-6]|ul|ol|li|div|table|thead|tbody|tr|th|td|blockquote|pre|hr)>)\s*<br \/>/gi, "$1");

  // 14. Strip active executable elements and on* handlers from unescaped/prose HTML before token restoration
  content = sanitizeHtml(content);

  // 15. Restore protected code blocks, inline code, math, and tables
  content = tokenManager.restore(content);

  // Clean up any stray <br /> before/after restored block elements
  content = content
    .replace(/<br \/>\s*(<\/?(?:div|table|thead|tbody|tr|th|td|pre))/gi, "$1")
    .replace(/(<\/(?:div|table|thead|tbody|tr|th|td|pre)>)\s*<br \/>/gi, "$1");

  return content.trim();
}

/**
 * Returns formatted relative time (e.g. 'just now', '5m ago', '3h ago').
 */
export function formatRelativeTime(timestamp: number, locale = "en"): string {
  const diff = Date.now() - timestamp;
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

    if (sec < 60) return locale === "en" ? "just now" : new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(0, "second");
    if (locale !== "en") {
      const relative = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      if (min < 60) return relative.format(-min, "minute");
      if (hr < 24) return relative.format(-hr, "hour");
      if (day < 7) return relative.format(-day, "day");
      return new Date(timestamp).toLocaleDateString(locale, { month: "short", day: "numeric" });
    }
  if (min < 60) return `${min}m ago`;
  if (hr < 24) return `${hr}h ago`;
  if (day === 1) return "yesterday";
  if (day < 7) return `${day}d ago`;

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
