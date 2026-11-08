# RADIANCE PLATFORM — DEPENDABOT AUTOMATION MANUAL
**Document ID:** RADIANCE-DOC-OPS-002  
**Target Manifest:** `.github/dependabot.yml`  
**Reference:** [GitHub Dependabot Documentation](https://docs.github.com/code-security/dependabot)

---

## 1. IMPLEMENTED ARCHITECTURE

Radiance uses `pnpm` (lockfile version 9/pnpm v10/v12) and GitHub Actions. Dependabot is configured in `.github/dependabot.yml` with two independent update streams:

1. **`npm` Ecosystem (Root `/`):**
   - **Schedule:** Weekly on Mondays at 04:00 UTC.
   - **PR Limit:** 10 open pull requests.
   - **Labels:** `dependencies`, `devsecops`, `automated`.
   - **Commit Prefix:** `chore(deps):`.
   - **Grouping Strategy:**
     - `production-minor-patch`: Bundles minor and patch updates for runtime packages (`ai`, `clsx`, `lucide-react`, etc.) into single PRs to prevent noise.
     - `development-minor-patch`: Bundles test and tooling updates (`vitest`, `eslint`, `@types/*`).
   - **Major Protection:** Major upgrades for foundational frameworks (`next`, `react`, `react-dom`) are ignored from automatic batching and must be evaluated manually.

2. **`github-actions` Ecosystem:**
   - **Schedule:** Weekly on Mondays at 04:30 UTC.
   - **PR Limit:** 5 open pull requests.
   - **Labels:** `github-actions`, `devsecops`, `automated`.
   - **Commit Prefix:** `ci(actions):`.
   - **Grouping Strategy:** Grouped minor/patch updates for checkout, setup-node, cache, and codeql actions.

---

## 2. ACTIVATION & VERIFICATION IN REPOSITORY SETTINGS

To ensure automated security updates execute in GitHub:

1. Navigate to **Repository Settings** > **Code security and analysis**.
2. Verify that **Dependency graph** is marked **Enabled**.
3. Verify that **Dependabot alerts** is marked **Enabled**.
4. Verify that **Dependabot security updates** is marked **Enabled**.
5. When Dependabot opens a pull request, the CI quality gate (`.github/workflows/ci.yml`) executes:
   - TypeScript strict check.
   - ESLint inspection.
   - Vitest test suite (439 tests).
   - Production build.

> [!IMPORTANT]
> Never configure automatic merging for major version updates. Always verify that test suites pass and verify backwards compatibility prior to merging dependency updates.
