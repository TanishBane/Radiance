import { formatMarkdown, sanitizeHtml, isSafeUrl, TokenManager } from "../../../src/lib/utils/format";

console.log("Result 1:", formatMarkdown("[test](javascript:alert(1))"));
console.log("Result 2:", formatMarkdown("[test](https://example.com/path(1))"));
console.log("Result 3:", formatMarkdown("[test](https://example.com)"));
console.log("Result 4:", formatMarkdown("[test](https://en.wikipedia.org/wiki/Algorithm_(disambiguation))"));
