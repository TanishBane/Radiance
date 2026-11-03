import { describe, it, expect } from "vitest";
import { formatMarkdown, escapeHtml, sanitizeUrl, sanitizeHtml, isSafeUrl } from "@/lib/utils/format";
import { renderFallbackMath, renderMath } from "@/lib/utils/math-renderer";

/**
 * Helper to parse rendered HTML into a real DOM tree in JSDOM
 * and verify structural XSS immunity.
 */
function parseAndAssertDomSafety(html: string): HTMLDivElement {
  const container = document.createElement("div");
  container.innerHTML = html;

  // 1. Zero active script tags
  const scripts = container.querySelectorAll("script");
  expect(scripts.length, `Expected 0 <script> tags but found ${scripts.length}`).toBe(0);

  // 2. Zero iframes
  const iframes = container.querySelectorAll("iframe");
  expect(iframes.length, `Expected 0 <iframe> tags but found ${iframes.length}`).toBe(0);

  // 3. Zero active object/embed/applet/meta/base/form tags
  const activeTags = container.querySelectorAll("object, embed, applet, meta, base, form");
  expect(activeTags.length, `Expected 0 active executable elements but found ${activeTags.length}`).toBe(0);

  // 4. Zero inline event handlers and zero dangerous URIs across all elements
  const allElements = container.querySelectorAll("*");
  allElements.forEach((el) => {
    // Check all attributes on every element
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      const attrName = attr.name.toLowerCase();
      const attrValue = attr.value.toLowerCase().trim();

      // No on* event handlers allowed
      expect(
        attrName.startsWith("on"),
        `Found forbidden inline event handler '${attr.name}' on <${el.tagName.toLowerCase()}> with value '${attr.value}'`
      ).toBe(false);

      // Check href attributes for dangerous schemes
      if (attrName === "href") {
        const decoded = attrValue.replace(/[\x00-\x1f\x7f-\x9f\s]/g, "");
        expect(
          /^(?:javascript|vbscript|data|file|blob):/i.test(decoded),
          `Found dangerous protocol in href: ${attr.value}`
        ).toBe(false);
      }

      // Check src attributes for dangerous schemes
      if (attrName === "src") {
        const decoded = attrValue.replace(/[\x00-\x1f\x7f-\x9f\s]/g, "");
        expect(
          /^(?:javascript|vbscript|data:text\/html):/i.test(decoded),
          `Found dangerous protocol in src: ${attr.value}`
        ).toBe(false);
      }
    }
  });

  return container;
}

