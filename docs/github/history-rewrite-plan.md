# Radiance — Controlled Git Author History Correction Plan

**Prepared Date:** 2026-11-09  
**Execution Status:** **PREPARATION ONLY — STRICTLY UNAUTHORIZED TO EXECUTE**  
**Repository:** `https://github.com/TanishBane/Radiance`  
**Target Default Branch:** `main`  
**Current Remote / Local `main` HEAD:** `a370aa610da39ca6a15e5c9c28c03fbde3ea60aa`  
**Scope:** Exactly 60 historical commits on `main`  
**Target Old Identity:** `Radiance Engineering Team <engineering@radiance.ai>`  
**Target New Identity:** `TanishBane <tanishbane99@gmail.com>`  

---

## 1. Executive Summary & Authorization Guardrails

### 1.1 Objective
On November 1, 2026, during the initial platform transformation audit, an AI agent autonomously injected a synthetic author identity (`Radiance Engineering Team <engineering@radiance.ai>`) into `.git/config` after encountering an `Author identity unknown` error. Over the subsequent week, 60 commits on `main` were stamped with this fictional identity.

Because `engineering@radiance.ai` is unowned, inaccessible, and cannot be verified on GitHub, GitHub cannot award contribution credit for these 60 commits to `TanishBane`.

This document establishes the **exhaustive, non-destructive, strictly scoped recovery plan** to correct the author metadata of these exact 60 commits to `TanishBane <tanishbane99@gmail.com>`.

### 1.2 Strict Safety Constraints
> [!CAUTION]
> **PREPARATION AUTHORIZATION ONLY.**  
> Under no circumstances may any command in this plan be executed until the user conducts a thorough review and delivers explicit, written execution authorization.
> 
> Prohibited actions in this phase:
> - NO execution of `git-filter-repo` or any history rewriting tool.
> - NO rebasing, amending, or resetting existing commits.
> - NO force-pushing (`git push --force` or `git push --force-with-lease`).
> - NO modifying any remote branch or tag.
> - NO modifying any commit outside the explicit 60-commit allowlist.

---

## 2. Exact 60-Commit Allowlist Summary

Every single commit in the 60-commit allowlist has been verified against the following requirements:
1. `author_name` == `"Radiance Engineering Team"`
2. `author_email` == `"engineering@radiance.ai"`
3. Reachable from current `origin/main` (`a370aa6`)

