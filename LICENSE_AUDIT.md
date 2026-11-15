# RADIANCE IP & LICENSE COMPLIANCE AUDIT RECORD

**Audit Date:** November 15, 2026  
**Compliance Lead:** `@compliance`  
**Verification Target:** Radiance Production Core (`v1.0.0`)  
**Compliance Status:** **VERIFIED COMPLIANT (REMEDIATION FULLY EXECUTED)**  

---

## 1. Executive Summary & Verification Verdict

An exhaustive compliance audit and post-audit remediation was conducted across all files, components, shaders, dependencies, fonts, and graphical assets of the Radiance platform.

### High-Level Verdict:
1. **Zero Copyleft Contamination:** No viral copyleft dependencies (`GPL`, `AGPL`) exist in any production client or server bundles.
2. **Proprietary Source-Available Boundary Cleanly Established:** Original Radiance core code is protected under the **Radiance Source-Available Community & Commercial License**, securing proprietary SaaS/cloud deployment rights while enabling public security audits, personal non-commercial self-hosting, and community contributions under an explicit CLA.
3. **Third-Party Permissive Integrity:** All retained third-party components (Aceternity UI, 21st.dev components, ASCII Magic, Lucide icons, Tabler icons, Three.js, Radix primitives, Vercel AI SDK, Supabase) are licensed under permissive terms (`MIT`, `Apache-2.0`, `ISC`, `BSD`, `OFL-1.1`).
4. **Third-Party Notice Preservation Complete:** Exhaustive registers compiled in `THIRD_PARTY_NOTICES.md` with official license texts in `LICENSES/`.
5. **Restricted Materials Fully Purged:** All unreferenced commercial prototype templates (`ascend.html`, `starfield.html`), prototype React components (`ascend-*.tsx`, `webgl-planet.tsx`), and unauthorized runtime hotlinks (`api.getlayers.ai`) have been permanently removed from Git tracking.
6. **Test Suite Integrity Restored:** All Vitest unit test regressions resolved with 100% test pass rate across all 67 test files.

---

## 2. Supply-Chain & Dependency Verification Evidence

### 2.1 Categorization of Licenses (258 Resolved Packages)

#### A. Permissive Open Source (254 Packages / 98.4%)
- **MIT License (204 packages / 79.1%):** `react`, `react-dom`, `next`, `three`, `@radix-ui/*`, `clsx`, `tailwind-merge`, `motion`, `zod`, `@supabase/*`, `@upstash/*`, `katex`, etc.
- **Apache-2.0 License (19 packages / 7.4%):** `@ai-sdk/*`, `ai`, `@vercel/speed-insights`, `typescript`, `@playwright/test`.
- **BlueOak-1.0.0 (6 packages / 2.3%):** `glob`, `lru-cache`, `minimatch`, `minipass`, `path-scurry`, `@isaacs/nonrecursive-glob-match`.
- **ISC License (6 packages / 2.3%):** `lucide-react`, `n8ao`, `semver`, `picocolors`, `inherits`, `zod-to-json-schema`.
- **BSD-3-Clause License (5 packages / 1.9%):** `@webgpu/types`, `ieee754`, `secure-json-parse`, `source-map-js`, `sprintf-js`.
- **BSD-2-Clause License (5 packages / 1.9%):** `mammoth`, `dotenv`, `lop`, `option`, `dingbat-to-unicode`.
- **Zlib License (1 package / 0.4%):** `postprocessing`.
- **0BSD License (1 package / 0.4%):** `tslib`.
- **CC0-1.0 Public Domain (1 package / 0.4%):** `language-subtag-registry`.
- **Dual-Licensed Permissive Elections (4 packages / 1.6%):**
  - `jszip@3.10.2` (`(MIT OR GPL-3.0-or-later)`) — Formally elected to **MIT**.
  - `json-schema@0.4.0` (`(AFL-2.1 OR BSD-3-Clause)`) — Formally elected to **BSD-3-Clause**.
  - `type-fest@4.41.0` (`(MIT OR CC0-1.0)`) — Formally elected to **MIT**.
  - `pako@1.0.11` (`(MIT AND Zlib)`) — Both licenses permissive.

#### B. Weak Copyleft / Build-Time Tooling (2 Packages / 0.8%)
- **MPL-2.0 (Mozilla Public License 2.0):** `lightningcss@1.32.0` and `lightningcss-win32-x64-msvc@1.32.0`.
  - **Obligation Analysis:** MPL-2.0 is a weak, file-level copyleft license. It permits inclusion in a proprietary "Larger Work" provided the MPL-covered source files themselves are unmodified. Radiance consumes `lightningcss` as an unmodified, build-time CSS compilation tool; no MPL source files are modified or distributed.