describe("Adversarial Stress Test: Polyglot XSS Attacks", () => {
  const hostilePayloads = [
    // Standard script vectors
    "<script>alert('xss')</script>",
    "<sCrIpt>alert(1)</ScRiPt>",
    "<script src='https://evil.com/evil.js'></script>",
    "<script/x>alert(1)</script>",
    "<script\x20type='text/javascript'>alert(1)</script>",
    "<script\n>alert(1)</script>",
    "<<SCRIPT>alert('XSS');//<</SCRIPT>",

    // Image and media event handlers
    '<img src="x" onerror="alert(1)">',
    '<img src=x onerror=alert(1)>',
    '<img/src="x"/onerror="alert(1)">',
    '<image src="x" onerror="alert(1)">',
    '<video poster="x" onerror="alert(1)"></video>',
    '<audio src="x" onerror="alert(1)"></audio>',

    // SVG vectors
    '<svg onload="alert(1)"><circle r="5"/></svg>',
    '<svg/onload=alert(1)>',
    '<svg><script>alert(1)</script></svg>',
    '<svg><animate onbegin=alert(1) attributeName=x dur=1s>',

    // IFrame and embedded objects
    '<iframe src="javascript:alert(1)"></iframe>',
    '<iframe srcdoc="<script>alert(1)</script>"></iframe>',
    '<object data="javascript:alert(1)"></object>',
    '<embed src="javascript:alert(1)">',
    '<applet code="Malicious.class"></applet>',

    // Form and input vectors
    '<form action="javascript:alert(1)"><input type="submit"></form>',
    '<input autofocus onfocus="alert(1)">',
    '<textarea autofocus onfocus="alert(1)">',
    '<select autofocus onfocus="alert(1)"><option>1</option></select>',
    '<button form="test" formaction="javascript:alert(1)">click</button>',

    // HTML5 details/dialog/marquee/body
    '<details open ontoggle="alert(1)">Content</details>',
    '<dialog open onclose="alert(1)">Content</dialog>',
    '<body onload="alert(1)">',
    '<marquee onstart="alert(1)">marquee</marquee>',

    // MathML and exotic vectors
    '<math><mtext><table><mglyph><style><!--</style><img src=1 onerror=alert(1)>',
    '<style>@import "javascript:alert(1)";</style>',

    // Complex polyglots
    `jaVasCript:/*-/*\` alert(1) /*'/*"/*/*/\`-->\\x3c/script>\\x3csvg/onload=alert(1)>`,
    `'"><script>alert(1)</script>`,
    `<img src=1 href=1 onerror="javascript:alert(1)"></img>`,
  ];

  it("neutralizes every hostile payload without executing active scripts or inline event handlers in DOM", () => {
    for (const payload of hostilePayloads) {
      const rendered = formatMarkdown(payload);
      parseAndAssertDomSafety(rendered);
    }
  });

  it("handles malicious payloads embedded inside markdown constructs (headings, blockquotes, lists, tables)", () => {
    const markdownAttacks = [
      "# Heading <script>alert(1)</script>",
      "> Blockquote <img src=x onerror=alert(1)>",
      "- List item <svg onload=alert(1)>",
      "1. Ordered item <iframe src='javascript:alert(1)'></iframe>",
      "| Col 1 | Col 2 |\n| --- | --- |\n| Cell <details open ontoggle=alert(1)> | safe |",
    ];

    for (const attack of markdownAttacks) {
      const rendered = formatMarkdown(attack);
      parseAndAssertDomSafety(rendered);
    }
  });

  it("handles event handlers in various attribute quotings and encodings in DOM", () => {
    const variations = [
      '<div onmouseover="alert(1)">hover</div>',
      "<div onmouseover='alert(1)'>hover</div>",
      "<div onmouseover=alert(1)>hover</div>",
      '<div OnMouseOver="alert(1)">hover</div>',
      '<div ONCLICK="alert(1)">click</div>',
      '<div onfocus="alert(1)" autofocus>focus</div>',
      '<div onblur="alert(1)">blur</div>',
      '<img\nonerror="alert(1)" src="x">',
      '<img\tonerror="alert(1)" src="x">',
    ];

    for (const v of variations) {
      const rendered = formatMarkdown(v);
      parseAndAssertDomSafety(rendered);
    }
  });

  it("neutralizes nested script evasion attempts directly in sanitizeHtml", () => {
    const evasions = [
      "<scr<script>ipt>alert(1)</script>",
      "<SCR<script>IPT>alert(1)</SCRIPT>",
      "<<script>script>alert(1)<</script>/script>",
      "<iframe<iframe src='bad'></iframe>",
    ];

    for (const evasion of evasions) {
      const sanitized = sanitizeHtml(evasion);
      expect(sanitized).not.toMatch(/<script\b/i);
      expect(sanitized).not.toMatch(/<iframe\b/i);
    }
  });
});

