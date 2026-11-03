import { escapeHtml } from "./format";

export interface TokenRule {
  type: string;
  pattern: RegExp;
}

interface CompiledTokenRule {
  type: string;
  pattern: RegExp;
}

// ── TypeScript / JavaScript Rules ──
const JS_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /(["'`])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  {
    type: "keyword",
    pattern: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|default|class|extends|new|this|super|import|export|from|as|async|await|yield|try|catch|finally|throw|typeof|instanceof|in|of|void|delete|interface|type|enum|implements|declare|namespace)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:string|number|boolean|symbol|bigint|any|unknown|never|void|object|Array|Record|Promise|Map|Set|Partial|Required|Readonly|Pick|Omit)\b/,
  },
  { type: "boolean", pattern: /\b(?:true|false|null|undefined|NaN|Infinity)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/ },
  { type: "operator", pattern: /=>|===|!==|==|!=|<=|>=|\+\+|--|&&|\|\||[+\-*\/%&|^!~?:=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.]/ },
];

// ── Python Rules ──
const PY_RULES: TokenRule[] = [
  { type: "comment", pattern: /#[^\n]*/ },
  { type: "string", pattern: /(?:"""[\s\S]*?"""|'''[\s\S]*?'''|r?f?(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1)/ },
  {
    type: "keyword",
    pattern: /\b(?:def|class|return|if|elif|else|while|for|in|try|except|finally|with|as|import|from|lambda|yield|raise|pass|break|continue|global|nonlocal|assert|async|await)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:self|cls|int|str|float|list|dict|set|tuple|bool|type|bytes|Optional|Union|List|Dict|Tuple)\b/,
  },
  { type: "boolean", pattern: /\b(?:True|False|None)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: "operator", pattern: /==|!=|<=|>=|:=|\/\/|\*\*|[+\-*\/%&|^~=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.:]/ },
];

// ── SQL Rules ──
const SQL_RULES: TokenRule[] = [
  { type: "comment", pattern: /--[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /'(?:''|[^'])*'/ },
  {
    type: "keyword",
    pattern: /\b(?:SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DROP|ALTER|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|CROSS|ON|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|AND|OR|NOT|IN|IS|NULL|LIKE|ILIKE|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END|PRIMARY\s+KEY|FOREIGN\s+KEY|REFERENCES|INDEX|VIEW|WITH|DESC|ASC|BEGIN|COMMIT|ROLLBACK)\b/i,
  },
  {
    type: "function",
    pattern: /\b(?:COUNT|SUM|AVG|MIN|MAX|COALESCE|NOW|CONCAT|LOWER|UPPER|ROUND|CAST|DATE_TRUNC)\b/i,
  },
  { type: "boolean", pattern: /\b(?:TRUE|FALSE|NULL)\b/i },
  { type: "number", pattern: /\b\d+(?:\.\d+)?\b/ },
  { type: "operator", pattern: /!=|<>|<=|>=|[+\-*\/%=<>]/ },
  { type: "punctuation", pattern: /[();,.]/ },
];

// ── JSON Rules ──
const JSON_RULES: TokenRule[] = [
  { type: "property", pattern: /"(?:\\.|[^"\\])*"(?=\s*:)/ },
  { type: "string", pattern: /"(?:\\.|[^"\\])*"/ },
  { type: "number", pattern: /-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "boolean", pattern: /\b(?:true|false|null)\b/ },
  { type: "punctuation", pattern: /[{}[\]:,]/ },
];

// ── HTML Rules ──
const HTML_RULES: TokenRule[] = [
  { type: "comment", pattern: /<!--[\s\S]*?-->/ },
  { type: "tag", pattern: /<\/?(?:[a-zA-Z0-9-]+)(?=\s|>|\/|$)/ },
  { type: "attr-name", pattern: /[a-zA-Z0-9-]+(?=\s*=)/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  { type: "punctuation", pattern: /[<>\/=]/ },
];

// ── CSS Rules ──
const CSS_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\*[\s\S]*?\*\// },
  { type: "keyword", pattern: /@(?:media|keyframes|import|supports|layer|font-face)\b|\b(?:important|inherit|initial|unset)\b/ },
  { type: "property", pattern: /[a-zA-Z0-9-]+(?=\s*:)/ },
  { type: "function", pattern: /\b(?:var|calc|rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|clamp|min|max|url)\b/ },
  { type: "number", pattern: /-?\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg|fr)?\b/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  { type: "punctuation", pattern: /[{}[\]();:,]/ },
];

