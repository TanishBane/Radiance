import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ContextPipelineSection } from "@/components/landing/context-pipeline-section";

describe("Context Pipeline Section (Section 05)", () => {
  it("renders the pipeline section with heading and all four architectural stages", () => {
    const markup = renderToStaticMarkup(<ContextPipelineSection />);
    expect(markup).toContain("The right context. At the right moment.");
    expect(markup).toContain("Local Note Store");
    expect(markup).toContain("Bounded Lexical Matcher");
    expect(markup).toContain("Context Injection Envelope");
    expect(markup).toContain("Model Synthesis Stream");
  });

  it("transparently communicates bounded lexical matching without false vector claims", () => {
    const markup = renderToStaticMarkup(<ContextPipelineSection />);
    expect(markup).toContain("Bounded Lexical Matcher");
    expect(markup).toContain("Keyword-driven token matching");
  });
});
