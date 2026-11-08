# RADIANCE REPOSITORY ENGINEERING — MCP TOOLS & CAPABILITIES DIRECTORY

**Mission ID:** RADIANCE-REPOSITORY-001  
**Project:** RADIANCE — AI Productivity and Intelligence Platform  
**Target:** MCP Tool Discovery & Repository Management Integration  
**Date:** November 2026  
**Status:** ACTIVE & APPLIED  

---

## 1. Tool Discovery & Environmental Scope

In accordance with platform directives, tool discovery was performed across available MCP servers, native host CLIs, and local automation runners.

### Active Tool Registry

| Tool / Provider | Category | Purpose in Repository Mission |
|:---|:---|:---|
| `Git CLI` | Version Control | Inspects remote origin (`https://github.com/TanishBane/Tanixai.git`), commit history, current branches, local tags, and staging area. |
| `Filesystem Tools` | Native I/O | Deterministic reading, writing, and linting of Markdown documents, YAML workflows, Next.js metadata routes, and SVG branding assets. |
| `Node.js & pnpm` | Runtime & Tooling | Runs scripts (`measure-bundle.mjs`, `check-docs.mjs`), executes Vitest, triggers Next.js production builds, and runs linters. |
| `Playwright Headless Browser` | Browser Automation / Rendering | Automated capture of real application screenshots (Desktop & Mobile) from the running application for documentation assets. |
| `Canvas / Image Utilities` | Asset Processing | Creates and optimizes `docs/assets/radiance-social-preview.png` (1280x640) and screenshot assets. |

---

## 2. GitHub Metadata Scope & Constraints

- **Remote Target:** `https://github.com/TanishBane/Tanixai.git`
- **Owner / Repo:** `TanishBane/Tanixai`
- **Operational Boundaries:**
  - Local repository artifacts (README, docs, community health files, workflows, metadata routes, scripts) are implemented directly in the codebase.
  - Remote GitHub API actions that require administrative token scopes (e.g., updating repository description, setting topics on GitHub.com, changing repository settings) are provided as exact, verifiable setup instructions and commands in `RADIANCE_REPOSITORY_AUDIT.md` and `RADIANCE_DOCUMENTATION_IMPLEMENTATION.md` to avoid unauthorized mutation or credential leakage.
  - No commits, tags, pushes, merges, or releases are executed without explicit user instruction.
