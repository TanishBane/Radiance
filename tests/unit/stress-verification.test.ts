import { describe, it, expect } from "vitest";
import { formatMarkdown, escapeHtml, isSafeUrl, sanitizeUrl, sanitizeHtml } from "@/lib/utils/format";

describe("Empirical Challenger Stress Test Suite", () => {
  // ── 1. Malformed Tables ──
  describe("1. Malformed Tables", () => {
    it("handles uneven columns (row has fewer columns than header)", () => {
      const input = [
        "| Col A | Col B | Col C |",
        "| :--- | :---: | ---: |",
        "| only-one |",
        "| two | columns |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("<table");
      expect(rendered).toContain("only-one");
      expect(rendered).toContain("two");
      const trCount = (rendered.match(/<tr/g) || []).length;
      expect(trCount).toBe(3); // 1 header row + 2 body rows
    });

    it("handles uneven columns (row has more columns than header)", () => {
      const input = [
        "| Col A | Col B |",
        "| --- | --- |",
        "| 1 | 2 | 3 | 4 | 5 |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("<table");
      expect(rendered).toContain("<td");
    });

    it("handles escaped pipes \\| inside header and body cells", () => {
      const input = [
        "| Operation \\| Op | Syntax \\| Detail |",
        "| --- | --- |",
        "| Pipe \\| symbol | foo \\| bar |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("<table");
      expect(rendered).toContain("Operation | Op");
      expect(rendered).toContain("Syntax | Detail");
      expect(rendered).toContain("Pipe | symbol");
      expect(rendered).toContain("foo | bar");
      expect(rendered).not.toContain("\x1bPIPE\x1b");
    });

    it("gracefully falls back when delimiter row is missing or invalid", () => {
      const input = [
        "| Col A | Col B |",
        "| not a delimiter row |",
        "| 1 | 2 |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).not.toContain("<table");
      expect(rendered).toContain("Col A");
    });

    it("handles tables with no outer pipes", () => {
      const input = [
        "Col 1 | Col 2",
        "--- | ---",
        "Val 1 | Val 2",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("<table");
      expect(rendered).toContain("Col 1");
      expect(rendered).toContain("Val 1");
    });

    it("preserves and renders single-column tables successfully", () => {
      const input = [
        "| Single Header |",
        "| --- |",
        "| Row item 1 |",
        "| Row item 2 |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      // Under CommonMark / GFM, 1-column tables are valid tables.
      const hasTable = rendered.includes("<table");
      expect(hasTable).toBe(true);
    });

    it("preserves inline code and math inside table cells without token leakage", () => {
      const input = [
        "| Feature | Code Example | Math Formula |",
        "| --- | --- | --- |",
        "| Testing | `myFunc()` | $x^2 + y^2 = z^2$ |",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).not.toContain("__RAD_TOK_");
      expect(rendered).toContain("<code>myFunc()</code>");
      expect(rendered).toContain("math-inline");
    });
  });

  // ── 2. Deeply Nested Mixed Lists ──
  describe("2. Deeply Nested Mixed Lists", () => {
    it("handles 5+ levels of indentation in nested lists", () => {
      const input = [
        "- Level 1",
        "  - Level 2",
        "    - Level 3",
        "      - Level 4",
        "        - Level 5",
        "          - Level 6",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("Level 1");
      expect(rendered).toContain("Level 6");
      const openUl = (rendered.match(/<ul\b/g) || []).length;
      const closeUl = (rendered.match(/<\/ul>/g) || []).length;
      expect(openUl).toBe(closeUl);
    });

    it("handles alternating ordered and unordered lists at multiple depths", () => {
      const input = [
        "1. Ordered 1",
        "   - Unordered 1.1",
        "     1. Ordered 1.1.1",
        "        - Unordered 1.1.1.1",
        "2. Ordered 2",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("<ol");
      expect(rendered).toContain("<ul");
      expect(rendered).toContain("Ordered 1");
      expect(rendered).toContain("Unordered 1.1");
      expect(rendered).toContain("Ordered 1.1.1");
      expect(rendered).toContain("Unordered 1.1.1.1");
      expect(rendered).toContain("Ordered 2");
      const openOl = (rendered.match(/<ol\b/g) || []).length;
      const closeOl = (rendered.match(/<\/ol>/g) || []).length;
      expect(openOl).toBe(closeOl);
      const openUl = (rendered.match(/<ul\b/g) || []).length;
      const closeUl = (rendered.match(/<\/ul>/g) || []).length;
      expect(openUl).toBe(closeUl);
    });

    it("handles task checkboxes [ ] and [x] nested inside ordered and unordered lists", () => {
      const input = [
        "- Tasks for today",
        "  - [ ] Unfinished task",
        "  - [x] Completed task",
        "  - [X] Uppercase checked task",
        "    1. [ ] Sub-step in ordered list",
        "    2. [x] Finished sub-step",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain('type="checkbox"');
      expect(rendered).toContain("Unfinished task");
      expect(rendered).toContain("Completed task");
      expect(rendered).toContain("Sub-step in ordered list");
      const checkedBoxes = (rendered.match(/type="checkbox"[^>]*checked/g) || []).length;
      expect(checkedBoxes).toBe(3);
    });

    it("handles irregular indentation jumps without crashing or corrupting DOM", () => {
      const input = [
        "- Root item",
        "       - Big jump to 7 spaces",
        "  - Back to 2 spaces",
        "           - Jump to 11 spaces",
        "- Back to root",
      ].join("\n");
      const rendered = formatMarkdown(input);
      expect(rendered).toContain("Root item");
      expect(rendered).toContain("Big jump to 7 spaces");
      expect(rendered).toContain("Back to 2 spaces");
      expect(rendered).toContain("Back to root");
      const openUl = (rendered.match(/<ul\b/g) || []).length;
      const closeUl = (rendered.match(/<\/ul>/g) || []).length;
      expect(openUl).toBe(closeUl);
    });
  });

  // ── 3. Incomplete Streaming Inputs ──
  describe("3. Incomplete Streaming Inputs", () => {
    it("handles lone backticks in prose without crashing or misinterpreting", () => {
      const input = "Here is a ` lone backtick and another ` lone backtick.";
      const rendered = formatMarkdown(input);
      expect(rendered).toBeDefined();
      expect(typeof rendered).toBe("string");
    });

    it("handles unclosed code fence with language at EOF during active stream", () => {
      const input = "Explaining algorithm:\n```typescript\nfunction bubbleSort(arr: number[]) {\n  let n = arr.length;";
      const rendered = formatMarkdown(input, { isStreaming: true });
      expect(rendered).toContain('class="code-block-wrapper"');
      expect(rendered).toContain('data-language="typescript"');
      expect(rendered).toContain("bubbleSort");
      expect(rendered).not.toContain("```");
    });

    it("handles code block containing unclosed quotes during streaming", () => {
      const input = '```python\nquery = "SELECT * FROM users WHERE status = \'active';
      const rendered = formatMarkdown(input, { isStreaming: true });
      expect(rendered).toContain('class="code-block-wrapper"');
      expect(rendered).toContain("SELECT * FROM users");
      expect(rendered).not.toContain("```");
    });

    it("handles code blocks containing triple backticks in string literals", () => {
      const input = '```javascript\nconst markdown = "```code```";\nconsole.log(markdown);\n```';
      const rendered = formatMarkdown(input);
      expect(rendered).toContain('class="code-block-wrapper"');
      expect(rendered).toContain("markdown");
    });

    it("simulates character-by-character streaming without throwing exceptions", () => {
      const fullText = "# Streaming Demo\n\nHere is some code:\n```typescript\nconst x: number = 42;\nreturn x;\n```\n\nDone!";
      for (let i = 1; i <= fullText.length; i++) {
        const slice = fullText.slice(0, i);
        expect(() => formatMarkdown(slice, { isStreaming: true })).not.toThrow();
      }
    });

    it("handles unclosed math delimiters $ during streaming without crashing", () => {
      const input = "Let $x = 10 and $y = 20 be variables in";
      const rendered = formatMarkdown(input, { isStreaming: true });
      expect(rendered).toBeDefined();
    });
  });

  // ── 4. Massive Inputs & Performance ──
  describe("4. Massive Inputs & Performance", () => {
    it("renders a 100+ row table quickly without stack overflow or performance degradation", () => {
      const header = "| ID | Name | Email | Role | Status |\n| :--- | :--- | :--- | :---: | ---: |";
      const rows: string[] = [];
      for (let i = 1; i <= 150; i++) {
        rows.push(`| ${i} | User ${i} | user${i}@radiance.ai | Admin | Active |`);
      }
      const tableMarkdown = header + "\n" + rows.join("\n");

      const t0 = performance.now();
      const rendered = formatMarkdown(tableMarkdown);
      const duration = performance.now() - t0;

      expect(duration).toBeLessThan(500);
      expect(rendered).toContain("<table");
      expect(rendered).toContain("User 150");
      const rowCount = (rendered.match(/<tr/g) || []).length;
      expect(rowCount).toBe(151);
    });

    it("renders large code block (1000+ lines) within budget", () => {
      const codeLines: string[] = [];
      for (let i = 1; i <= 1000; i++) {
        codeLines.push(`const var_${i}: number = ${i} * 2; // Line ${i}`);
      }
      const markdown = "```typescript\n" + codeLines.join("\n") + "\n```";

      const t0 = performance.now();
      const rendered = formatMarkdown(markdown);
      const duration = performance.now() - t0;

      expect(duration).toBeLessThan(1000);
      expect(rendered).toContain('class="code-block-wrapper"');
      expect(rendered).toContain("var_1000");
    });

    it("renders long list (500 items) without stack overflow", () => {
      const listItems: string[] = [];
      for (let i = 1; i <= 500; i++) {
        listItems.push(`- Item number ${i} with detail`);
      }
      const markdown = listItems.join("\n");

      const t0 = performance.now();
      const rendered = formatMarkdown(markdown);
      const duration = performance.now() - t0;

      expect(duration).toBeLessThan(500);
      expect(rendered).toContain("Item number 500");
    });
  });

  // ── 5. Security & Polyglot Injection Edge Cases ──
  describe("5. Security & Polyglot Injection Edge Cases", () => {
    it("strips complex obfuscated javascript URIs", () => {
      const malicious = [
        "[click](jav&#x09;ascript:alert(1))",
        "[click](jav&#x0A;ascript:alert(1))",
        "[click](jav&#x0D;ascript:alert(1))",
        "[click](javascript%3aalert(1))",
      ];
      for (const m of malicious) {
        const rendered = formatMarkdown(m);
        expect(rendered).not.toContain('href="javascript');
        expect(rendered).not.toContain('href="jav');
      }
    });

    it("neutralizes nested script tags", () => {
      const input = "<<SCRIPT>script>alert(1)<</SCRIPT>/script>";
      const rendered = formatMarkdown(input);
      expect(rendered).not.toContain("<script>");
      expect(rendered).toContain("&lt;&lt;SCRIPT&gt;");
    });
  });
});
