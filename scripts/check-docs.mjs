#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

console.log("\n=======================================================");
console.log("  RADIANCE — Documentation & Link Integrity Verifier  ");
console.log("=======================================================\n");

let errorCount = 0;
let checkedFilesCount = 0;
let checkedLinksCount = 0;

// Scope: Only verify canonical public docs and root project markdown
function getDocumentationFiles() {
  const files = [];

  // 1. Root documentation files
  const rootEntries = fs.readdirSync(ROOT_DIR, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(path.join(ROOT_DIR, entry.name));
    }
  }

  // 2. docs/ directory recursively
  const docsDir = path.join(ROOT_DIR, "docs");
  if (fs.existsSync(docsDir)) {
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          files.push(fullPath);
        }
      }
    }
    walk(docsDir);
  }

  return files;
}

const mdFiles = getDocumentationFiles();
console.log(`[docs:check] Discovered ${mdFiles.length} canonical documentation files to audit.\n`);

// Regex for markdown links & images: [label](url) or ![alt](url)
const LINK_REGEX = /!?\[([^\]]*)\]\(([^)]+)\)/g;

for (const filePath of mdFiles) {
  checkedFilesCount++;
  const relativeFilePath = path.relative(ROOT_DIR, filePath);
  const content = fs.readFileSync(filePath, "utf-8");
  const fileDir = path.dirname(filePath);

  let match;
  while ((match = LINK_REGEX.exec(content)) !== null) {
    const rawTarget = match[2].trim();
    checkedLinksCount++;

    // Skip mailto:, tel:, external HTTP(S) links, or in-page anchors
    if (
      rawTarget.startsWith("http://") ||
      rawTarget.startsWith("https://") ||
      rawTarget.startsWith("mailto:") ||
      rawTarget.startsWith("tel:") ||
      rawTarget.startsWith("file://")
    ) {
      continue;
    }

    if (rawTarget.startsWith("#")) {
      // In-page anchor, valid
      continue;
    }

    // Split target into file path and hash
    const [targetPathWithoutHash] = rawTarget.split("#");
    if (!targetPathWithoutHash) continue;

    // Resolve target path relative to current markdown file
    const resolvedPath = path.resolve(fileDir, targetPathWithoutHash);

    if (!fs.existsSync(resolvedPath)) {
      console.error(
        `❌ [BROKEN LINK] in ${relativeFilePath}:\n   Target: "${rawTarget}"\n   Resolved: "${path.relative(ROOT_DIR, resolvedPath)}"`
      );
      errorCount++;
    }
  }
}

// Check .env.example coverage in docs/getting-started/environment.md
const envExamplePath = path.join(ROOT_DIR, ".env.example");
const envDocsPath = path.join(ROOT_DIR, "docs", "getting-started", "environment.md");

if (fs.existsSync(envExamplePath) && fs.existsSync(envDocsPath)) {
  const envExampleContent = fs.readFileSync(envExamplePath, "utf-8");
  const envDocsContent = fs.readFileSync(envDocsPath, "utf-8");

  const envVarNames = envExampleContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => line.split("=")[0].trim());

  console.log(`[docs:check] Verifying ${envVarNames.length} environment variables from .env.example...`);

  for (const envVar of envVarNames) {
    if (!envDocsContent.includes(envVar)) {
      console.warn(`⚠️ [UNDOCUMENTED ENV] "${envVar}" in .env.example is not documented in environment.md`);
    }
  }
}

console.log("\n-------------------------------------------------------");
console.log(`Files inspected: ${checkedFilesCount}`);
console.log(`Links inspected: ${checkedLinksCount}`);

if (errorCount > 0) {
  console.error(`\n❌ Documentation verification failed with ${errorCount} broken link(s).\n`);
  process.exit(1);
} else {
  console.log("\n✅ All documentation links, assets, and references verified successfully!\n");
  process.exit(0);
}
