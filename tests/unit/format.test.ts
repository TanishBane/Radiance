import { describe, it, expect } from "vitest";
import { formatMarkdown, formatRelativeTime, escapeHtml, sanitizeUrl, sanitizeHtml, isSafeUrl } from "@/lib/utils/format";

describe("Markdown & Formatting Utilities (Bug Fix Verification)", () => {
  it("escapes raw HTML to prevent XSS", () => {
    const input = `<script>alert('xss')</script>&"test"`;
    const escaped = escapeHtml(input);
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
    expect(escaped).toContain("&amp;");
    expect(escaped).toContain("&quot;");
  });

  it("does NOT double-escape code blocks (Fixes Verified Legacy BUG-02)", () => {
    const codeSnippet = "```cpp\nif (a < b && c > d) {\n  return 0;\n}\n```";
    const rendered = formatMarkdown(codeSnippet);

    // It should contain the code block wrapper
    expect(rendered).toContain('class="code-block-wrapper"');
    // Inside the <code> tag, < and & should be single-escaped as &lt; and &amp;, NEVER &amp;lt; or &amp;amp;
    expect(rendered).toContain("if (a &lt; b &amp;&amp; c &gt; d)");
    expect(rendered).not.toContain("&amp;lt;");
    expect(rendered).not.toContain("&amp;amp;");
  });

  it("renders lists with correct ol and ul tags", () => {
    const listMarkdown = "1. First step\n2. Second step";
    const rendered = formatMarkdown(listMarkdown);
    expect(rendered).toContain("<ol");
    expect(rendered).toContain("First step");
    expect(rendered).toContain("Second step");
  });

  it("calculates relative time correctly", () => {
    const now = Date.now();
    expect(formatRelativeTime(now - 10 * 1000)).toBe("just now");
    expect(formatRelativeTime(now - 5 * 60 * 1000)).toBe("5m ago");
    expect(formatRelativeTime(now - 3 * 3600 * 1000)).toBe("3h ago");
  });
});

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

  it("renders single-column tables inside responsive overflow wrapper", () => {
    const input = [
      "| Commands |",
      "| --- |",
      "| npm test |",
      "| npm run build |",
    ].join("\n");
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]">');
    expect(rendered).toContain('<table class="markdown-table w-full border-collapse text-left text-xs sm:text-sm">');
    expect(rendered).toContain('<th class="px-3.5 py-2.5" style="text-align: left">Commands</th>');
    expect(rendered).toContain('<td class="px-3.5 py-2" style="text-align: left">npm test</td>');
    expect(rendered).toContain('<td class="px-3.5 py-2" style="text-align: left">npm run build</td>');
    expect(rendered).not.toContain('<br />| Commands |');

    const thCount = (rendered.match(/<th\b/g) || []).length;
    expect(thCount).toBe(1);
    const tdCount = (rendered.match(/<td\b/g) || []).length;
    expect(tdCount).toBe(2);
  });

  it("supports column alignments (center, right, left) in single-column tables", () => {
    const centerTable = [
      "| Status |",
      "| :---: |",
      "| Active |",
    ].join("\n");
    const renderedCenter = formatMarkdown(centerTable);
    expect(renderedCenter).toContain('style="text-align: center">Status</th>');
    expect(renderedCenter).toContain('style="text-align: center">Active</td>');

    const rightTable = [
      "| Metrics |",
      "| ---: |",
      "| 99.9% |",
    ].join("\n");
    const renderedRight = formatMarkdown(rightTable);
    expect(renderedRight).toContain('style="text-align: right">Metrics</th>');
    expect(renderedRight).toContain('style="text-align: right">99.9%</td>');
  });

  it("preserves table rectangularity in single-column tables with uneven row columns", () => {
    const input = [
      "| Header |",
      "| --- |",
      "| Row 1 | extra column |",
      "| |",
    ].join("\n");
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<td class="px-3.5 py-2" style="text-align: left">Row 1</td>');
    expect(rendered).not.toContain("extra column</td>");
    expect(rendered).toContain('<td class="px-3.5 py-2" style="text-align: left"></td>');
  });

  it("does not treat horizontal rules as tables", () => {
    const input = "Section Header\n---\nBody paragraph text.";
    const rendered = formatMarkdown(input);
    expect(rendered).not.toContain("<table");
    expect(rendered).toContain('<hr class="markdown-hr" />');
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

describe("Code Blocks, Highlighting & Math Notation", () => {
  it("tokenizes TypeScript code with keywords, types, strings, and numbers", () => {
    const input = "```typescript\nconst count: number = 42;\nfunction getCount(): number {\n  return count;\n}\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token keyword">const</span>');
    expect(rendered).toContain('class="token type">number</span>');
    expect(rendered).toContain('class="token number">42</span>');
    expect(rendered).toContain('class="token keyword">function</span>');
    expect(rendered).toContain('class="token keyword">return</span>');
  });

  it("tokenizes Python code with keywords, comments, and booleans", () => {
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

  it("tokenizes CSS with properties, functions, and numbers", () => {
    const input = "```css\n.card {\n  display: flex;\n  color: var(--accent);\n  padding: 16px;\n}\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token property">display</span>');
    expect(rendered).toContain('class="token property">color</span>');
    expect(rendered).toContain('class="token function">var</span>');
    expect(rendered).toContain('class="token number">16px</span>');
  });

  it("tokenizes Bash shell commands and variables", () => {
    const input = '```bash\necho "Building project..."\nexport NODE_ENV=production\ncd $PROJECT_DIR\n```';
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="token keyword">echo</span>');
    expect(rendered).toContain('class="token keyword">export</span>');
    expect(rendered).toContain('class="token keyword">cd</span>');
    expect(rendered).toContain('class="token property">$PROJECT_DIR</span>');
  });

  it("normalizes language badges to uppercase", () => {
    const input = "```py\nx = 1\n```\n```ts\ny = 2\n```\n```sql\nSELECT 1;\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('<span class="code-block-lang">PYTHON</span>');
    expect(rendered).toContain('<span class="code-block-lang">TYPESCRIPT</span>');
    expect(rendered).toContain('<span class="code-block-lang">SQL</span>');
  });

  it("includes data-code attribute with raw unescaped code on copy button", () => {
    const rawCode = 'const greeting = "Hello <World> & Everyone";';
    const input = "```typescript\n" + rawCode + "\n```";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="code-copy-btn"');
    expect(rendered).toContain('data-code="const greeting = &quot;Hello &lt;World&gt; &amp; Everyone&quot;;"');
  });

  it("renders inline math with $...$ delimiters", () => {
    const input = "Einstein showed that $E = mc^2$ represents mass-energy equivalence.";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="math-inline"');
    expect(rendered).toContain("E = mc<sup>2</sup>");
  });

  it("renders block math with $$...$$ delimiters", () => {
    const input = "$$\\int_0^\\infty e^{-x} dx = 1$$";
    const rendered = formatMarkdown(input);
    expect(rendered).toContain('class="math-block"');
    expect(rendered).toContain('class="math-display"');
    expect(rendered).toContain("∫");
    expect(rendered).toContain("∞");
  });

  it("does not mistake currency symbols ($50, $100) for inline math", () => {
    const input = "The ticket costs $50 and the VIP pass is $100.";
    const rendered = formatMarkdown(input);
    expect(rendered).not.toContain("math-inline");
    expect(rendered).toContain("$50");
    expect(rendered).toContain("$100");
  });

  it("escapes HTML inside math fallback to prevent XSS", () => {
    const input = "$\\text{<script>alert(1)</script>}$";
    const rendered = formatMarkdown(input);
    expect(rendered).not.toContain("<script>");
    expect(rendered).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
  });
});

describe("HTML/Script Sanitization & Polyglot XSS Defenses", () => {
  it("neutralizes <script> tags and prevents execution", () => {
    const payloads = [
      "<script>alert('xss')</script>",
      "<script src='https://evil.com/evil.js'></script>",
      "<SCRIPT>alert(1)</SCRIPT>",
      "<script\x20type='text/javascript'>alert(1)</script>",
    ];
    for (const payload of payloads) {
      const rendered = formatMarkdown(payload);
      expect(rendered).not.toMatch(/<script\b/i);
      expect(rendered).not.toContain("alert('xss')");
    }
  });

  it("neutralizes <iframe>, <object>, and <embed> tags", () => {
    const payload = "<iframe src='https://evil.com'></iframe><object data='test.swf'></object><embed src='test.pdf'>";
    const rendered = formatMarkdown(payload);
    expect(rendered).not.toMatch(/<iframe\b/i);
    expect(rendered).not.toMatch(/<object\b/i);
    expect(rendered).not.toMatch(/<embed\b/i);
  });

  it("neutralizes inline event handlers (<img onerror>, <svg onload>, etc.)", () => {
    const payloads = [
      '<img src="x" onerror="alert(1)">',
      '<svg onload="alert(1)"><circle r="5"/></svg>',
      '<body onload="alert(1)">',
      '<details open ontoggle="alert(1)">Content</details>',
      '<input autofocus onfocus="alert(1)">',
      '<video><source onerror="alert(1)"></video>',
    ];
    for (const payload of payloads) {
      const rendered = formatMarkdown(payload);
      expect(rendered).not.toMatch(/\son[a-zA-Z]+\s*=/i);
    }
  });

  it("neutralizes dangerous URI protocols in markdown hyperlinks", () => {
    const dangerousLinks = [
      "[pwn](javascript:alert(document.cookie))",
      "[pwn](JaVaScRiPt:alert(1))",
      "[pwn](   javascript:alert(1))",
      "[pwn](javascript&#58;alert(1))",
      "[pwn](vbscript:msgbox(1))",
      "[pwn](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pik=)",
    ];
    for (const link of dangerousLinks) {
      const rendered = formatMarkdown(link);
      expect(rendered).not.toContain('href="javascript:');
      expect(rendered).not.toContain('href="vbscript:');
      expect(rendered).not.toContain('href="data:');
    }
  });

  it("permits safe hyperlinks with target='_blank' and rel='noopener noreferrer'", () => {
    const safeLink = "[Radiance AI](https://radiance.ai)";
    const rendered = formatMarkdown(safeLink);
    expect(rendered).toContain('href="https://radiance.ai"');
    expect(rendered).toContain('target="_blank"');
    expect(rendered).toContain('rel="noopener noreferrer"');
  });

  it("neutralizes polyglot XSS payloads without throwing or breaking layout", () => {
    const polyglot = `jaVasCript:/*-/*\` alert(1) /*'/*"/*/*/\`-->\\x3c/script>\\x3csvg/onload=alert(1)>`;
    const rendered = formatMarkdown(polyglot);
    expect(rendered).not.toMatch(/<script\b/i);
    expect(rendered).not.toMatch(/<svg[^>]*onload/i);
  });

  it("prevents delimiter collision attacks from user-supplied placeholder tokens", () => {
    const collisionInput = "Attacker injected: __RADIANCE_CODE_BLOCK_0__ followed by:\n```ts\nconst safe = true;\n```";
    const rendered = formatMarkdown(collisionInput);
    // The attacker's placeholder must NOT be converted to the code block
    // The real code block must be rendered at its proper position
    expect(rendered).toContain("Attacker injected:");
    expect(rendered).toContain("const safe = true;");
    expect(rendered).toContain('class="code-block-wrapper"');
  });

  it("safely handles dollar-sign replacement patterns in code blocks", () => {
    const dollarCode = '```sh\necho "$&" && echo "$1" && echo "$$" && echo "$\'"\n```';
    const rendered = formatMarkdown(dollarCode);
    expect(rendered).toContain('echo &quot;$&amp;&quot;');
    expect(rendered).toContain('echo &quot;$1&quot;');
    expect(rendered).toContain('echo &quot;$$&quot;');
    expect(rendered).not.toContain("__RAD_TOK_");
  });

  it("validates safe and unsafe URLs correctly", () => {
    expect(isSafeUrl("https://radiance.ai")).toBe(true);
    expect(isSafeUrl("http://localhost:3000")).toBe(true);
    expect(isSafeUrl("mailto:support@radiance.ai")).toBe(true);
    expect(isSafeUrl("/dashboard")).toBe(true);
    expect(isSafeUrl("#heading")).toBe(true);
    expect(isSafeUrl("javascript:alert(1)")).toBe(false);
    expect(isSafeUrl("data:text/html,<script>")).toBe(false);
    expect(isSafeUrl("vbscript:test")).toBe(false);

    expect(sanitizeUrl("https://radiance.ai")).toBe("https://radiance.ai");
    expect(sanitizeUrl("javascript:alert(1)")).toBe("#blocked-dangerous-protocol");
  });

  it("sanitizes HTML tags directly via sanitizeHtml", () => {
    expect(sanitizeHtml("<script>evil()</script>")).toBe("");
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toContain("#blocked-dangerous-protocol");
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toContain("onerror");
  });
});

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

describe("Parenthesized Markdown Hyperlinks", () => {
  it("renders URLs with balanced parentheses without truncation (e.g. Wikipedia links)", () => {
    const input = "Read [Function](https://en.wikipedia.org/wiki/Function_(mathematics)) in detail.";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain(
      '<a href="https://en.wikipedia.org/wiki/Function_(mathematics)" target="_blank" rel="noopener noreferrer" class="markdown-link">Function</a>'
    );
    expect(rendered).not.toContain("mathematics</a>)");
  });

  it("handles URLs with multiple balanced parentheses pairs", () => {
    const input = "See [Wiki Complex](https://en.wikipedia.org/wiki/Area_(mathematics)_(geometry)) here.";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain(
      '<a href="https://en.wikipedia.org/wiki/Area_(mathematics)_(geometry)" target="_blank" rel="noopener noreferrer" class="markdown-link">Wiki Complex</a>'
    );
  });

  it("handles URLs with two-level nested parentheses", () => {
    const input = "Refer to [Nested](https://example.com/path/(nested_(parens))) now.";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain(
      '<a href="https://example.com/path/(nested_(parens))" target="_blank" rel="noopener noreferrer" class="markdown-link">Nested</a>'
    );
  });

  it("preserves trailing prose parentheses when markdown link is enclosed in parentheses", () => {
    const input = "(more details at [Wiki](https://en.wikipedia.org/wiki/Function_(mathematics)))";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain(
      '(more details at <a href="https://en.wikipedia.org/wiki/Function_(mathematics)" target="_blank" rel="noopener noreferrer" class="markdown-link">Wiki</a>)'
    );
  });

  it("renders multiple links on the same line with balanced parentheses independently", () => {
    const input = "Compare [Math](https://en.wikipedia.org/wiki/Function_(mathematics)) with [Docs](https://radiance.ai/docs).";
    const rendered = formatMarkdown(input);

    expect(rendered).toContain('<a href="https://en.wikipedia.org/wiki/Function_(mathematics)"');
    expect(rendered).toContain('<a href="https://radiance.ai/docs"');
  });
});