The complete CSV manifest with all 60 commits, timestamps, parent SHAs, and subjects is saved at:  
👉 **[`docs/github/history-rewrite-manifest.csv`](file:///c:/Tanixai-main/docs/github/history-rewrite-manifest.csv)**

### Allowlist Overview (Chronological Order)

| Index | Abbreviated SHA | Full Original SHA | Date | Subject |
| :---: | :---: | :--- | :--- | :--- |
| 1 | `42c8c37` | `42c8c37c7fd7f270af5e54e37fc5d3df12da3f07` | 2026-11-01 01:05 | chore(baseline): initial legacy Tanix AI codebase with engineering audit |
| 2 | `e8adc7e` | `e8adc7e2f647653fafdf713f8ee79d3bfbe0684f` | 2026-11-01 01:21 | feat(radiance): complete platform transformation to Next.js 15, Vercel AI SDK... |
| 3 | `f43e2c7` | `f43e2c7b4fabad530d09f7d576f460264a8294e7` | 2026-11-01 01:28 | fix(vercel): configure framework as nextjs and provide public directory |
| 4 | `54315f6` | `54315f668d88efc87c7162a5d23f568cefdb6c7f` | 2026-11-01 01:48 | feat(remediation): complete corrective engineering, AI infrastructure upgrade... |
| 5 | `07f4514` | `07f451466cc8007b587ff6b4d84338cf556fbcdf` | 2026-11-01 02:07 | feat(ui): implement 21st.dev animated bloom & waves gradients across 12 themes... |
| 6 | `bc52d9a` | `bc52d9a952c4d8c32fb8b7a03a0b3ddd42d50323` | 2026-11-01 02:18 | feat(theme): implement signature 3-stop chromatic text gradient... |
| 7 | `e7bd50a` | `e7bd50aa9ec4516db77f36a50f7facab95630b4e` | 2026-11-01 02:27 | feat(ux): comprehensive UI/UX overhaul across design system, accessibility... |
| 8 | `be7af5b` | `be7af5b6b13ddf3143eb2e71ca9e065c903c0dc6` | 2026-11-01 02:39 | feat(theme): add 28 color palettes across 5 categories and 13 atmosphere... |
| 9 | `231d4de` | `231d4dee9be7dda4e2b94c8f76a2fe65acfb0d7f` | 2026-11-01 10:33 | feat(navigation): fix navigation bar overlap and remove persona modes |
| 10 | `dff482c` | `dff482c48257e76145fdde0d3a4381fc1314d00e` | 2026-11-01 10:42 | feat(navigation): completely remove legacy import feature and dialog |
| 11 | `e2ab120` | `e2ab1206574d2557e0e0d8d4b797e7d1366c8c96` | 2026-11-01 13:50 | Fix navigation overlap, remove persona UI, apply sticky header |
| 12 | `ce70713` | `ce707133244c233c4c2ee9074d249979f52f2e87` | 2026-11-04 00:24 | Restore Personalization in sidebar and refine drawer for themes and engines |
| 13 | `5491fe7` | `5491fe765128df764ede118dd5de6cdce4b1b48e` | 2026-11-04 01:23 | Refine background atmosphere, typography, and component restraint per design... |
| 14 | `1d26087` | `1d260879c1631f86d6256fcdac4ba3f798ad4a63` | 2026-11-04 02:02 | feat(composer-markdown): integrate rich prompt composer, KaTeX mathematics... |
| 15 | `3b71be5` | `3b71be5a1a6dbacc4dff1b391f42204c69f35834` | 2026-11-04 02:56 | feat(ui): add Radiance motion and responsive refinements |
| 16 | `169f47c` | `169f47cbcdc2d81c4f36ce733cf26755049eed14` | 2026-11-04 10:47 | fix(composer): completely remove Upgrade to Pro banner and modal |
| 17 | `0e67874` | `0e67874d2544b44fa7574694435aecb229d6bb71` | 2026-11-04 11:30 | feat(composer): replace demo models with real Radiance model selector... |
| 18 | `2ef42d7` | `2ef42d72aa370441a2a450e50dcd9e9c2394d0c4` | 2026-11-04 11:40 | refactor(topbar): remove model selector from topbar so it lives exclusively... |
| 19 | `5ae4954` | `5ae4954aee029f660b57c3df63f1e4a1e9eb187b` | 2026-11-04 11:56 | feat(theme): implement dynamic automatic color theme assignment on site visit |
| 20 | `1d5eea8` | `1d5eea81440e73e2c0d5cf1d8c634121b6cde261` | 2026-11-04 12:28 | feat(ui): redesign suggested prompts to 3-column Understand/Create/Explore... |
| 21 | `9a36e7a` | `9a36e7aba9358b5b43342bdf98d5f701faeecd6c` | 2026-11-04 12:37 | feat(ui): automatically harmonize suggestions interface with background theme... |
| 22 | `d8c4284` | `d8c4284cf72f19a51a50af51d7371a99a4ebf742` | 2026-11-04 13:22 | feat(brand): integrate official geometric striped speed symbol and brand asset... |
| 23 | `d1e4942` | `d1e4942d075f54f43d0645dc385d42de770a2d56` | 2026-11-05 15:06 | feat(security,quality): comprehensive security audit remediation and codebase... |
| 24 | `049c2ad` | `049c2ad9f73d2586ecbfaf5403eeaa3a21d377c6` | 2026-11-05 15:23 | refactor(compression): compress codebase with ponytail, remove redundant... |
| 25 | `0733e81` | `0733e810ac659dc864921d2f821beadcbce75144` | 2026-11-05 16:13 | refactor(compression): apply deep ponytail line-by-line compression... |
| 26 | `5acc39b` | `5acc39b654ca46a8520370b9452017ff99d6c560` | 2026-11-05 21:13 | fix(ci): eliminate invalid npmrc causing action-setup crash |
| 27 | `024aebd` | `024aebd641e15c69cb58c1176d0aea1329509833` | 2026-11-06 19:38 | feat(theme): upgrade atmosphere engines with 21st.dev anti-slop options |
| 28 | `5d634c1` | `5d634c1e7a2733d0b724dc65cc38218ee7a05152` | 2026-11-06 19:53 | feat(theme): elevate atmosphere engines to gallery-grade Retina 21st.dev models |
| 29 | `881c344` | `881c344f1cd5da145213f6f139c4e3f4918ab690` | 2026-11-06 20:08 | feat(atmosphere): replace deprecated background themes with 5 new 21st.dev... |
| 30 | `9045596` | `9045596d70d59366f65cd8e5c0e640e06cd55c1b` | 2026-11-06 20:31 | feat(responsive): 100% mobile ergonomics, touch events, safe-area insets... |
| 31 | `a4c74e4` | `a4c74e4474f2a60c5354a5b0a8d26d06fced415c` | 2026-11-06 20:39 | Merge origin/main into feature/radiance-platform-transformation |
| 32 | `d8b9288` | `d8b92880a854059f66c45f8920dd4b73600cd63a` | 2026-11-06 21:10 | feat(mobile): comprehensive mobile optimization, touch ergonomics, iOS zoom... |
| 33 | `b6cb2ed` | `b6cb2eddfbb62c224d54f81352c29cf4a58cb088` | 2026-11-07 01:07 | fix(audit): comprehensive remediation of ponytail-audit findings |
| 34 | `42372be` | `42372be251c88a30152d552d0dd9a39712c920c4` | 2026-11-07 01:27 | feat(theme): replace ambient sunlight with professional cinematic studio theme |
| 35 | `72533d6` | `72533d6d767ebe19dceb2d0c2f41edd970477715` | 2026-11-07 01:41 | fix(audit): comprehensive remediation of test gaps, bundle optimization... |
| 36 | `62f8907` | `62f890792778ff7e5e2e6e3e087281615c107cef` | 2026-11-07 01:49 | feat(design): complete new cinematic studio design system and welcome card... |
| 37 | `23d57ea` | `23d57eab5f9052cd3e4dbf372dd5809d6b8c8e10` | 2026-11-07 02:03 | feat(theme): replace cinematic theme with clean, anti-slop aurora nights... |
| 38 | `5b8119b` | `5b8119b22bb01d3b4f4b686bab197280a0864936` | 2026-11-07 02:21 | feat(theme): replace aurora nights with solid plain black background... |
| 39 | `3e16c81` | `3e16c8196f3fb7d2d5ee8dc9deb9530cdba3e9cf` | 2026-11-07 02:43 | feat(theme): complete black-and-white high-contrast theme, 100% element... |
| 40 | `19d7802` | `19d7802f3c59e42c80f933aa66e1b9588280391f` | 2026-11-07 12:29 | refactor(ui): unslop interface with quiet chrome, editorial typography... |
| 41 | `f77a888` | `f77a888fac98be7d7f417f93850c23179abfe475` | 2026-11-07 12:52 | refactor(ui): unslop micro-labels, audio active ring, and calm typography |
| 42 | `2ade78e` | `2ade78e704f284764f463cf2d93a78718f9a927d` | 2026-11-07 16:15 | revert: restore exact Radiance visual identity, welcome architecture... |
| 43 | `7817c2e` | `7817c2e5d38327b7cb34d7f3d24e20174afd0d6c` | 2026-11-07 20:21 | refactor(ui): unslop interface with quiet chrome, editorial typography... |
| 44 | `cadae57` | `cadae572acc9de03881f371cb0186c904c11f46a` | 2026-11-08 01:17 | Revert "refactor(ui): unslop interface with quiet chrome, editorial typography... |
| 45 | `3e9908d` | `3e9908d5bceb578b009d25e1bc2fc6be036e307e` | 2026-11-08 15:03 | feat(ui): redesign personalization drawer, typography system, and motion... |
| 46 | `1ab420b` | `1ab420b436e4cdcd8e35838fed3e9d84371c2a2e` | 2026-11-08 15:15 | feat(theme): remove cinematic atmosphere and replace fluid aurora with prismatic... |
| 47 | `c92555e` | `c92555ea33d45e65ef44fdb1e45115952884a1b2` | 2026-11-08 15:22 | feat(theme): replace prismatic caustics with silk ribbons atmosphere engine |
| 48 | `a16b072` | `a16b072289e17c46bd6fc82ee837d2744e344895` | 2026-11-08 15:36 | feat(chat): redesign composer dock with luminous glassmorphism, refined typography... |
| 49 | `ab3efd4` | `ab3efd4e436d9fa71a94bdffc390d0faeb3c1c22` | 2026-11-08 15:47 | feat(chat): complete theme glassmorphism, professional icons, and remove hint... |
| 50 | `1fc84d7` | `1fc84d701f1e522a80947451bf131612f96e3846` | 2026-11-08 15:58 | fix(composer): resolve popover clipping and overlapping by removing overflow... |
| 51 | `70ba19c` | `70ba19c12e4ab13a5d298724f0c475782bc87052` | 2026-11-08 16:07 | feat(security): comprehensive security audit remediation and defensive hardening |
| 52 | `e3351a0` | `e3351a0746487f2b330d64e01c6384241291edcd` | 2026-11-08 16:25 | feat(ui): redesign sidebar dock with luminous theme glassmorphism, spring physics... |
| 53 | `924aa2c` | `924aa2ccd2e9e3a631e3f2cfcabeff8a102da6f9` | 2026-11-08 16:34 | fix(sidebar): eliminate double-circle overlapping glitch and unify 40px... |
| 54 | `7f0256d` | `7f0256d412e5a589a2bbb2bddd565d573951fdd2` | 2026-11-08 17:16 | feat(mobile): implement mobile-first touch ergonomics, thumb-zone bottom... |
| 55 | `c546dfa` | `c546dfaa2614f049e5ca0c4ecaf9dc57d895cef6` | 2026-11-08 17:17 | feat(repo): dynamic GitHub README, technical documentation hub, SEO, and community... |
| 56 | `5696003` | `5696003f1580042c05eb1bb1c85e0599b46126e0` | 2026-11-08 18:16 | feat(settings): add Radiance Settings Center |
| 57 | `a84d650` | `a84d650ed66907ea5cf9ed1e0d1a1c08b8050f6d` | 2026-11-08 19:23 | feat: add local personal intelligence engine |
| 58 | `cd4bf09` | `cd4bf097f450a1e8c2e81eedf0190764c7d8180a` | 2026-11-08 20:31 | feat: add Radiance landing page |
| 59 | `18e6fbf` | `18e6fbf1e3da8dd48a203af4ad25f4d754e8e558` | 2026-11-09 00:45 | feat(home): redesign Radiance homepage |
| 60 | `fd0deef` | `fd0deef342a7743fd7f55bda8af20a492c24541e` | 2026-11-09 02:23 | feat(home): add premium Radiance landing experience |

---

## 3. Secondary DAG & Branch Impact Analysis

```
GIT COMMIT DAG STRUCTURE & SECONDARY IMPACTS:

[ 13 Ancestor Commits (Apr-Jul 2026) ] ───────────► 100% UNTOUCHED (Same SHAs, Same Authors)
                 │
                 ▼
[ 60 Target Commits (Nov 1-9 2026) ] ─────────────► AUTHOR UPDATED: engineering@radiance.ai -> tanishbane99@gmail.com
                 │                                  (New SHAs generated, Tree SHAs invariant)
                 ▼
[ 14 Descendant Commits on main ] ────────────────► AUTHOR PRESERVED (TanishBane / Jules)
  ├─ 10 PR Merge Commits (#1-#10)                   (SHAs updated purely due to parent DAG repointing)
  ├─ 3 Jules Commits (Co-authored)                  (Tree SHAs invariant)
  └─ 1 Latest Landing Redesign Commit (a370aa6)
```

### 3.1 Category B: Descendant Commits with Author Identity Preserved (14 Commits)
The following 14 commits are descendants of the rewritten history. Their commit SHAs will be updated to point to the new parent SHAs, but their **author names, author emails, commit messages, timestamps, and tree object IDs remain strictly unaltered**:

1. **Merge PR #1 (`a512528`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
2. **Jules Commit 1 (`5225589`):** `TanishBane <279507610+TanishBane@users.noreply.github.com>` (Co-author: Jules)
3. **Jules Commit 2 (`b983850`):** `TanishBane <279507610+TanishBane@users.noreply.github.com>` (Co-author: Jules)
4. **Jules Commit 3 (`538c4f8`):** `TanishBane <279507610+TanishBane@users.noreply.github.com>` (Co-author: Jules)
5. **Merge PR #2 (`4c39412`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
6. **Merge PR #3 (`9541656`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
7. **Merge PR #4 (`2f80a3d`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
8. **Merge PR #5 (`2fe1f0a`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
9. **Merge PR #6 (`e83143a`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
10. **Merge PR #7 (`394e614`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
11. **Merge PR #8 (`a3cac75`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
12. **Merge PR #9 (`3776f0a`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
13. **Merge PR #10 (`abadc92`):** `Tanish Ganesh Bane <tanishbane99@gmail.com>`
14. **Latest Landing Redesign (`a370aa6`):** `TanishBane <tanishbane99@gmail.com>`

---

## 4. Commit Signatures Audit (Requirement 3)

A complete cryptographic signature audit was conducted across all 87 commits on `main`:
```bash
git log main --format="%H|%h|%G?|%GS|%GK|%s"
```

### Signature Audit Findings
1. **The 60 Target Commits (`42c8c37` through `fd0deef`):**
   - Signature Status: **UNSIGNED (`%G? = N`)**.
   - Consequence: Rewriting their author metadata alters zero cryptographic signatures.
2. **The 13 Ancient Commits (`23fda75` through `7ef4be2`):**
   - Signature Status: **UNSIGNED (`%G? = N`)**.
   - Consequence: Unaffected ancestors.
3. **The 3 Jules Bot Commits (`5225589`, `b983850`, `538c4f8`):**
   - Signature Status: **UNSIGNED (`%G? = N`)**.
   - Consequence: Retain author, message, and `Co-authored-by: google-labs-jules[bot]` trailers.
4. **The Latest Landing Commit (`a370aa6`):**
   - Signature Status: **UNSIGNED (`%G? = N`)**.
5. **The 10 GitHub PR Merge Commits (`a512528`, `4c39412`, `9541656`, `2f80a3d`, `2fe1f0a`, `e83143a`, `394e614`, `a3cac75`, `3776f0a`, `abadc92`):**
   - Signature Status: **SIGNED by GitHub Web-Flow (`%G? = E`, Key ID: `B5690EEEBB952194`)**.
   - Origin: Automatically signed by GitHub when Tanish Bane merged PRs #1–#10 via the github.com web UI.
   - **Consequence of Rewriting:** In Git, cryptographic signatures cover the exact commit object header (which includes the parent commit SHAs). Because the 10 merge commits have their parent SHAs updated to point to the new rewritten parent commits, the original GitHub web-flow GPG signature cannot cryptographically validate over the new parent hashes.
   - Standard Git rewriting tools (`git-filter-repo`) strip mathematically invalid signatures to prevent corrupted commit objects.
   - **User Impact:** The 10 PR merge commits will lose their GitHub "Verified" green badge on the web UI, but will retain 100% of their author identity (`Tanish Ganesh Bane <tanishbane99@gmail.com>`), exact merge messages, timestamps, and tree contents.

---

## 5. Pull Request Impact: Open Dependabot PRs (Requirement 4)

There are currently **15 open Pull Requests** on GitHub. Every single one is an automated PR opened by Dependabot.

| PR # | Title | Head Ref | Head SHA | Current Base SHA |
| :---: | :--- | :--- | :--- | :--- |
| **#26** | bump development group (3 updates) | `dependabot/.../development-minor-patch-5b35242cb5` | `e32b4e4` | `fd0deef` (#60 in allowlist) |
| **#25** | bump eslint-config-next to 16.4.5 | `dependabot/.../eslint-config-next-16.4.5` | `1adf612` | `c546dfa` (#55 in allowlist) |
| **#24** | bump @types/node to 26.6.6 | `dependabot/.../types/node-26.6.6` | `0b8a347` | `c546dfa` (#55 in allowlist) |
| **#23** | bump jsdom to 30.1.3 | `dependabot/.../jsdom-30.1.3` | `6469be2` | `c546dfa` (#55 in allowlist) |
| **#22** | bump vitest to 5.1.0 | `dependabot/.../vitest-5.1.0` | `f4a51e0` | `c546dfa` (#55 in allowlist) |
| **#21** | bump ai to 7.0.163 | `dependabot/.../ai-7.0.163` | `f146141` | `c546dfa` (#55 in allowlist) |
| **#20** | bump lucide-react to 1.69.0 | `dependabot/.../lucide-react-1.69.0` | `94464bf` | `c546dfa` (#55 in allowlist) |
| **#19** | bump motion to 14.9.1 | `dependabot/.../motion-14.9.1` | `0ecd30c` | `c546dfa` (#55 in allowlist) |
| **#17** | bump production group (5 updates) | `dependabot/.../production-minor-patch-2169a5952e` | `5d9e7ed` | `fd0deef` (#60 in allowlist) |
| **#16** | bump pnpm/action-setup to 6 | `dependabot/.../pnpm/action-setup-6` | `f3310a0` | `c546dfa` (#55 in allowlist) |
| **#15** | bump actions/checkout to 7 | `dependabot/.../actions/checkout-7` | `f89a2bb` | `c546dfa` (#55 in allowlist) |
| **#14** | bump github/codeql-action to 4 | `dependabot/.../github/codeql-action-4` | `a26d1bc` | `c546dfa` (#55 in allowlist) |
| **#13** | bump actions/setup-node to 7 | `dependabot/.../actions/setup-node-7` | `e9d0c6c` | `c546dfa` (#55 in allowlist) |
| **#12** | bump gitleaks/gitleaks-action to 3 | `dependabot/.../gitleaks/gitleaks-action-3` | `c280a08` | `c546dfa` (#55 in allowlist) |
| **#11** | bump dependency-review-action to 5 | `dependabot/.../actions/dependency-review-action-5` | `209581f` | `c546dfa` (#55 in allowlist) |

### Impact & Post-Push Recovery Protocol
Because their base SHAs (`c546dfa` and `fd0deef`) will be rewritten on `main`, GitHub may flag these PRs as having base branch conflicts or stale merge-bases.

**Recovery Procedure (Post-Push):**
1. Issue a rebase trigger comment to Dependabot on all 15 PRs:
   ```powershell
   @(11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26) | ForEach-Object {
       gh pr comment $_ --body "@dependabot rebase"
   }
   ```
2. Dependabot will process each comment and automatically rebase the PR branches against the new `main` HEAD.
3. Any PR that encounters an irreconcilable rebase conflict can simply be closed with `gh pr close <number>`; Dependabot will automatically re-open a fresh PR against the new `main` HEAD on its next scheduled check.

---

## 6. Complete 8-Dimension Backup Architecture (Requirement 2)

The updated backup strategy protects against all 8 failure domains:

| Dimension | Target Backup Artifact | Implementation | Failure Domain Protected |
| :--- | :--- | :--- | :--- |
| **1. Untracked Files** | `working-tree-full-copy` | `robocopy /E /XD .git node_modules .next` | Preserves 100% of untracked files, audit docs, and local scripts (bypasses git diff limitation). |
| **2. Tracked Modifications** | `working-tree.patch` | `git diff HEAD` | Preserves unstaged tracked edits. |
| **3. Staged Edits** | `staged.patch` | `git diff --staged` | Preserves staged index changes. |
| **4. Local Branches** | `backup/pre-rewrite-main-*` | `git branch <name> main` | 1-second instant rollback. |
| **5. Remote Tracking Refs** | `Radiance-mirror.git` | `git clone --mirror` | Remote ref desync or GitHub API anomalies. |
| **6. Tags** | `refs-snapshot.txt` | `git show-ref` | Tag drift audit (0 tags currently present). |
| **7. Git Objects** | `radiance-full-repo.bundle` | `git bundle create --all` | Full repository corruption or object store damage. |
| **8. Audit & Rewrite Scripts** | Stored in repo + copied to backup | Physical directory copy | Prevents loss of audit trail or recovery tooling. |

---

## 7. Branch Protection & Push Scope Verification (Requirement 5)

### 7.1 Remote Branch Protection Status
- Inspected via `gh api repos/TanishBane/Radiance/branches/main/protection`: **HTTP 404 (Branch not protected)**.
- Inspected via `gh api repos/TanishBane/Radiance/rulesets`: **`[]` (No rulesets configured)**.
- **Finding:** No branch protection rules currently block a force-push with lease on `main`.

### 7.2 Administrative Action Protocol (If Rules Are Added in the Future)
If branch protection ("Block force pushes") is enabled in the future, the push will be rejected with:
`remote: error: GH006: Protected branch update failed for refs/heads/main. Cannot force-push to a protected branch.`
**Required Administrative Action (DO NOT change protection rules prematurely):**
1. Repository Admin navigates to **GitHub → Settings → Branches / Rulesets**.
2. Temporarily check **"Allow force pushes"** (or enable administrative bypass).
3. Execute the lease-protected push command.
4. Immediately uncheck **"Allow force pushes"** to restore protection.

### 7.3 Push Refspec Scope Confirmation
The push command targets strictly:
```bash
git push --force-with-lease=refs/heads/main:a370aa610da39ca6a15e5c9c28c03fbde3ea60aa origin main
```
- **Updates:** Strictly `refs/heads/main` on `origin`.
- **Leaves Untouched:** `origin/rehaul`, `origin/palette-add-aria-label-*`, `origin/feature/*`, and all 15 `origin/dependabot/*` branches.

### 7.4 Static Syntax Validation Commands
Execute without modifying any files or running the rewrite:
```powershell
# PowerShell AST syntax check (history-rewrite-commands.ps1):
$errors = $null
[System.Management.Automation.Language.Parser]::ParseFile("C:\Tanixai-main\docs\github\history-rewrite-commands.ps1", [ref]$null, [ref]$errors)
if ($errors.Count -eq 0) { "PowerShell Syntax: VALID (0 errors)" } else { $errors }

# Python syntax compilation check (filter-author-callback.py):
py -3 -m py_compile "C:\Tanixai-main\docs\github\filter-author-callback.py"
if ($LASTEXITCODE -eq 0) { "Python Syntax: VALID (0 errors)" }
```
*(Both commands were verified in pre-flight testing and returned 0 errors.)*

---

## 8. Rollback Procedures

### Instant Local Rollback
```powershell
git checkout main
git reset --hard backup/pre-rewrite-main-<timestamp>
```

### Remote Rollback (Restoring Remote `main`)
```powershell
git push --force-with-lease=refs/heads/main:<new-head-sha> origin backup/pre-rewrite-main-<timestamp>:refs/heads/main
```

### Full Disaster Recovery (From Bundle & Untracked Copy)
```powershell
git fetch C:\Tanixai-backups\radiance-backup-<timestamp>\radiance-full-repo.bundle refs/heads/*:refs/heads/*
robocopy "C:\Tanixai-backups\radiance-backup-<timestamp>\working-tree-full-copy" "C:\Tanixai-main" /E /XD .git
```
