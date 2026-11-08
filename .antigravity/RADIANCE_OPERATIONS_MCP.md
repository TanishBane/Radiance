# RADIANCE PLATFORM — MCP TOOL DISCOVERY & UTILIZATION RECORD
**Document ID:** RADIANCE-MCP-001  
**Execution Timestamp:** 2026-11-08T16:10:45+05:30  
**Context:** DevSecOps, Observability, and Operational Tooling

---

## 1. ACTIVE RUNTIME MCP SERVERS

The following Model Context Protocol (MCP) servers are registered in this environment:

| Server Name | Loading Mode | Primary Purpose & Tool Scope | Status in DevSecOps Mission |
| :--- | :--- | :--- | :--- |
| `StitchMCP` | Lazy | UI design system, screen generation, layout variants | Available; reserved for design-to-code tasks. |
| `rea` | Lazy | Reverse-engineering, binary inspection, web runtime analysis | Available; inspected for runtime analysis capabilities. |
| `xerj` | Lazy | Local-first semantic search, memory recall, codebase symbol mapping | Available; utilized for local AST symbol correlation. |

---

## 2. REPOSITORY & VENDOR MCP EVALUATION

### 2.1 GitHub MCP
- **Environment Status:** Not registered as an active native tool in current session.
- **Alternative Verification:** Local Git CLI (`git status`, `git diff`, `git remote`, `git log`) and GitHub Actions YAML linting/validation executed directly via shell commands.
- **Manual Checklist:** Detailed instructions provided for GitHub repository settings (Dependabot security updates, CodeQL SARIF alerts, Secret scanning push protection).

### 2.2 Vercel MCP
- **Environment Status:** Evaluated via Agent Marketplace (`antigravity-plugins-partners/plugin/vercel-plugin`).
- **Alternative Verification:** Direct Next.js SDK integration (`@vercel/analytics`, `@vercel/speed-insights`), build validation (`next build`), and documented setup instructions for Vercel project dashboard activation.

### 2.3 Supabase MCP
- **Environment Status:** Evaluated via Agent Marketplace (`antigravity-plugins-partners/plugin/supabase`).
- **Alternative Verification:** Direct inspection of database migration files (`supabase/migrations/20261101_001_initial_schema.sql`), server client (`src/lib/db/server.ts`), and client-side conversation service (`src/lib/db/conversations.ts`).

### 2.4 Sentry MCP
- **Environment Status:** Evaluated via Agent Marketplace (`antigravity-plugins-partners/plugin/sentry`).
- **Alternative Verification:** Direct integration of `@sentry/nextjs`, strict `beforeSend` privacy filtering, client/server configuration files, and validation error simulation.

---

## 3. MARKETPLACE SUGGESTIONS (FOR POST-COMPLETION USER ACTIVATION)

The user can optionally connect the following partner plugins for real-time dashboard sync:
- **Vercel Plugin:** `antigravity-plugins-partners/plugin/vercel-plugin`
- **Supabase Plugin:** `antigravity-plugins-partners/plugin/supabase`
- **Sentry Plugin:** `antigravity-plugins-partners/plugin/sentry`
