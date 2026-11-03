// Enhanced Prototype test for formatMarkdown implementation
// Running in .agents/teamwork/teamwork_explorer_m1_1

export function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isSafeUrl(url) {
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) return true;
  if (trimmed.startsWith("mailto:")) return true;
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return true;
  return false;
}

export function formatMarkdown(raw, options) {
  if (!raw) return "";

  let content = raw;

  // 1. Streaming Code Fence Recovery
  // If an unclosed code block fence is detected, auto-close it so it renders cleanly
  // A code fence begins on a new line (or start of text) with 3 or more backticks
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

  // Unique tokens for this formatting run (prevents collisions)
  const salt = Math.random().toString(36).slice(2, 8);
  const BLOCK_TOKEN = `\x1aRD_CB_${salt}_`;
  const INLINE_TOKEN = `\x1aRD_INL_${salt}_`;
  const TABLE_TOKEN = `\x1aRD_TBL_${salt}_`;

  // 2. Extract fenced code blocks
  const codeBlocks = [];
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
  const inlineCodes = [];
  processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `${INLINE_TOKEN}${idx}`;
  });

  // Helper for inline markdown inside table cells and normal text
  const formatInline = (str) => {
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

  // 4. Line-based Table Parser (GFM syntax | col | with delimiter row)
  const tables = [];
  const lines = processed.split("\n");
  const nonTableLines = [];
  let lineIdx = 0;

  const splitCells = (line) =>
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
      const tableLines = [line, nextLine];
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
  const resultLines = [];
  let listStack = [];

  const closeListsToIndent = (targetIndent) => {
    let html = "";
    while (listStack.length > 0 && listStack[listStack.length - 1].indent > targetIndent) {
      const popped = listStack.pop();
      html += `</li></${popped.type}>`;
    }
    return html;
  };

  const closeAllLists = () => {
    let html = "";
    while (listStack.length > 0) {
      const popped = listStack.pop();
      html += `</li></${popped.type}>`;
    }
    return html;
  };

  for (let i = 0; i < listLines.length; i++) {
    const line = listLines[i];
    const ulMatch = line.match(/^(\s*)([-*+])\s+(.*)$/);
    const olMatch = line.match(/^(\s*)(\d+)\.\s+(.*)$/);

    if (ulMatch || olMatch) {
      const indent = (ulMatch || olMatch)[1].length;
      const type = ulMatch ? "ul" : "ol";
      let content = (ulMatch || olMatch)[3];

      if (content.startsWith("[ ] ")) {
        content = `<input type="checkbox" disabled class="task-checkbox mr-2 align-middle" />` + content.slice(4);
      } else if (content.startsWith("[x] ") || content.startsWith("[X] ")) {
        content = `<input type="checkbox" disabled checked class="task-checkbox mr-2 align-middle" />` + content.slice(4);
      }

      let lineHtml = "";

      if (listStack.length === 0) {
        listStack.push({ type, indent });
        lineHtml = `<${type} class="markdown-${type}"><li class="${type}-item">${content}`;
      } else {
        const top = listStack[listStack.length - 1];
        if (indent > top.indent) {
          listStack.push({ type, indent });
          lineHtml = `<${type} class="markdown-${type}"><li class="${type}-item">${content}`;
        } else if (indent < top.indent) {
          lineHtml += closeListsToIndent(indent);
          const currentTop = listStack[listStack.length - 1];
          if (currentTop && currentTop.type === type) {
            lineHtml += `</li><li class="${type}-item">${content}`;
          } else {
            if (currentTop) {
              listStack.pop();
              lineHtml += `</li></${currentTop.type}>`;
            }
            listStack.push({ type, indent });
            lineHtml += `<${type} class="markdown-${type}"><li class="${type}-item">${content}`;
          }
        } else {
          if (top.type === type) {
            lineHtml = `</li><li class="${type}-item">${content}`;
          } else {
            listStack.pop();
            listStack.push({ type, indent });
            lineHtml = `</li></${top.type}><${type} class="markdown-${type}"><li class="${type}-item">${content}`;
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

  // 12. Restore protected tables, inline codes, and code blocks
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

// ══ VERIFICATION SUITE ══
console.log("--- Testing Enhanced formatMarkdown Prototype ---");

// Test 1: Headings H1-H6
const headings = "# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6";
const rHeadings = formatMarkdown(headings);
console.log("H1 present:", rHeadings.includes('<h1 class="markdown-h1">Heading 1</h1>'));
console.log("H4 present:", rHeadings.includes('<h4 class="markdown-h4">Heading 4</h4>'));
console.log("H6 present:", rHeadings.includes('<h6 class="markdown-h6">Heading 6</h6>'));

// Test 2: Nested Lists
const nestedList = "- Level 1\n  - Level 2\n  - Level 2b\n- Level 1b";
const rList = formatMarkdown(nestedList);
console.log("Nested list valid nesting:", rList.includes('Level 1<ul class="markdown-ul"><li class="ul-item">Level 2</li>'));

// Test 3: Tables
const tableMarkdown = "| Name | Role | Score |\n| :--- | :---: | ---: |\n| Alice | Admin | 98 |\n| Bob | User | 85 |";
const rTable = formatMarkdown(tableMarkdown);
console.log("Table wrapper:", rTable.includes('class="table-wrapper overflow-x-auto'));
console.log("Table center align:", rTable.includes('style="text-align: center">Role</th>'));
console.log("Table right align:", rTable.includes('style="text-align: right">Score</th>'));
console.log("Table body Alice:", rTable.includes('<td class="px-3.5 py-2" style="text-align: left">Alice</td>'));
console.log("Table body Bob:", rTable.includes('<td class="px-3.5 py-2" style="text-align: left">Bob</td>'));

// Test 4: Safe Hyperlinks
const linkMarkdown = "Visit [TanixAI](https://tanixai.org) or [Hacker](javascript:alert(1))";
const rLinks = formatMarkdown(linkMarkdown);
console.log("Safe link:", rLinks.includes('<a href="https://tanixai.org" target="_blank" rel="noopener noreferrer" class="markdown-link">TanixAI</a>'));
console.log("Malicious link neutralized:", !rLinks.includes('javascript:alert(1)') && rLinks.includes('<span class="unsafe-link">Hacker</span>'));

// Test 5: Streaming unclosed code fence
const streamingSnippet = "Here is the code:\n```typescript\nconst message = 'hello';";
const rStreaming = formatMarkdown(streamingSnippet, { isStreaming: true });
console.log("Streaming code wrapper rendered:", rStreaming.includes('class="code-block-wrapper" data-language="typescript"'));
console.log("Streaming code escaped:", rStreaming.includes('const message = &#39;hello&#39;;'));
console.log("No raw backticks flash:", !rStreaming.includes("```"));

// Test 6: $ in code block (BUG-02 + $ replacement safety)
const dollarCode = "```bash\necho $1 and $2\n```";
const rDollar = formatMarkdown(dollarCode);
console.log("Dollar signs preserved in code:", rDollar.includes("echo $1 and $2"));

console.log("--- All Prototype Tests Completed ---");

// ══ BACKWARD COMPATIBILITY TEST ══
const input = "<script>alert('xss')</script>&\"test\"";
const escaped = escapeHtml(input);
console.log("Regression 1 XSS escape:", !escaped.includes("<script>") && escaped.includes("&lt;script&gt;") && escaped.includes("&amp;") && escaped.includes("&quot;"));

const codeSnippet = "```cpp\nif (a < b && c > d) {\n  return 0;\n}\n```";
const renderedCpp = formatMarkdown(codeSnippet);
console.log("Regression 2 code block wrapper:", renderedCpp.includes('class="code-block-wrapper"'));
console.log("Regression 2 code single escape:", renderedCpp.includes("if (a &lt; b &amp;&amp; c &gt; d)"));
console.log("Regression 2 no double escape:", !renderedCpp.includes("&amp;lt;") && !renderedCpp.includes("&amp;amp;"));

const listMarkdown = "1. First step\n2. Second step";
const renderedSteps = formatMarkdown(listMarkdown);
console.log("Regression 3 ol tag present:", renderedSteps.includes("<ol") && renderedSteps.includes("First step") && renderedSteps.includes("Second step"));