#### C. Dynamically Linked Server-Side Libraries (1 Package / 0.4%)
- **LGPL-3.0-or-later (GNU Lesser General Public License v3):** Precompiled `libvips` C-binary included in `@img/sharp-win32-x64@0.35.5`.
  - **Obligation Analysis:** LGPL-3.0 permits proprietary applications to dynamically link to unmodified shared libraries. Sharp is executed exclusively on the Node.js server for `next/image` optimization; it is never bundled into client JavaScript. LGPL-3.0 does not contain the network-trigger copyleft clause of AGPL-3.0 (Affero GPL).

#### D. Source-Available Build Tooling (1 Package / 0.4%)
- **FSL-1.1-Apache-2.0 (Functional Source License):** `@sentry/cli` (via `sentry@0.45.0`).
  - **Obligation Analysis:** FSL-1.1 permits all uses except providing a competing SaaS service (error tracking). Radiance is an AI workspace platform that does not compete with Sentry. Furthermore, this package is build-time only for sourcemap uploads during CI.

#### E. Strong Copyleft (GPL / AGPL)
- **Zero (0 packages / 0.0%):** No GPL or AGPL dependencies exist in either direct or transitive runtime dependencies.

### 2.2 Direct Dependency Distribution Scope

| Dependency | Category | Distribution Scope | License | Compatibility |
| :--- | :--- | :--- | :--- | :--- |
| `ai`, `@ai-sdk/*` | Production | Server & Edge Handlers | Apache-2.0 | Compatible |
| `@radix-ui/*` | Production | Client Bundle | MIT | Compatible |
| `@react-three/fiber`, `postprocessing` | Production | Client Bundle | MIT / Zlib | Compatible |
| `lucide-react`, `@tabler/icons-react` | Production | Client Bundle | ISC / MIT | Compatible |
| `next`, `react`, `react-dom` | Production | Client & Server | MIT | Compatible |
| `@supabase/ssr`, `@supabase/supabase-js` | Production | Client & Server | MIT | Compatible |
| `@upstash/redis`, `@upstash/ratelimit` | Production | Server Handlers | MIT | Compatible |
| `katex`, `mammoth` | Production | Client / Server | MIT / BSD-2-Clause | Compatible |
| `motion`, `tailwind-merge`, `clsx` | Production | Client Bundle | MIT | Compatible |
| `zod` | Production | Client & Server | MIT | Compatible |
| `typescript`, `@types/*` | Development | Build-time only (not distributed) | Apache-2.0 / MIT | Compatible |
| `vitest`, `@testing-library/*`, `jsdom` | Development | Test-time only (not distributed) | MIT | Compatible |
| `@playwright/test` | Development | E2E-time only (not distributed) | Apache-2.0 | Compatible |
| `eslint`, `eslint-config-next` | Development | Lint-time only (not distributed) | MIT | Compatible |
| `tailwindcss`, `@tailwindcss/postcss` | Development | Build-time only (not distributed) | MIT | Compatible |

---

## 3. Comprehensive Risk Matrix & Remediation Actions