describe("Adversarial Stress Test: Dangerous Protocols & Links", () => {
  const dangerousLinks = [
    "[pwn](javascript:alert(1))",
    "[pwn](JAVASCRIPT:alert(1))",
    "[pwn](JaVaScRiPt:alert(1))",
    "[pwn](   javascript:alert(1)   )",
    "[pwn](\njavascript:alert(1)\n)",
    "[pwn](javascript&#58;alert(1))",
    "[pwn](javascript&#x3a;alert(1))",
    "[pwn](javascript&#X3A;alert(1))",
    "[pwn](javascript&colon;alert(1))",
    "[pwn](jav&#x09;ascript:alert(1))",
    "[pwn](vbscript:msgbox(1))",
    "[pwn](VBSCRIPT:msgbox(1))",
    "[pwn](data:text/html,<script>alert(1)</script>)",
    "[pwn](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pik=)",
    "[pwn](data:image/svg+xml,<svg onload=alert(1)>)",
    "[pwn](file:///etc/passwd)",
    "[pwn](file://C:/Windows/System32)",
    "[pwn](blob:https://example.com/uuid)",
    "[pwn](javascript%3aalert(1))",
  ];

  it("blocks dangerous link protocols from being rendered as functional clickable hrefs in DOM", () => {
    for (const link of dangerousLinks) {
      const rendered = formatMarkdown(link);
      const container = parseAndAssertDomSafety(rendered);

      // Links with dangerous protocols must not have an active <a> tag with dangerous href
      const anchor = container.querySelector("a");
      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        expect(/^(?:javascript|vbscript|data|file|blob):/i.test(href)).toBe(false);
      }
    }
  });

  it("handles link attribute breakout attempts in DOM", () => {
    const breakoutLinks = [
      '[click](https://example.com" onclick="alert(1))',
      "[click](https://example.com' onfocus='alert(1))",
      '[click](https://example.com" target="_self" onclick="alert(1))',
    ];

    for (const link of breakoutLinks) {
      const rendered = formatMarkdown(link);
      parseAndAssertDomSafety(rendered);
    }
  });

  it("allows legitimately safe protocols with target='_blank' and rel='noopener noreferrer'", () => {
    const safeLinks = [
      "[HTTPS](https://radiance.ai)",
      "[HTTP](http://localhost:3000)",
      "[Mail](mailto:support@radiance.ai)",
      "[Tel](tel:+1234567890)",
      "[Anchor](#section-1)",
      "[Relative](/docs/api)",
    ];

    for (const link of safeLinks) {
      const rendered = formatMarkdown(link);
      const container = parseAndAssertDomSafety(rendered);
      const anchor = container.querySelector("a");
      expect(anchor).not.toBeNull();
      expect(anchor?.getAttribute("target")).toBe("_blank");
      expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
    }
  });
});

describe("Adversarial Stress Test: Currency Strings vs LaTeX Math", () => {
  it("preserves single currency values as plain text without math wrapping", () => {
    const singleCurrency = [
      "The price is $50.",
      "A coffee costs $3.50 in NYC.",
      "Enterprise license costs $50,000 per year.",
      "Discounted to $0.99 for today only.",
      "Starts at $5.",
      "$10 is the price.",
      "Total: $100",
    ];

    for (const text of singleCurrency) {
      const rendered = formatMarkdown(text);
      expect(rendered).not.toContain('class="math-inline"');
      expect(rendered).not.toContain('class="math-block"');
      expect(rendered).toContain("$");
    }
  });

  it("preserves multiple currency values in the same sentence without confusing them for inline math", () => {
    const multiCurrency = [
      "The standard ticket is $50 and the VIP pass is $100.",
      "Apples are $2.50, oranges are $3.00, and pears are $4.25.",
      "Price ranges from $10 to $20.",
      "The bundle is $10-$20 depending on quantity.",
      "Revenue went from $1,000 to $2,500 this quarter.",
      "Compare $10, $20, $30, and $40 tiers.",
    ];

    for (const text of multiCurrency) {
      const rendered = formatMarkdown(text);
      expect(rendered).not.toContain('class="math-inline"');
      expect(rendered).not.toContain('class="math-block"');
    }
  });

  it("correctly differentiates real inline math from currency in the same document", () => {
    const mixed = "The sensor costs $50 and measures energy according to $E = mc^2$, where $m$ is mass.";
    const rendered = formatMarkdown(mixed);

    // Math parts should render with math-inline
    expect(rendered).toContain('class="math-inline"');
    expect(rendered.includes("katex") || rendered.includes("E = mc<sup>2</sup>")).toBe(true);
    // Currency part should NOT be converted to math
    expect(rendered).toContain("$50");

    const mixed2 = "Formula $x_1 + x_2 = 10$ yielded a profit of $500.";
    const rendered2 = formatMarkdown(mixed2);
    expect(rendered2).toContain('class="math-inline"');
    expect(rendered2).toContain("$500");
  });

  it("handles escaped dollar signs properly", () => {
    const escaped = "Cost is \\$50 and \\$100.";
    const rendered = formatMarkdown(escaped);
    expect(rendered).not.toContain('class="math-inline"');
    expect(rendered).toContain("$50");
    expect(rendered).toContain("$100");
  });

  it("renders complex valid inline and block math correctly", () => {
    const validMath = [
      "$x^2 + y^2 = z^2$",
      "$\\alpha + \\beta = \\gamma$",
      "$\\frac{1}{2}$",
      "$\\sqrt{16} = 4$",
      "$$\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$",
      "$$\\int_{0}^{1} x dx = \\frac{1}{2}$$",
      "$\\alpha \\le \\beta \\iff \\gamma \\ge \\delta$",
    ];

    for (const math of validMath) {
      const rendered = formatMarkdown(math);
      const hasMath = rendered.includes('class="math-inline"') || rendered.includes('class="math-block"');
      expect(hasMath).toBe(true);
    }
  });

  it("renders LaTeX math notation inside table cells without token leakage", () => {
    const tableWithMath = [
      "| Equation | Description |",
      "| --- | --- |",
      "| $E = mc^2$ | Mass-energy equivalence |",
    ].join("\n");
    const rendered = formatMarkdown(tableWithMath);
    expect(rendered).not.toContain("__RAD_TOK_");
    expect(rendered).toContain('class="math-inline"');
  });
});

