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
 * Formats markdown into safe HTML without double-escaping entities in code blocks.
 * Solves verified legacy bug BUG-02.
 */
export function formatMarkdown(raw: string): string {
  if (!raw) return "";

  // 1. Extract fenced code blocks with placeholders to protect them from downstream regexes
  const codeBlocks: string[] = [];
  let processed = raw.replace(/```([a-zA-Z0-9_-]*)\n?([\s\S]*?)```/g, (_, lang, code) => {
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
    return `__RADIANCE_CODE_BLOCK_${idx}__`;
  });

  // 2. Extract inline code
  const inlineCodes: string[] = [];
  processed = processed.replace(/`([^`\n]+)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `__RADIANCE_INLINE_CODE_${idx}__`;
  });

  // 3. Escape normal text outside of code blocks
  processed = escapeHtml(processed);

  // 4. Transform markdown structural tags
  processed = processed
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr />")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>")
    // Ordered lists
    .replace(/^(\d+)\. (.+)$/gm, "<li class=\"ol-item\">$2</li>")
    // Unordered lists
    .replace(/^[-*] (.+)$/gm, "<li class=\"ul-item\">$1</li>")
    // Group list items into proper wrapper tags
    .replace(/(<li class="ol-item">.*<\/li>(\n|$))+/g, (m) => `<ol>${m}</ol>`)
    .replace(/(<li class="ul-item">.*<\/li>(\n|$))+/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n/g, "<br />");

  // 5. Restore protected code blocks and inline code
  codeBlocks.forEach((block, idx) => {
    processed = processed.replace(`__RADIANCE_CODE_BLOCK_${idx}__`, block);
  });
  inlineCodes.forEach((inline, idx) => {
    processed = processed.replace(`__RADIANCE_INLINE_CODE_${idx}__`, inline);
  });

  return processed;
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
