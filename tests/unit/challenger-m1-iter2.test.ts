import { describe, it, expect } from "vitest";
import { formatMarkdown, escapeHtml, isSafeUrl, sanitizeUrl, TokenManager } from "@/lib/utils/format";

describe("Milestone 1 Iteration 2 Challenger Verification", () => {
  // ──────────────────────────────────────────────────────────────────────────
  // Verification Area 1: Nested Inline Code & LaTeX Math in Tables
  // ──────────────────────────────────────────────────────────────────────────
  describe("1. Nested Inline Code & LaTeX Math in Tables", () => {
    it("expands single inline code and inline math in table cells without __RAD_TOK_", () => {
      const input = [
        "| Variable | Formula | Description |",
        "| :--- | :---: | ---: |",
        "| `energy` | $E = mc^2$ | Einstein's equation |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain("<code>energy</code>");
      expect(output).toContain('class="math-inline"');
      expect(output).toContain("<table");
      expect(output).toContain('class="table-wrapper overflow-x-auto');
    });

    it("expands multiple code and math tokens in the SAME cell", () => {
      const input = [
        "| Combined Cell | Note |",
        "| --- | --- |",
        "| Given `x = 5` and $f(x) = x^2$, compute `f(5)` = $25$ | Mixed tokens in single cell |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain("<code>x = 5</code>");
      expect(output).toContain("<code>f(5)</code>");
      const mathCount = (output.match(/class="math-inline"/g) || []).length;
      expect(mathCount).toBe(2);
    });

    it("preserves JS replacement patterns ($&, $1, $$, $', $`, $2) in table cells", () => {
      const input = [
        "| Pattern | Code Snippet | Math Representation |",
        "| :--- | :--- | :--- |",
        "| Full Match | `s.replace(p, '$&')` | $\\text{match} = \\$$ |",
        "| Group 1 | `s.replace(p, '$1')` | $g_1 = 1$ |",
        "| Literal Dollar | `s.replace(p, '$$')` | $\\text{cost} = \\$100$ |",
        "| Post-match | `s.replace(p, \"$'\")` | $x > 0$ |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain("s.replace(p, &#39;$&amp;&#39;)");
      expect(output).toContain("s.replace(p, &#39;$1&#39;)");
      expect(output).toContain("s.replace(p, &#39;$$&#39;)");
      expect(output).toContain("s.replace(p, &quot;$&#39;&quot;)");
    });

    it("restores 50+ mixed code and math tokens across a large table without leakage", () => {
      const rows = [
        "| Index | Code Expression | Formula |",
        "| :---: | :--- | :--- |",
      ];
      for (let i = 1; i <= 25; i++) {
        rows.push(`| ${i} | \`eval_${i}()\` | $\\sum_{j=1}^{${i}} j = \\frac{${i}(${i}+1)}{2}$ |`);
      }
      const tableMd = rows.join("\n");

      const t0 = performance.now();
      const output = formatMarkdown(tableMd);
      const elapsed = performance.now() - t0;

      expect(elapsed).toBeLessThan(1000);
      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain("<code>eval_1()</code>");
      expect(output).toContain("<code>eval_25()</code>");
      const rowCount = (output.match(/<tr/g) || []).length;
      expect(rowCount).toBe(26); // 1 header + 25 body
    });

    it("handles adversarial input where user explicitly writes __RAD_TOK_ in prose and code", () => {
      const input = [
        "User says: `__RAD_TOK_fake_0__` and fake math $x = 1$.",
        "| Col |",
        "| --- |",
        "| Literal `__RAD_TOK_fake_1__` in table |",
      ].join("\n");

      const output = formatMarkdown(input);

      // It should terminate normally without infinite loop, preserving the user's literal code text
      expect(output).toContain("<code>__RAD_TOK_fake_0__</code>");
      expect(output).toContain("<code>__RAD_TOK_fake_1__</code>");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Verification Area 2: Single-Column Tables
  // ──────────────────────────────────────────────────────────────────────────
  describe("2. Single-Column Tables Rendering & Wrappers", () => {
    it("renders single-column table with standard pipes and responsive wrapper", () => {
      const input = [
        "| Task List |",
        "| --- |",
        "| Design Architecture |",
        "| Implement Handlers |",
        "| Verification Gate |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).toContain('<div class="table-wrapper overflow-x-auto my-3 rounded-lg border border-[var(--border)]">');
      expect(output).toContain('<table class="markdown-table w-full border-collapse text-left text-xs sm:text-sm">');
      expect(output).toContain('<th class="px-3.5 py-2.5" style="text-align: left">Task List</th>');
      expect(output).toContain('<td class="px-3.5 py-2" style="text-align: left">Design Architecture</td>');
      expect(output).toContain('<td class="px-3.5 py-2" style="text-align: left">Implement Handlers</td>');
      expect(output).toContain('<td class="px-3.5 py-2" style="text-align: left">Verification Gate</td>');
    });

    it("respects single-column center and right alignments", () => {
      const centerTable = [
        "| Centered Header |",
        "| :---: |",
        "| Centered Cell |",
      ].join("\n");
      const centerOutput = formatMarkdown(centerTable);
      expect(centerOutput).toContain('<th class="px-3.5 py-2.5" style="text-align: center">Centered Header</th>');
      expect(centerOutput).toContain('<td class="px-3.5 py-2" style="text-align: center">Centered Cell</td>');

      const rightTable = [
        "| Right Header |",
        "| ---: |",
        "| Right Cell |",
      ].join("\n");
      const rightOutput = formatMarkdown(rightTable);
      expect(rightOutput).toContain('<th class="px-3.5 py-2.5" style="text-align: right">Right Header</th>');
      expect(rightOutput).toContain('<td class="px-3.5 py-2" style="text-align: right">Right Cell</td>');
    });

    it("renders single-column table with minimal hyphens in delimiter (| - |)", () => {
      const input = [
        "| Minimal |",
        "| - |",
        "| Item 1 |",
      ].join("\n");

      const output = formatMarkdown(input);
      expect(output).toContain("<table");
      expect(output).toContain("Minimal");
      expect(output).toContain("Item 1");
    });

    it("renders single-column table without leading pipe (| on right only)", () => {
      const input = [
        "Single Header |",
        "--- |",
        "Single Row |",
      ].join("\n");

      const output = formatMarkdown(input);
      expect(output).toContain("<table");
      expect(output).toContain("Single Header");
      expect(output).toContain("Single Row");
    });

    it("renders single-column table without trailing pipe (| on left only)", () => {
      const input = [
        "| Single Header",
        "| ---",
        "| Single Row",
      ].join("\n");

      const output = formatMarkdown(input);
      expect(output).toContain("<table");
      expect(output).toContain("Single Header");
      expect(output).toContain("Single Row");
    });

    it("does NOT mistake standard horizontal rules (---) for a table delimiter", () => {
      const input = [
        "Some preceding paragraph text",
        "---",
        "Some succeeding paragraph text",
      ].join("\n");

      const output = formatMarkdown(input);
      expect(output).not.toContain("<table");
      expect(output).toContain('<hr class="markdown-hr" />');
    });

    it("handles adversarial delimiter line with 10,000 characters without catastrophic backtracking", () => {
      const hostileDelimiter = "|" + "-".repeat(10000) + "|";
      const input = [
        "| Long Header |",
        hostileDelimiter,
        "| Cell Value |",
      ].join("\n");

      const t0 = performance.now();
      const output = formatMarkdown(input);
      const elapsed = performance.now() - t0;

      expect(elapsed).toBeLessThan(100);
      expect(output).toContain("<table");
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Verification Area 3: Parenthesized URLs
  // ──────────────────────────────────────────────────────────────────────────
  describe("3. Parenthesized URLs Parsing Without Truncation", () => {
    it("parses single-level balanced parentheses in Wikipedia URLs", () => {
      const input = "Check [Rust Language](https://en.wikipedia.org/wiki/Rust_(programming_language)) today.";
      const output = formatMarkdown(input);

      expect(output).toContain(
        '<a href="https://en.wikipedia.org/wiki/Rust_(programming_language)" target="_blank" rel="noopener noreferrer" class="markdown-link">Rust Language</a>'
      );
      expect(output).not.toContain("programming_language</a>)");
    });

    it("parses multiple parentheses pairs in a single URL", () => {
      const input = "Read [Disambiguation](https://en.wikipedia.org/wiki/Mercury_(planet)_(disambiguation)) here.";
      const output = formatMarkdown(input);

      expect(output).toContain(
        '<a href="https://en.wikipedia.org/wiki/Mercury_(planet)_(disambiguation)" target="_blank" rel="noopener noreferrer" class="markdown-link">Disambiguation</a>'
      );
    });

    it("parses two-level nested parentheses in query parameters", () => {
      const input = "Query API: [Search](https://api.example.com/v1/search?filter=(status(active))&sort=desc) results.";
      const output = formatMarkdown(input);

      expect(output).toContain(
        '<a href="https://api.example.com/v1/search?filter=(status(active))&amp;sort=desc" target="_blank" rel="noopener noreferrer" class="markdown-link">Search</a>'
      );
    });

    it("preserves surrounding prose parentheses", () => {
      const input = "For reference, see (article: [Matrix](https://en.wikipedia.org/wiki/Matrix_(mathematics))).";
      const output = formatMarkdown(input);

      expect(output).toContain(
        '(article: <a href="https://en.wikipedia.org/wiki/Matrix_(mathematics)" target="_blank" rel="noopener noreferrer" class="markdown-link">Matrix</a>).'
      );
    });

    it("parses parenthesized URLs inside single-column and multi-column table cells", () => {
      const input = [
        "| Subject | Reference Link |",
        "| :--- | :--- |",
        "| Mathematics | [Function](https://en.wikipedia.org/wiki/Function_(mathematics)) |",
        "| Single Column Table Follows: |",
      ].join("\n");

      const output = formatMarkdown(input);
      expect(output).toContain('<a href="https://en.wikipedia.org/wiki/Function_(mathematics)"');
    });

    it("neutralizes dangerous protocols even when containing parentheses", () => {
      const malicious = [
        "[Exploit](javascript:alert(1))",
        "[Exploit 2](javascript:(function(){alert(1)})())",
        "[Exploit 3](vbscript:MsgBox(1))",
        "[Exploit 4](data:text/html,(<script>alert(1)</script>))",
      ];

      for (const m of malicious) {
        const output = formatMarkdown(m);
        expect(output).not.toContain('href="javascript');
        expect(output).not.toContain('href="vbscript');
        expect(output).not.toContain('href="data');
        expect(output).toContain('class="unsafe-link"');
      }
    });

    it("prevents catastrophic backtracking on hostile string with repeated parentheses", () => {
      const hostile = "[Link](" + "(".repeat(50) + "https://example.com" + ")".repeat(50);
      const t0 = performance.now();
      const output = formatMarkdown(hostile);
      const elapsed = performance.now() - t0;

      expect(elapsed).toBeLessThan(100);
      expect(output).toBeDefined();
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // Verification Area 4: Integrated Cross-Feature Boundary Stress
  // ──────────────────────────────────────────────────────────────────────────
  describe("4. Integrated Cross-Feature Boundary Stress", () => {
    it("handles pipes inside inline code within table cells without breaking column split", () => {
      const input = [
        "| Command | Syntax |",
        "| :--- | :--- |",
        "| Or Operator | `a || b` |",
        "| Pipe Command | `cat file | grep text` |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain("<table");
      expect(output).toContain("<code>a || b</code>");
      expect(output).toContain("<code>cat file | grep text</code>");
      // Check column count is strictly 2
      const firstRowCells = (output.match(/<td/g) || []).length;
      expect(firstRowCells).toBe(4); // 2 rows * 2 cells = 4
    });

    it("renders single-column table containing parenthesized URL, inline code, and LaTeX math", () => {
      const input = [
        "| Research Summary |",
        "| :---: |",
        "| Model definition: `fit(X, y)` |",
        "| Loss formula: $\\mathcal{L}_{\\theta}(x) = \\frac{1}{2}(y - \\hat{y})^2$ |",
        "| Reference: [Paper](https://en.wikipedia.org/wiki/Loss_function_(statistics)) |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      expect(output).toContain('<div class="table-wrapper overflow-x-auto');
      expect(output).toContain("<code>fit(X, y)</code>");
      expect(output).toContain('class="math-inline"');
      expect(output).toContain('<a href="https://en.wikipedia.org/wiki/Loss_function_(statistics)"');
      expect(output).toContain('style="text-align: center"');
    });

    it("renders multiple consecutive tables with code and math blocks in between", () => {
      const input = [
        "| Table 1 |",
        "| --- |",
        "| Item `A` with $x = 1$ |",
        "",
        "```python",
        "def compute():",
        "    return 42",
        "```",
        "",
        "| Col X | Col Y |",
        "| --- | --- |",
        "| Val `B` | Math $y = 2$ |",
      ].join("\n");

      const output = formatMarkdown(input);

      expect(output).not.toContain("__RAD_TOK_");
      expect(output).not.toContain("\x1a");
      const tableCount = (output.match(/class="table-wrapper/g) || []).length;
      expect(tableCount).toBe(2);
      expect(output).toContain('class="code-block-wrapper"');
      expect(output).toContain("<code>A</code>");
      expect(output).toContain("<code>B</code>");
    });
  });
});