describe("Adversarial Stress Test: Broken & Malformed Math Syntax", () => {
  it("does not throw or crash on broken block math syntax", () => {
    const brokenBlockMath = [
      "$$\\frac{1}{$$",
      "$$\\sqrt{$$",
      "$$\\text{unclosed$$",
      "$$$$",
      "$$   $$",
      "$$\\frac{a}{b",
      "$$",
      "$$$math$$$",
    ];

    for (const broken of brokenBlockMath) {
      expect(() => formatMarkdown(broken)).not.toThrow();
      const rendered = formatMarkdown(broken);
      expect(typeof rendered).toBe("string");
    }
  });

  it("does not throw or crash on broken inline math syntax", () => {
    const brokenInlineMath = [
      "$\\sqrt{$",
      "$\\frac{1}{$",
      "$a + b",
      "$$$",
      "$\\text{hello$",
      "$",
    ];

    for (const broken of brokenInlineMath) {
      expect(() => formatMarkdown(broken)).not.toThrow();
      const rendered = formatMarkdown(broken);
      expect(typeof rendered).toBe("string");
    }
  });

  it("neutralizes XSS payloads embedded inside math expressions in DOM", () => {
    const hostileMath = [
      "$\\text{<script>alert(1)</script>}$",
      "$$\\frac{<img src=x onerror=alert(1)>}{2}$$",
      "$$\\text{\" onmouseover=\"alert(1)}$$",
      "$\\sqrt{<iframe src='javascript:alert(1)'>}$",
      "$x^{<svg onload=alert(1)>}$",
    ];

    for (const math of hostileMath) {
      const rendered = formatMarkdown(math);
      parseAndAssertDomSafety(rendered);
    }
  });

  it("does not parse math expressions inside fenced code blocks or inline code", () => {
    const codeWithMath = "```python\nprice = '$50'\nformula = '$E = mc^2$'\n```";
    const rendered = formatMarkdown(codeWithMath);
    expect(rendered).not.toContain('class="math-inline"');
    expect(rendered).toContain('class="code-block-wrapper"');

    const inlineCodeWithMath = "Use `$E = mc^2$` in your paper.";
    const renderedInline = formatMarkdown(inlineCodeWithMath);
    expect(renderedInline).toContain("<code>$E = mc^2$</code>");
    expect(renderedInline).not.toContain('class="math-inline"');
  });

  it("handles standalone renderMath calls safely without crashing", () => {
    expect(() => renderMath("", false)).not.toThrow();
    expect(() => renderMath("  ", true)).not.toThrow();
    expect(() => renderFallbackMath("<script>bad()</script>", false)).not.toThrow();
    const fallbackResult = renderFallbackMath("<script>bad()</script>", false);
    expect(fallbackResult).not.toContain("<script>");
    expect(fallbackResult).toContain("&lt;script&gt;");
  });
});

