# RADIANCE PLATFORM — GITHUB SECURITY & CODEQL AUDIT
**Document ID:** RADIANCE-DOC-OPS-003  
**Workflows:** `codeql.yml`, `dependency-review.yml`, `gitleaks.yml`  

---

## 1. CODEQL STATIC CODE ANALYSIS (`codeql.yml`)

- **Languages:** `javascript-typescript`.
- **Triggers:**
  - Pull requests to `main`.
  - Pushes to `main`.
  - Scheduled weekly scan (Mondays at 06:00 UTC).
- **Queries:** `security-extended` (includes OWASP Top 10 vulnerabilities, CWE injection queries, Prototype Pollution detection, and sensitive data leakage analysis).
- **Permissions:** Minimal explicit block:
  ```yaml
  permissions:
    actions: read
    contents: read
    security-events: write
  ```
- **SARIF Results:** Uploaded to GitHub Security tab under **Security** > **Code scanning alerts**.

---

## 2. DEPENDENCY REVIEW GATE (`dependency-review.yml`)

- **Trigger:** Pull requests targeting `main`.
- **Action:** `actions/dependency-review-action@v4`.
- **Policy Enforcement:**
  - `fail-on-severity: high` (blocks any PR introducing newly known high or critical severity CVEs).
  - License scanning flag: Warns if copyleft GPL/AGPL licenses are introduced into permissive Apache/MIT projects.

---

## 3. SECRET HYGIENE & LEAK PREVENTION (`gitleaks.yml`)

- **Trigger:** Pushes to `main` and `feature/*`, pull requests.
- **Action:** `gitleaks/gitleaks-action@v2`.
- **Scan Scope:** Full commit tree and historical commits (`fetch-depth: 0`).
- **Policy:** Scans for patterns of API keys (`gsk_*`, `AIzaSy*`, `sk-or-v1*`, Supabase keys, JWT tokens) before code is merged.

---

## 4. INCIDENT REMEDIATION PROTOCOL FOR CREDENTIAL LEAKS

If an API key or secret token is ever detected in a commit:
1. **Immediate Revocation:** Revoke the exposed credential immediately in the upstream provider console (Groq, Google AI Studio, OpenRouter, Supabase, Upstash).
2. **Issue Replacement:** Generate a new key and update `.env.local` and Vercel Project Environment Variables.
3. **Commit History Rewrite:** If committed to remote git history, rewrite history using `git-filter-repo` or BFG Repo-Cleaner. Removing the file in a new commit DOES NOT invalidate exposed credentials.