// ── Shell / Bash Rules ──
const BASH_RULES: TokenRule[] = [
  { type: "comment", pattern: /#[^\n]*/ },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  {
    type: "keyword",
    pattern: /\b(?:echo|export|cd|ls|cat|grep|mkdir|rm|cp|mv|chmod|chown|sudo|curl|wget|git|npm|pnpm|yarn|bun|node|python|docker|if|then|else|elif|fi|for|in|do|done|while|case|esac|return|exit)\b/,
  },
  { type: "property", pattern: /\$[a-zA-Z0-9_]+|\${[a-zA-Z0-9_]+}/ },
  { type: "operator", pattern: /&&|\|\||[|><=&]/ },
  { type: "punctuation", pattern: /[();]/ },
];

// ── Rust Rules ──
const RUST_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /(?:r#"[^"]*"#|b?"(?:\\[\s\S]|[^\\"])*"|b?'(?:\\[\s\S]|[^\\'])*')/ },
  {
    type: "keyword",
    pattern: /\b(?:fn|let|mut|struct|enum|impl|trait|pub|use|mod|match|if|else|while|for|in|loop|return|break|continue|as|const|static|unsafe|where|type|move|ref|self|Self|async|await)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result|Some|None|Ok|Err|Box|Rc|Arc)\b/,
  },
  { type: "boolean", pattern: /\b(?:true|false)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F_]+\b|\b\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: "operator", pattern: /->|=>|::|==|!=|<=|>=|[+\-*\/%&|^!~?:=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.]/ },
];