describe("Adversarial Stress Test: Token Collision & Substitution Resilience", () => {
  it("prevents delimiter collision from user inputs matching internal token patterns", () => {
    const collisionPayloads = [
      "\x1a__RAD_TOK_0_0__\x1a",
      "\x1a__RAD_TOK_nonce_1__\x1a",
      "__RAD_TOK_",
      "__RADIANCE_CODE_BLOCK_0__",
      "__RADIANCE_CODE_BLOCK_99__",
    ];

    for (const payload of collisionPayloads) {
      const input = `User says: ${payload} and then provides code:\n\`\`\`ts\nconst x = 1;\n\`\`\``;
      const rendered = formatMarkdown(input);

      expect(rendered).toContain("User says:");
      expect(rendered).toContain('class="code-block-wrapper"');
      expect(rendered).toContain("const x = 1;");
    }
  });

  it("preserves JavaScript special replacement strings ($&, $', $`, $1, $$) without corruption", () => {
    const bashCode = '```bash\necho "$&" && echo "$1" && echo "$$" && echo "$\'" && echo "$`"\n```';
    const renderedBash = formatMarkdown(bashCode);
    expect(renderedBash).not.toContain("__RAD_TOK_");
    expect(renderedBash).toContain("$&amp;");
    expect(renderedBash).toContain("$1");
    expect(renderedBash).toContain("$$");

    const inlineCode = 'Inline code: `$&, $\', $`, $1, $$`';
    const renderedInline = formatMarkdown(inlineCode);
    expect(renderedInline).not.toContain("__RAD_TOK_");
    expect(renderedInline).toContain("$1");

    const tableInput = '| Col 1 | Col 2 |\n| --- | --- |\n| $& | $\' |';
    const renderedTable = formatMarkdown(tableInput);
    expect(renderedTable).not.toContain("__RAD_TOK_");
    expect(renderedTable).toContain("$&amp;");
    expect(renderedTable).toContain("$&#39;");
  });
});

describe("Adversarial Stress Test: High-Volume & Boundary Pressure", () => {
  it("handles very large unclosed code blocks without catastrophic backtracking", () => {
    const largeUnclosed = "```typescript\n" + "const val = 1;\n".repeat(5000);
    const start = Date.now();
    const rendered = formatMarkdown(largeUnclosed, { isStreaming: true });
    const duration = Date.now() - start;

    expect(duration).toBeLessThan(1000); // Must complete within 1s
    expect(rendered).toContain('class="code-block-wrapper"');
    parseAndAssertDomSafety(rendered);
  });

  it("handles deeply nested markdown lists without stack overflow", () => {
    let nested = "";
    for (let i = 0; i < 50; i++) {
      nested += "  ".repeat(i) + `- Item level ${i}\n`;
    }
    const rendered = formatMarkdown(nested);
    expect(rendered).toContain('<ul class="markdown-ul">');
    expect(rendered).toContain("Item level 49");
    parseAndAssertDomSafety(rendered);
  });

  it("handles massive tables without memory exhaustion or degradation", () => {
    let table = "| Header A | Header B |\n| --- | --- |\n";
    for (let i = 0; i < 500; i++) {
      table += `| Row ${i} A | Row ${i} B |\n`;
    }
    const rendered = formatMarkdown(table);
    expect(rendered).toContain('<div class="table-wrapper overflow-x-auto');
    expect(rendered).toContain("Row 499 B");
    parseAndAssertDomSafety(rendered);
  });
});
