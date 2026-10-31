import { describe, it, expect } from "vitest";
import { formatMarkdown, formatRelativeTime, escapeHtml } from "@/lib/utils/format";

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
    expect(rendered).toContain("<ol>");
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