// ── Go Rules ──
const GO_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /(?:`[^`]*`|"(?:\\[\s\S]|[^\\"])*")/ },
  {
    type: "keyword",
    pattern: /\b(?:func|package|import|var|const|type|struct|interface|return|if|else|for|range|switch|case|default|select|go|chan|defer|break|continue|fallthrough)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|uintptr|float32|float64|complex64|complex128|string|bool|byte|rune|error|any)\b/,
  },
  { type: "boolean", pattern: /\b(?:true|false|nil|iota)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/ },
  { type: "function", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: "operator", pattern: /:=|<-|==|!=|<=|>=|\+\+|--|&&|\|\||[+\-*\/%&|^!~=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.]/ },
];

// ── C / C++ Rules ──
const CPP_RULES: TokenRule[] = [
  { type: "comment", pattern: /\/\/[^\n]*|\/\*[\s\S]*?\*\// },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  {
    type: "keyword",
    pattern: /\b(?:class|struct|namespace|template|typename|public|private|protected|virtual|override|constexpr|const|static|auto|return|if|else|for|while|do|switch|case|break|continue|new|delete|try|catch|throw|using|typedef|extern|inline|sizeof|include)\b/,
  },
  {
    type: "type",
    pattern: /\b(?:int|float|double|char|bool|void|size_t|uint32_t|int64_t|std|vector|string|map|shared_ptr|unique_ptr)\b/,
  },
  { type: "boolean", pattern: /\b(?:true|false|nullptr|NULL)\b/ },
  { type: "number", pattern: /\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(?:f|l|u)?\b/i },
  { type: "function", pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/ },
  { type: "operator", pattern: /::|->|==|!=|<=|>=|[+\-*\/%&|^!~?:=<>]/ },
  { type: "punctuation", pattern: /[{}[\]();,.]/ },
];

// ── YAML Rules ──
const YAML_RULES: TokenRule[] = [
  { type: "comment", pattern: /#[^\n]*/ },
  { type: "property", pattern: /^[ \t]*[a-zA-Z0-9_-]+(?=\s*:)/m },
  { type: "string", pattern: /(["'])(?:\\[\s\S]|(?!\1)[^\\])*\1/ },
  { type: "boolean", pattern: /\b(?:true|false|yes|no|null|on|off)\b/i },
  { type: "number", pattern: /\b\d+(?:\.\d+)?\b/ },
  { type: "punctuation", pattern: /[:\-[\]{}]/ },
];

const RAW_LANGUAGE_RULES: Record<string, TokenRule[]> = {
  ts: JS_RULES,
  typescript: JS_RULES,
  tsx: JS_RULES,
  js: JS_RULES,
  javascript: JS_RULES,
  jsx: JS_RULES,
  py: PY_RULES,
  python: PY_RULES,
  sql: SQL_RULES,
  json: JSON_RULES,
  html: HTML_RULES,
  xml: HTML_RULES,
  svg: HTML_RULES,
  css: CSS_RULES,
  scss: CSS_RULES,
  sh: BASH_RULES,
  bash: BASH_RULES,
  shell: BASH_RULES,
  zsh: BASH_RULES,
  rust: RUST_RULES,
  rs: RUST_RULES,
  go: GO_RULES,
  golang: GO_RULES,
  c: CPP_RULES,
  cpp: CPP_RULES,
  "c++": CPP_RULES,
  java: CPP_RULES,
  yaml: YAML_RULES,
  yml: YAML_RULES,
};

// Pre-compile anchored regex patterns once to maximize tokenization performance
const COMPILED_LANGUAGE_RULES: Record<string, CompiledTokenRule[]> = {};
for (const [lang, rules] of Object.entries(RAW_LANGUAGE_RULES)) {
  COMPILED_LANGUAGE_RULES[lang] = rules.map((r) => ({
    type: r.type,
    pattern: new RegExp(`^(?:${r.pattern.source})`, r.pattern.flags.replace("g", "")),
  }));
}

export const LANGUAGE_DISPLAY_NAMES: Record<string, string> = {
  ts: "TYPESCRIPT",
  typescript: "TYPESCRIPT",
  tsx: "TSX",
  js: "JAVASCRIPT",
  javascript: "JAVASCRIPT",
  jsx: "JSX",
  py: "PYTHON",
  python: "PYTHON",
  sql: "SQL",
  json: "JSON",
  html: "HTML",
  htm: "HTML",
  css: "CSS",
  scss: "SCSS",
  sass: "SASS",
  sh: "BASH",
  bash: "BASH",
  shell: "SHELL",
  zsh: "ZSH",
  rust: "RUST",
  rs: "RUST",
  go: "GO",
  golang: "GO",
  c: "C",
  cpp: "C++",
  "c++": "C++",
  cs: "C#",
  csharp: "C#",
  java: "JAVA",
  yaml: "YAML",
  yml: "YAML",
  md: "MARKDOWN",
  markdown: "MARKDOWN",
  dockerfile: "DOCKERFILE",
  docker: "DOCKERFILE",
  xml: "XML",
  graphql: "GRAPHQL",
  gql: "GRAPHQL",
};

export function normalizeLanguageBadge(lang?: string): string {
  if (!lang) return "CODE";
  const clean = lang.toLowerCase().trim();
  return LANGUAGE_DISPLAY_NAMES[clean] || clean.toUpperCase();
}

/**
 * Highlights a block of code using regex tokenization rules.
 * Emits HTML-escaped tokens wrapped in <span class="token <type>">.
 */
export function highlightCode(code: string, lang?: string): string {
  if (!code) return "";
  const normalizedLang = (lang || "").toLowerCase().trim();
  const rules = COMPILED_LANGUAGE_RULES[normalizedLang];

  if (!rules) {
    // Unsupported language: return safely escaped text with preserved whitespace
    return escapeHtml(code);
  }

  let html = "";
  let remaining = code;

  while (remaining.length > 0) {
    let matched = false;

    for (const rule of rules) {
      const match = remaining.match(rule.pattern);
      if (match && match[0].length > 0) {
        const text = match[0];
        html += `<span class="token ${rule.type}">${escapeHtml(text)}</span>`;
        remaining = remaining.slice(text.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Fast-forward runs of non-token word characters or whitespace
      const nonTokenMatch = remaining.match(/^[^\s\w]+|^\w+|^\s+/);
      const chunk = nonTokenMatch ? nonTokenMatch[0] : remaining[0];
      html += escapeHtml(chunk);
      remaining = remaining.slice(chunk.length);
    }
  }

  return html;
}