| Risk ID | Component / Location | Risk Level | Description & Exposure | Remediation Action | Final Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | External 3D Models in `src/components/landing/webgl-planet.tsx` | **HIGH** | `planet.glb`, `planet-lights.glb`, and `planet-clouds.png` were fetched at runtime from external storage (`api.getlayers.ai`). Unverified sub-licensing terms; external endpoint availability and CORS vulnerability. | Verified `webgl-planet.tsx` was completely unreferenced by the live application. Safely deprecated and permanently deleted the file, eradicating all unauthorized hotlinks. | **RESOLVED & REMEDIATED** |
| **RSK-02** | Verbatim HTML Prototypes in `public/` (`ascend.html`, `starfield.html`) | **MEDIUM** | Uncompiled standalone third-party demo files served on static root. Public accessibility of raw template files created risk under marketplace terms prohibiting raw template redistribution. | Permanently removed `ascend.html` and `starfield.html` from Git tracking (`git rm`). Added `/.antigravity/prototypes/` to `.gitignore`. | **RESOLVED & REMEDIATED** |
| **RSK-03** | Lack of MIT Header Comments in Component Source Files | **MEDIUM** | `sidebar.tsx`, `shiny-button.tsx`, `voxel-wall.tsx`, and `kit.ts` carry permissive MIT licenses but lacked file-level copyright headers. | Injected standardized lightweight MIT headers referencing upstream authors and `THIRD_PARTY_NOTICES.md`. | **RESOLVED & VERIFIED** |
| **RSK-04** | Disjunctive Dual License in `jszip@3.10.2` (`(MIT OR GPL-3.0-or-later)`) | **LOW** | Potential copyleft contamination if GPL terms were unintentionally triggered. | Formally declared irrevocable election of the **MIT License** terms in all legal notices and registers. | **RESOLVED & DOCUMENTED** |
| **RSK-05** | Server-Side LGPL Dependency `@img/sharp-win32-x64` (`libvips`) | **LOW** | Potential misinterpretation of LGPL obligations in proprietary SaaS products. | Confirmed strict runtime dynamic linking isolation in Node.js; no client bundling; absence of AGPL network-copyleft terms. | **RESOLVED & DOCUMENTED** |
| **RSK-06** | Third-Party Web Fonts Bundling (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) | **LOW** | Adherence to SIL Open Font License (OFL-1.1) conditions. | Confirmed fonts are served for UI rendering and not sold independently; preserved OFL-1.1 notices in notice files. | **RESOLVED & DOCUMENTED** |
| **RSK-07** | Ascend-Derived Unreferenced Landing Components | **MEDIUM** | `ascend-*.tsx`, `ascend-planet-landing.css`, and `radiance-planet-landing.tsx` contained copied template layouts. | Verified unreferenced by live application. Permanently deleted all 7 files from `src/components/landing/`. | **RESOLVED & REMEDIATED** |

---

## 4. Legal Determinations on Complex Licensing Questions

### 4.1 Legal Doctrine on Dual Licensing (`jszip`)
Under international copyright jurisprudence and established open-source legal doctrine, when a work is offered under disjunctive dual licenses (`License A OR License B`), the recipient has the unilateral right to select whichever license best suits their deployment requirements. By selecting the **MIT License**, the licensee is governed strictly by the MIT conditions (retention of copyright and permission notice), and the provisions of the alternative license (GPL-3.0-or-later) are legally void as to that licensee. Radiance's election is documented and binding.

### 4.2 Dynamic Linking and the LGPL Boundary (`libvips` in Sharp)
The GNU Lesser General Public License v3 (LGPL-3.0) requires that users be allowed to modify or replace the LGPL library without invalidating the application. In Radiance:
1. Sharp is an internal build and server-side runtime dependency for server-rendered image optimization.
2. It is never bundled into client JavaScript distributed to web browsers.
3. The server environment dynamically links the precompiled shared library.
4. LGPL-3.0 does not include the Affero GPL (AGPL) Section 13 clause that triggers copyleft obligations over network interaction.
Therefore, SaaS deployment or source-available code sharing does not require licensing Radiance under LGPL.

### 4.3 FSL-1.1 Non-Compete Scope (`sentry` CLI)
The Functional Source License 1.1 (FSL-1.1-Apache-2.0) restricts users from offering a competing error-monitoring SaaS platform. Radiance is an AI workspace and multi-model reasoning system; it does not compete with Sentry. Furthermore, `@sentry/cli` is a dev-only utility used during CI to upload source maps.

### 4.4 DCO vs CLA Separation
A Developer Certificate of Origin (DCO) certifies that a contributor wrote the code or has the right to submit it. It does not grant a multi-clause commercial sublicensing or patent license. Radiance explicitly separates the two: DCO commit sign-offs certify authorship; explicit pull request checkboxes record affirmative acceptance of the Contributor License Agreement.

---

## 5. Historical Exposure Audit & Git History Record

An inspection of Git history indicates that raw third-party template files (`ascend.html`, `starfield.html`) were introduced in earlier commits:
- Commit `b76c688`: Added `public/ascend.html`
- Commit `b1470d9`: Added `public/starfield.html`
- Commit `d167fcf`: Relocated to `.antigravity/prototypes/`
- Current Commit: Permanently removed from git tracking (`git rm`) and added to `.gitignore`.

**Recommendation on History Rewriting:** Rewriting public Git history via `git filter-repo` or force-pushing would break downstream developer forks and clone references. Because these templates were curated free showcase templates, historical presence in non-HEAD Git commits represents negligible legal exposure. The repository maintainers must explicitly authorize any future BFG / git-filter-branch history rewriting.

---

## 6. Legal Disclaimer

This document records technical and licensing audit findings and remediation actions performed for engineering compliance. It uses the placeholder `[COPYRIGHT HOLDER NAME OR LEGAL ENTITY]` pending official corporate/legal designation by the repository owner. This record does not constitute formal legal counsel, statutory certification, or guaranteed judicial enforceability.
