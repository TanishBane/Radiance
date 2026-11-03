import katex from "katex";
import { escapeHtml } from "./format";

// Greek symbols and standard math operators
const SYMBOL_MAP: Record<string, string> = {
  "\\alpha": "α",
  "\\beta": "β",
  "\\gamma": "γ",
  "\\delta": "δ",
  "\\epsilon": "ε",
  "\\zeta": "ζ",
  "\\eta": "η",
  "\\theta": "θ",
  "\\iota": "ι",
  "\\kappa": "κ",
  "\\lambda": "λ",
  "\\mu": "μ",
  "\\nu": "ν",
  "\\xi": "ξ",
  "\\pi": "π",
  "\\rho": "ρ",
  "\\sigma": "σ",
  "\\tau": "τ",
  "\\upsilon": "υ",
  "\\phi": "φ",
  "\\chi": "χ",
  "\\psi": "ψ",
  "\\omega": "ω",
  "\\Gamma": "Γ",
  "\\Delta": "Δ",
  "\\Theta": "Θ",
  "\\Lambda": "Λ",
  "\\Xi": "Ξ",
  "\\Pi": "Π",
  "\\Sigma": "Σ",
  "\\Phi": "Φ",
  "\\Psi": "Ψ",
  "\\Omega": "Ω",
  "\\sum": "∑",
  "\\prod": "∏",
  "\\int": "∫",
  "\\oint": "∮",
  "\\infty": "∞",
  "\\approx": "≈",
  "\\neq": "≠",
  "\\ne": "≠",
  "\\le": "≤",
  "\\leq": "≤",
  "\\ge": "≥",
  "\\geq": "≥",
  "\\pm": "±",
  "\\mp": "∓",
  "\\times": "×",
  "\\div": "÷",
  "\\cdot": "·",
  "\\circ": "∘",
  "\\bullet": "•",
  "\\in": "∈",
  "\\notin": "∉",
  "\\subset": "⊂",
  "\\subseteq": "⊆",
  "\\forall": "∀",
  "\\exists": "∃",
  "\\partial": "∂",
  "\\nabla": "∇",
  "\\to": "→",
  "\\rightarrow": "→",
  "\\leftarrow": "←",
  "\\Rightarrow": "⇒",
  "\\Leftarrow": "⇐",
  "\\iff": "⟺",
  "\\cdots": "…",
  "\\ldots": "…",
  "\\dots": "…",
  "\\quad": "&emsp;",
  "\\qquad": "&emsp;&emsp;",
};

/**
 * Lightweight semantic fallback renderer for LaTeX math notation.
 * Pre-escapes user input to guarantee immunity against script injection.
 */
export function renderFallbackMath(latex: string, displayMode: boolean): string {
  let formatted = escapeHtml(latex);

  // 1. Substitute Greek letters & math symbols
  for (const [cmd, symbol] of Object.entries(SYMBOL_MAP)) {
    const escapedCmd = escapeHtml(cmd);
    formatted = formatted.replaceAll(escapedCmd, symbol);
  }

  // 2. Clear LaTeX sizing wrappers \left and \right
  formatted = formatted
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\left\\\{/g, "{")
    .replace(/\\right\\\}/g, "}")
    .replace(/\\left\./g, "")
    .replace(/\\right\./g, "");

  // 3. Fractions: \frac{a}{b}
  formatted = formatted.replace(
    /\\frac\{([^{}]+)\}\{([^{}]+)\}/g,
    '<span class="math-frac"><span class="math-num">$1</span><span class="math-denom">$2</span></span>'
  );

  // 4. Exponents & Subscripts: x^{2} -> x<sup>2</sup>, x_{i} -> x<sub>i</sub>
  formatted = formatted.replace(/\^\{([^{}]+)\}/g, "<sup>$1</sup>");
  formatted = formatted.replace(/\^([0-9a-zA-Z])/g, "<sup>$1</sup>");
  formatted = formatted.replace(/_\{([^{}]+)\}/g, "<sub>$1</sub>");
  formatted = formatted.replace(/_([0-9a-zA-Z])/g, "<sub>$1</sub>");

  // 5. Square roots: \sqrt{x}
  formatted = formatted.replace(
    /\\sqrt\{([^{}]+)\}/g,
    '<span class="math-sqrt-wrap">√<span class="math-sqrt">$1</span></span>'
  );

  // 6. Text blocks: \text{text}, \operatorname{name}, \mathrm{text}
  formatted = formatted.replace(
    /\\(?:text|operatorname|mathrm)\{([^{}]+)\}/g,
    '<span class="math-text">$1</span>'
  );
  formatted = formatted.replace(
    /\\mathbf\{([^{}]+)\}/g,
    '<strong class="math-bold">$1</strong>'
  );

  if (displayMode) {
    return `<div class="math-block" data-math="${escapeHtml(latex)}"><span class="math-display">${formatted}</span></div>`;
  }
  return `<span class="math-inline" data-math="${escapeHtml(latex)}">${formatted}</span>`;
}

/**
 * Renders LaTeX math expressions with KaTeX (if available) or semantic fallback.
 * Strictly wrapped in try/catch to guarantee zero runtime crashes.
 */
export function renderMath(expression: string, displayMode: boolean): string {
  const trimmed = expression.trim();
  if (!trimmed) return "";

  try {
    if (typeof katex !== "undefined" && typeof katex.renderToString === "function") {
      const rendered = katex.renderToString(trimmed, {
        displayMode,
        throwOnError: false,
        output: "htmlAndMathml",
        trust: false,
      });

      if (displayMode) {
        return `<div class="math-block" data-math="${escapeHtml(trimmed)}"><span class="math-display">${rendered}</span></div>`;
      }
      return `<span class="math-inline" data-math="${escapeHtml(trimmed)}">${rendered}</span>`;
    }
  } catch (err) {
    console.warn("KaTeX renderToString error, falling back:", err);
  }

  return renderFallbackMath(trimmed, displayMode);
}
