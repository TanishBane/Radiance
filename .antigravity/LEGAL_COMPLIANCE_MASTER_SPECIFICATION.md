# RADIANCE INTELLECTUAL PROPERTY & LEGAL COMPLIANCE MASTER SPECIFICATION

**Document Version:** 1.0.0  
**Compliance Lead:** `@compliance` (Phase 2 Worker 4, Phase 3, Phase 4, Phase 5, Phase 6, Phase 7)  
**Date:** November 15, 2026  
**Scope:** Complete repository IP architecture, proprietary source-available licensing framework, third-party notice registry, upstream license archive, internal compliance audit and risk matrix, Contributor License Agreement (CLA), and repository documentation updates.

---

# SECTION 1: INDEPENDENT REVIEW & CHALLENGE OF AUDIT FINDINGS (PHASE 2, WORKER 4)

As independent compliance lead, the findings submitted by `@extaudit` (Worker 1), `@depsaudit` (Worker 2), and `@assetsaudit` (Worker 3) have been rigorously audited against copyright statutes, open-source legal precedents, and enterprise compliance standards.

### 1.1 Review and Challenge of External Component Audit (`@extaudit`)

| Finding / Component | `@extaudit` Position | `@compliance` Legal Determination & Challenge | Required Remediation / Invariant |
| :--- | :--- | :--- | :--- |
| **Ascend 3D Planet Scene** (`getlayers.ai`) | Licensed under GetLayers Commercial License; Flagged for hotlinked assets and verbatim demo. | **CHALLENGE CONFIRMED & ELEVATED.** While GetLayers AI authorizes incorporating exported UI into web deliverables, hosting `public/ascend.html` as a raw, uncompiled template on the public static root constitutes unmediated distribution of third-party template assets, violating GetLayers resale/template restrictions. Furthermore, hotlinking 3D binaries from `api.getlayers.ai` exposes Radiance to copyright, bandwidth, and availability risks. | **IMMEDIATE ACTION:** Remove `public/ascend.html` and `public/starfield.html` from `public/`. In `webgl-planet.tsx`, deprecate external Supabase asset hotlinks and transition to self-hosted procedural Three.js geometry or verified CC0 NASA Blue Marble maps. |
| **Aceternity UI Sidebar** (`@mannupaaji`) | Permissive MIT license; Clear. | **CHALLENGE ON ATTRIBUTION.** Permissive status is accurate. However, `src/components/ui/sidebar.tsx` currently contains zero upstream copyright headers. The MIT License legally mandates that the copyright and permission notice be included in all copies or substantial portions. | **ACTION:** Inject standardized MIT attribution header at the top of `src/components/ui/sidebar.tsx` and record full attribution in `THIRD_PARTY_NOTICES.md`. |
| **Shiny Button** (`@hyperiux` / Magic UI) | Permissive MIT license; Clear. | **CHALLENGE ON ATTRIBUTION.** Confirmed MIT, but `src/components/ui/shiny-button.tsx` and `.css` lack upstream attribution headers. | **ACTION:** Inject standardized MIT attribution header at the top of `shiny-button.tsx` and record entry in `THIRD_PARTY_NOTICES.md`. |
| **3D Voxel Wall** (`@mazyar-kawa`) | Permissive MIT license; Clear. | **CHALLENGE ON ATTRIBUTION.** Confirmed MIT, but `src/components/ui/voxel-wall.tsx` and `src/components/ui/voxel-wall-utils/*` lack upstream copyright headers. | **ACTION:** Inject standardized MIT attribution header and register in `THIRD_PARTY_NOTICES.md`. |
| **AI Prompt Composer** (`@neeraj-singh`) | Permissive MIT license; Merged into `chat-composer.tsx`. | **CHALLENGE ON DERIVATIVE PROVENANCE.** Confirmed MIT. The component was substantially rewritten into Radiance's production `chat-composer.tsx`. Because `chat-composer.tsx` is a core original Radiance file containing derivative interface concepts, copyright in the original expression is owned by Radiance, while upstream authorship of the initial concept must be acknowledged. | **ACTION:** Retain proprietary ownership of `chat-composer.tsx`; record historical derivation attribution in `THIRD_PARTY_NOTICES.md`. |
| **Simplex Noise 3D GLSL** (`Ashima Arts` / `Stefan Gustavson`) | Permissive MIT license; Clear. | **ACCEPTED & REINFORCED.** Ashima Arts / Stefan Gustavson simplex noise in `webgl-planet.tsx` must be credited under its 2011 MIT notice. | **ACTION:** Include Ashima Arts notice in `THIRD_PARTY_NOTICES.md`. |
| **ASCII Magic Generative Toolkit** | Permissive MIT license; Clear. | **ACCEPTED.** Ported procedural scenes in `src/lib/ascii-art/` are valid derivative works. Upstream attribution must be recorded. | **ACTION:** Include ASCII Magic notice in `THIRD_PARTY_NOTICES.md`. |
| **Fluted Glass Torus** | Original code; Clear. | **ACCEPTED.** Inspired by boutique design benchmarks, but authored from scratch in SVG and CSS. 100% original Radiance IP. | **ACTION:** Retain under exclusive proprietary copyright. |

---

### 1.2 Review and Challenge of Dependency Licensing Audit (`@depsaudit`)

| Finding / Scope | `@depsaudit` Position | `@compliance` Legal Determination & Challenge | Required Remediation / Invariant |
| :--- | :--- | :--- | :--- |
| **Overall Compatibility Verdict** | 100% Compatible with Source-Available Proprietary distribution. Zero copyleft contamination. | **ACCEPTED & VERIFIED.** Comprehensive scan of direct and transitive dependencies confirms no viral copyleft (`GPL`, `AGPL`) exists in runtime artifacts. | **INVARIANT:** Maintain automated pre-commit / CI dependency gating to reject future GPL/AGPL inclusions. |
| **Dual-Licensed `jszip@3.10.2`** | Dual-licensed `(MIT OR GPL-3.0-or-later)`. Elects MIT. | **ENDORSED UNDER ESTABLISHED LAW.** Where an upstream author offers software under disjunctive dual licenses (`A OR B`), the downstream distributor has the absolute legal prerogative to choose either license. Radiance formally and irrevocably elects the **MIT License**. The GPL-3.0 terms are excluded and inapplicable. | **ACTION:** Record formal declaration of MIT election in `THIRD_PARTY_NOTICES.md` and `LICENSE_AUDIT.md`. |
| **Server-Side `@img/sharp-win32-x64` (`libvips`)** | `LGPL-3.0-or-later` binary dynamically linked on server. No copyleft contamination. | **ENDORSED & RIGOROUSLY CONFINED.** LGPL-3.0 applies when software is distributed in binary form linked to an LGPL library. In Radiance: (1) Sharp runs exclusively server-side in Node.js for `next/image` optimization; (2) it is dynamically linked as an unmodified precompiled binary; (3) it is never bundled into client-side JavaScript; (4) LGPL does not contain the AGPL Section 13 network-copyleft clause. Thus, SaaS or source-available distribution does not trigger copyleft requirements on Radiance source code. | **ACTION:** Document runtime isolation boundary in `LICENSE_AUDIT.md` and `THIRD_PARTY_NOTICES.md`. |
| **Build Tooling `sentry@0.45.0` (`FSL-1.1-Apache-2.0`)** | Developer CLI tool for sourcemap uploads. Non-competing platform. | **ACCEPTED.** The Functional Source License prohibits operating a competing error-monitoring SaaS. Radiance is an AI productivity workspace, not an error-monitoring service. Furthermore, the CLI is dev-only and never shipped to end users. | **ACTION:** Document in dev-tooling section of `THIRD_PARTY_NOTICES.md`. |
| **Notice Preservation Obligations** | Apache-2.0, MIT, BSD, ISC notice requirements. | **COMPLIANCE MANDATE.** All 31 direct production dependencies and 212 transitive dependencies require notice preservation. | **ACTION:** Provide exhaustive registry in `THIRD_PARTY_NOTICES.md` and exact upstream texts in `LICENSES/`. |

---

### 1.3 Review and Challenge of Asset & Design Audit (`@assetsaudit`)

| Finding / Scope | `@assetsaudit` Position | `@compliance` Legal Determination & Challenge | Required Remediation / Invariant |
| :--- | :--- | :--- | :--- |
| **Brand Vectors & Emblems** (`public/brand/*`, `public/icon.svg`) | 100% original Radiance creations; Proprietary © 2026. | **CONFIRMED & RESERVED.** The 11-band Speed-R symbol and wordmark are bespoke proprietary artwork. All rights are reserved. No trademark or brand license is granted under the source-available code license. | **ACTION:** Enforce strict trademark reservation clause in `LICENSE`. |
| **Web Fonts** (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) | SIL Open Font License 1.1 (`OFL-1.1`). | **ACCEPTED WITH OFL INVARIANTS.** OFL-1.1 permits bundling with software and embedding in web applications. It prohibits selling the font files by themselves and requires preserving copyright notices and Reserved Font Names. Radiance does not sell fonts as standalone assets. | **ACTION:** Place `OFL-1.1.txt` in `LICENSES/` and record full copyright attributions in `THIRD_PARTY_NOTICES.md`. |
| **Iconography** (`lucide-react`, `@tabler/icons-react`) | Permissive ISC and MIT licenses. | **ACCEPTED.** Full commercial use permitted with notice retention. | **ACTION:** Record notice in `THIRD_PARTY_NOTICES.md`. |
| **Textmode Photo Representation** (`starry-ridge.ts`) | Vincentiu Solomon photo under Unsplash License. | **ACCEPTED.** Unsplash License permits non-exclusive, worldwide, free commercial and non-commercial adaptation without mandatory attribution. Provenance is cleanly established. | **ACTION:** Maintain courtesy attribution in `THIRD_PARTY_NOTICES.md`. |

---

# SECTION 2: PROPRIETARY LICENSING STRUCTURE FOR ORIGINAL RADIANCE CODE (PHASE 3)

The following legal text is the authoritative specification for the root `LICENSE` file. It establishes a balanced, enforceable **Source-Available Community and Commercial License** for Radiance, securing proprietary commercial rights while enabling public inspection, personal use, and open community contributions.

```text
RADIANCE SOURCE-AVAILABLE COMMUNITY & COMMERCIAL LICENSE
Version 1.0 (November 2026)

Copyright (c) 2026 [COPYRIGHT HOLDER NAME OR LEGAL ENTITY]. All Rights Reserved.

================================================================================
1. PREAMBLE & PURPOSE
================================================================================
Radiance ("the Software") is made available under this Source-Available Community
and Commercial License ("License") to foster public trust, enable security auditing,
support individual personal use, and welcome community contributions, while
protecting the original architecture, design, and commercial deployment rights
of [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] ("Licensor").

By viewing, accessing, downloading, copying, installing, modifying, or using the
Software, you agree to be bound by the terms and conditions of this License. If you
do not agree, do not access, copy, install, or use the Software.

================================================================================
2. DEFINITIONS
================================================================================
"Software" means the computer software, source code, object code, design files,
documentation, interfaces, and algorithms developed as part of the Radiance platform,
including any updates, bug fixes, or modifications provided by Licensor.

"Original Code" means all source code, architecture, layouts, styles, and assets
authored directly by Licensor, excluding any Third-Party Components.

"Third-Party Components" means software libraries, frameworks, UI components,
shaders, icons, fonts, templates, or media authored by third parties and
incorporated into, bundled with, or utilized by the Software.

"Commercial Use" means any use, deployment, hosting, operation, reproduction,
or distribution of the Software, directly or indirectly, intended for or directed
toward commercial advantage, monetary compensation, revenue generation, or
business operations.

"Personal & Non-Commercial Use" means use solely for personal, non-commercial,
educational, research, or internal evaluation purposes, without any monetary
charge, fee, or commercial advantage.

================================================================================
3. GRANT OF RIGHTS (PERMITTED USES)
================================================================================
Subject to your compliance with the terms of this License, Licensor grants you a
non-exclusive, non-transferable, royalty-free, limited license to:

(a) Public Inspection & Security Auditing: Inspect, compile, test, evaluate, and
    audit the source code of the Software for educational, security, and verification
    purposes;

(b) Personal & Non-Commercial Self-Hosting: Install, execute, and run a single
    private instance of the Software strictly for your own personal, non-commercial
    use;

(c) Community Contributions: Submit bug fixes, enhancements, or suggested modifications
    to the Software via pull requests or patches, subject to the Radiance Contributor
    License Agreement (CLA).

================================================================================
4. PROHIBITIONS & RESTRICTIONS (COMMERCIAL & REDISTRIBUTION RESTRICTIONS)
================================================================================
Except as expressly authorized in Section 3, you MAY NOT:

(a) No Unauthorized Commercial SaaS or Managed Deployment: You may NOT host, run,
    deploy, operate, or provide the Software (or any derivative work thereof) as a
    managed service, hosted cloud platform, multi-tenant software-as-a-service (SaaS),
    platform-as-a-service (PaaS), application service provider (ASP), or external API
    service to third parties for commercial gain, revenue, or monetary compensation,
    without an explicit, separate written commercial agreement executed with Licensor;

(b) No Resale, Sublicensing, or White-Labeling: You may NOT sell, resell, lease,
    rent, distribute, sublicense, package, or white-label the Software (or any
    derivative work thereof) as a standalone commercial product or service;

(c) No Removal of Proprietary Notices: You may NOT remove, alter, or obscure any
    copyright, trademark, patent, or proprietary notice contained within the
    Software, its source files, documentation, or user interfaces;

(d) Notice Preservation: Any authorized copy, fork, or derivative of the Software
    permitted under this License must retain this License and all associated
    copyright notices in their entirety.

================================================================================
5. CARVE-OUT & EXCLUSION OF THIRD-PARTY INTELLECTUAL PROPERTY
================================================================================
The Software incorporates and depends upon various Third-Party Components licensed
under permissive open-source licenses (such as MIT, Apache-2.0, BSD, ISC, and OFL-1.1).

(a) Explicit Exclusion: THIS LICENSE APPLIES SOLELY TO THE ORIGINAL CODE AUTHORED
    BY [COPYRIGHT HOLDER NAME OR LEGAL ENTITY]. IT DOES NOT APPLY TO, MODIFY,
    SUPERSEDE, OR RESTRICT YOUR RIGHTS WITH RESPECT TO ANY THIRD-PARTY COMPONENTS.

(b) Upstream License Preservation: All Third-Party Components remain governed
    exclusively by their respective upstream licenses, as documented in
    THIRD_PARTY_NOTICES.md and the LICENSES/ directory. Nothing in this License
    shall be construed to limit, restrict, or condition any rights, permissions,
    or immunities granted to you under the applicable upstream open-source licenses
    governing those specific Third-Party Components.

================================================================================
6. TRADEMARKS & BRAND IDENTITY
================================================================================
This License does not grant any right, title, or interest in or to the trademarks,
service marks, trade names, logos, or brand assets of Radiance or Licensor,
including but not limited to the "Radiance" wordmark, the Speed-R emblem, and
associated graphical marks. All goodwill associated with such marks shall inure
exclusively to Licensor.

================================================================================
7. TERMINATION
================================================================================
This License and your rights hereunder will terminate automatically and immediately
without notice from Licensor if you fail to comply with any provision of this License.
Upon termination, you must immediately cease all use, reproduction, execution, and
distribution of the Software and destroy all copies in your possession or control.

================================================================================
8. DISCLAIMER OF WARRANTIES
================================================================================
TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SOFTWARE IS PROVIDED
"AS IS" AND "AS AVAILABLE", WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND.
LICENSOR EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS, IMPLIED, STATUTORY, OR
OTHERWISE, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE, TITLE, ACCURACY, AND NON-INFRINGEMENT.

LICENSOR DOES NOT WARRANT THAT THE SOFTWARE WILL BE UNINTERRUPTED, TIMELY, SECURE,
ERROR-FREE, OR COMPATIBLE WITH ANY PARTICULAR HARDWARE, SOFTWARE, OR PLATFORM.
YOU ASSUME SOLE RESPONSIBILITY FOR THE SELECTION, INSTALLATION, CONFIGURATION,
AND USE OF THE SOFTWARE.

================================================================================
9. LIMITATION OF LIABILITY
================================================================================
IN NO EVENT AND UNDER NO LEGAL THEORY, WHETHER IN CONTRACT, TORT (INCLUDING
NEGLIGENCE), STRICT LIABILITY, OR OTHERWISE, SHALL LICENSOR, ITS AFFILIATES,
CONTRIBUTORS, OR LICENSORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; BUSINESS INTERRUPTION; OR SYSTEM FAILURE) ARISING OUT OF OR IN
CONNECTION WITH THIS LICENSE OR THE USE OR INABILITY TO USE THE SOFTWARE, EVEN
IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.

================================================================================
10. COMMERCIAL LICENSING & INQUIRIES
================================================================================
Organizations or entities desiring to deploy Radiance as a commercial cloud offering,
managed SaaS service, enterprise platform, or white-labeled solution must obtain
an enterprise commercial license. Inquiries regarding commercial licensing may be
directed to [COPYRIGHT HOLDER NAME OR LEGAL ENTITY].
```

---

# SECTION 3: SPECIFICATIONS FOR `THIRD_PARTY_NOTICES.MD` (PHASE 4)

The file `THIRD_PARTY_NOTICES.md` must be placed at the root of the repository. It serves as the comprehensive legal register satisfying all attribution, copyright preservation, and disclosure requirements for incorporated external code, fonts, icons, media, and npm packages.

### Structure of `THIRD_PARTY_NOTICES.md`

1. **Introduction & Dual-Licensing Architecture Statement:**
   Explains that Radiance combines proprietary original code with permissive open-source third-party dependencies and components.
2. **Section 1: External UI Components, Shaders & Patterns:**
   - **Aceternity UI Sidebar:** Author: Manu Arora (`@mannupaaji`), License: MIT, Files: `src/components/ui/sidebar.tsx`, `src/components/navigation/sidebar-dock.tsx`.
   - **21st.dev Shiny Button:** Author: Hyperiux Vault (`@hyperiux`), License: MIT, Files: `src/components/ui/shiny-button.tsx`, `shiny-button.css`.
   - **21st.dev 3D Voxel Wall:** Author: Mazyar Kawa (`@mazyar-kawa`), License: MIT, Files: `src/components/ui/voxel-wall.tsx`, `src/components/ui/voxel-wall-utils/*`.
   - **21st.dev AI Prompt Composer:** Author: Neeraj Singh (`@neeraj-singh`), License: MIT, Files: Derived concepts in `src/components/chat/chat-composer.tsx`.
   - **21st.dev Flagship Atmosphere Canvas Engines:** Authors: Manu Arora, `@ham7a311`, 21st.dev Community, License: MIT, Files: `src/components/background/atmosphere-canvas-engine.tsx`, `aurora-gradient-background.tsx`.
   - **ASCII Magic Generative Canvas Toolkit:** Author: ASCII Magic (`ascii-magic.com`), License: MIT, Files: `src/lib/ascii-art/*`, `src/components/ui/ascii-art.tsx`, `arctic-icebergs-background.tsx`.
   - **Shadcn `cn` Utility:** Author: shadcn, License: MIT, File: `src/lib/utils/cn.ts`.
   - **Simplex Noise 3D GLSL (`snoise`):** Authors: Stefan Gustavson & Ian McEwan (Ashima Arts, 2011), License: MIT, Files: `src/components/landing/webgl-planet.tsx`.
   - **GetLayers AI 3D Scenes:** Provider: GetLayers AI (`getlayers.ai`), License: GetLayers Commercial Free Tier, Files: `src/components/landing/webgl-starfield.tsx`, `webgl-planet.tsx`.
3. **Section 2: Direct Runtime NPM Dependencies (31 Packages):**
   Full table with package name, resolved version, declared SPDX license, upstream repository, and exact copyright/notice requirements.
4. **Section 3: Dual-Licensed Dependencies & Formal Election:**
   - `jszip@3.10.2` (`(MIT OR GPL-3.0-or-later)`): Explicit election of **MIT License**.
   - `json-schema@0.4.0` (`(AFL-2.1 OR BSD-3-Clause)`): Explicit election of **BSD-3-Clause**.
5. **Section 4: Server-Side Isolated Dependencies:**
   - `@img/sharp-win32-x64@0.35.5` containing `libvips` (`LGPL-3.0-or-later`): Isolated server-side dynamic binary link; no client distribution.
6. **Section 5: Typographic & Font Software:**
   - Cormorant Garamond (Catharsis Fonts, OFL-1.1)
   - Plus Jakarta Sans (Tokotype, OFL-1.1)
   - JetBrains Mono (JetBrains, OFL-1.1)
   - KaTeX Fonts (Khan Academy, OFL-1.1)
7. **Section 6: Iconography & Vectors:**
   - Lucide Icons (Lucide Project, ISC / MIT)
   - Tabler Icons (Paweł Kuna, MIT)
8. **Section 7: Photographic & Visual References:**
   - Starry Ridge photograph by Vincentiu Solomon (Unsplash License)
9. **Section 8: Direct Development Dependencies (15 Packages):**
   Playwright, TypeScript, ESLint, Tailwind, Vitest, Sentry CLI.

---

# SECTION 4: SPECIFICATIONS FOR `LICENSES/` DIRECTORY (PHASE 4)

The `LICENSES/` directory has been created and populated at the repository root. It houses the exact, official upstream texts of all licenses governing third-party materials in Radiance:

| License File | SPDX Identifier | Upstream Coverage in Radiance |
| :--- | :--- | :--- |
| `LICENSES/MIT.txt` | `MIT` | React, Next.js, Three.js, Radix UI, Supabase, Aceternity, 21st.dev components, ASCII Magic, Tabler |
| `LICENSES/Apache-2.0.txt` | `Apache-2.0` | Vercel AI SDK (`@ai-sdk/*`, `ai`), Speed Insights, Draco 3D WASM, Playwright, TypeScript |
| `LICENSES/BSD-2-Clause.txt` | `BSD-2-Clause` | `mammoth`, `dotenv`, `lop`, `option` |
| `LICENSES/BSD-3-Clause.txt` | `BSD-3-Clause` | `@webgpu/types`, `ieee754`, `source-map-js`, `json-schema` (elected) |
| `LICENSES/ISC.txt` | `ISC` | `lucide-react`, `n8ao`, `semver`, `picocolors`, `inherits`, `zod-to-json-schema` |
| `LICENSES/OFL-1.1.txt` | `OFL-1.1` | Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono, KaTeX fonts |
| `LICENSES/Zlib.txt` | `Zlib` | `postprocessing` (pmndrs / Raoul van Rüschen) |
| `LICENSES/0BSD.txt` | `0BSD` | `tslib` (Microsoft) |
| `LICENSES/BlueOak-1.0.0.txt` | `BlueOak-1.0.0` | `glob`, `lru-cache`, `minimatch`, `minipass`, `path-scurry` |
| `LICENSES/MPL-2.0.txt` | `MPL-2.0` | `lightningcss` (build-time CSS compiler) |
| `LICENSES/LGPL-3.0.txt` | `LGPL-3.0-or-later` | `@img/sharp-win32-x64` / `libvips` (server-side dynamically linked binary) |
| `LICENSES/FSL-1.1-Apache-2.0.txt` | `FSL-1.1-Apache-2.0` | `sentry` CLI (CI sourcemap release tooling) |

---

# SECTION 5: SPECIFICATIONS FOR `LICENSE_AUDIT.MD` (PHASE 5)

`LICENSE_AUDIT.md` serves as the internal compliance audit record, risk matrix, evidence log, and operational runbook.

### Comprehensive Risk Matrix & Remediation Blueprint

| ID | Risk Item & Location | Severity | Legal / Operational Exposure | Remediation Plan & Invariant | Current Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RSK-01** | Hotlinked 3D Models in `src/components/landing/webgl-planet.tsx` (`planet.glb`, `planet-lights.glb`, `planet-clouds.png`) | **HIGH** | Assets fetched at runtime from external bucket (`api.getlayers.ai`). Unclear sub-licensing rights for third-party hosting; vulnerability to CORS breakage or upstream endpoint deletion. | Replace external hotlinks with self-hosted procedural Three.js geometry or verified NASA Blue Marble CC0 maps in `public/assets/`. | **REMEDIATION SPECIFIED** |
| **RSK-02** | Verbatim Third-Party Templates in `public/` (`public/ascend.html`, `public/starfield.html`) | **MEDIUM** | Hosting raw, uncompiled HTML mockup templates on a public server exposes raw template files, potentially conflicting with GetLayers template redistribution terms. | Delete or relocate `public/ascend.html` and `public/starfield.html` into `.antigravity/prototypes/`. | **REMEDIATION SPECIFIED** |
| **RSK-03** | Lack of Code-Level MIT Attribution Headers in Third-Party UI Files | **MEDIUM** | `sidebar.tsx`, `shiny-button.tsx`, `voxel-wall.tsx`, and `ascii-art/kit.ts` lack copyright headers, creating ambiguity regarding original vs. third-party code boundaries. | Insert standardized lightweight MIT copyright comment headers at the top of each incorporated component file. | **REMEDIATION SPECIFIED** |
| **RSK-04** | Dual-Licensed Dependency `jszip@3.10.2` (`(MIT OR GPL-3.0-or-later)`) | **LOW** | Potential copyleft contamination if GPL terms were unintentionally triggered. | Formally declare irrevocable election of the **MIT License** terms in all legal notices and registers. | **RESOLVED & DOCUMENTED** |
| **RSK-05** | Server-Side LGPL Dependency `@img/sharp-win32-x64` (`libvips`) | **LOW** | Misinterpretation of LGPL obligations in proprietary SaaS products. | Confirm strict runtime dynamic linking isolation in Node.js; no client bundling; absence of AGPL network-copyleft terms. | **RESOLVED & DOCUMENTED** |
| **RSK-06** | Third-Party Web Fonts Bundling (`Cormorant Garamond`, `Plus Jakarta Sans`, `JetBrains Mono`) | **LOW** | Failure to adhere to SIL Open Font License (OFL-1.1) conditions. | Confirm fonts are served for UI rendering and not sold independently; preserve OFL-1.1 notices in notice files. | **RESOLVED & DOCUMENTED** |

---

# SECTION 6: SPECIFICATIONS FOR `CONTRIBUTOR_LICENSE_AGREEMENT.MD` (PHASE 6)

The Contributor License Agreement (CLA) establishes the intellectual property framework for community contributions. Crucially, **contributors retain full copyright ownership of their contributions**, while granting Radiance the necessary perpetual licenses to distribute, sublicense, and commercially deploy the software.

```text
RADIANCE INDIVIDUAL & ENTITY CONTRIBUTOR LICENSE AGREEMENT (CLA)
Version 1.0 (November 2026)

Thank you for your interest in contributing to Radiance ("the Project"), managed
by [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] ("Project Maintainer").

In order to clarify the intellectual property licenses granted with Contributions,
this Contributor License Agreement ("Agreement") must be accepted by any individual
or entity submitting Contributions to the Project.

================================================================================
1. DEFINITIONS
================================================================================
"You" (or "Your") means the copyright owner or legal entity authorized by the
copyright owner that is making this Agreement with Project Maintainer.

"Contribution" means any original work of authorship, including any source code,
object code, patch, tool, test, documentation, design asset, or modification,
submitted by You to the Project for inclusion in, or documentation of, the Software.

"Submit" means any form of electronic, verbal, or written communication sent to
the Project, its maintainers, or its repositories, including but not limited to
communications on GitHub pull requests, issues, mailing lists, and code reviews.

================================================================================
2. RETENTION OF YOUR COPYRIGHT OWNERSHIP
================================================================================
YOU RETAIN FULL COPYRIGHT OWNERSHIP AND ALL INTELLECTUAL PROPERTY RIGHTS IN AND
TO YOUR CONTRIBUTIONS. You are not assigning or transferring copyright ownership
of Your Contributions to Project Maintainer under this Agreement.

================================================================================
3. GRANT OF COPYRIGHT LICENSE
================================================================================
Subject to the terms and conditions of this Agreement, You hereby grant to
[COPYRIGHT HOLDER NAME OR LEGAL ENTITY] and to recipients of software distributed
by Project Maintainer a perpetual, worldwide, non-exclusive, no-charge,
royalty-free, irrevocable copyright license to:

(a) Reproduce, prepare derivative works of, publicly display, publicly perform,
    sublicense, and distribute Your Contributions and such derivative works; and

(b) Incorporate Your Contributions into the Software and distribute the resulting
    works under the Radiance Source-Available Community & Commercial License, or
    under any commercial, proprietary, or open-source licenses as Project Maintainer
    may select in its sole discretion.

================================================================================
4. GRANT OF PATENT LICENSE
================================================================================
Subject to the terms of this Agreement, You hereby grant to Project Maintainer and
to recipients of software distributed by Project Maintainer a perpetual, worldwide,
non-exclusive, no-charge, royalty-free, irrevocable patent license to make, have made,
use, offer to sell, sell, import, and otherwise transfer the Work, where such
license applies only to those patent claims licensable by You that are necessarily
infringed by Your Contribution(s) alone or by combination with the Work.

================================================================================
5. YOUR REPRESENTATIONS & WARRANTIES
================================================================================
You represent and warrant that:

(a) Original Authorship: Each Contribution is entirely Your original creation, or
    You have obtained all necessary rights, licenses, and permissions from the
    copyright holder to submit the Contribution under these terms;

(b) Authority: You are legally entitled and authorized to grant the licenses set
    forth in this Agreement;

(c) No Conflicting Obligations: Your Contribution does not infringe any third party's
    copyright, patent, trademark, trade secret, or other proprietary right, and is
    not subject to any employment, non-disclosure, or contractual restriction that
    would conflict with this grant.

================================================================================
6. THIRD-PARTY WORK NOTICE OBLIGATION
================================================================================
Should You wish to submit work that is not Your original creation, You may submit
it separately to the Project only if You conspicuously disclose the complete
details of its source, upstream author, copyright notices, and applicable license
(e.g., MIT, Apache-2.0, BSD) within the pull request description or source files.

================================================================================
7. ACCEPTANCE MECHANISM
================================================================================
By opening a pull request, submitting code, or including a "Signed-off-by: Your Name <email>"
line in Your commit metadata (Developer Certificate of Origin), You confirm Your
acceptance of this Agreement.
```

---

# SECTION 7: REPOSITORY DOCUMENTATION UPDATES (PHASE 7)

### 7.1 Updates for `README.md`

1. **Badge Replacement (Line 18):**
   - *Previous:* `[![License: MIT](https://img.shields.io/badge/License-MIT-7c5cff.svg)](LICENSE)`
   - *Updated:* `[![License: Source-Available](https://img.shields.io/badge/License-Source--Available-7c5cff.svg)](LICENSE)`

2. **License Section Replacement (End of README.md):**
   ```markdown
   ---

   ## License & Intellectual Property

   Radiance is source-available software licensed under the **Radiance Source-Available Community & Commercial License**.  
   Copyright &copy; 2026 [COPYRIGHT HOLDER NAME OR LEGAL ENTITY]. All Rights Reserved.

   - **Public Inspection & Auditing:** The source code is publicly accessible for security audits, personal learning, and community contributions.
   - **Personal & Non-Commercial Use:** Free for individual, non-commercial self-hosting and evaluation.
   - **Commercial Deployment:** Unauthorized resale, redistribution, sublicensing, white-labeling, or independent commercial SaaS deployment is strictly prohibited without an explicit commercial license.
   - **Third-Party Open Source:** All third-party libraries, UI components, fonts, and assets remain governed by their respective upstream permissive licenses. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and the [LICENSES/](LICENSES/) directory.
   - **Contributions:** All community contributions are subject to the [Contributor License Agreement](CONTRIBUTOR_LICENSE_AGREEMENT.md).
   ```

---

### 7.2 Updates for `CONTRIBUTING.md`

Add the following section before "Submitting a Pull Request":

```markdown
---

## Licensing & Contributor License Agreement (CLA)

Radiance is maintained under a source-available proprietary license model. We welcome contributions from the community to improve the platform, fix defects, and expand capabilities.

### 1. Contributor Copyright Retention
When you contribute code, documentation, or design assets to Radiance, **you retain full copyright ownership of your contributions**. You do not assign your copyright to Radiance or its maintainers.

### 2. Contributor License Grant
By submitting a pull request or patch to Radiance, you agree to the terms of the [Radiance Contributor License Agreement (CLA)](CONTRIBUTOR_LICENSE_AGREEMENT.md). Under the CLA, you grant [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] a perpetual, worldwide, royalty-free, non-exclusive license to use, modify, sublicense, and distribute your contribution as part of the Radiance platform under our source-available and commercial licenses.

### 3. Developer Certificate of Origin (DCO)
We encourage contributors to include a `Signed-off-by` line in their commit messages:
```bash
git commit -s -m "feat(chat): add streaming message retry logic"
```
By signing off on a commit, you certify that the contribution is your original creation and that you have the right to submit it under the project's CLA.

### 4. Third-Party Code in Pull Requests
If your pull request incorporates third-party open-source code (e.g., from MIT or Apache-2.0 licensed projects), you must:
1. Conspicuously disclose the upstream origin and author in your pull request description.
2. Include the original copyright and license notice header in any new or modified files.
3. Ensure the upstream license is compatible with permissive commercial distribution.
```

---

### 7.3 Updates for `SECURITY.md`

Add an explicit authorization statement for security researchers:

```markdown
---

## 4. Security Research & Source Inspection

Under the Radiance Source-Available License, security researchers and practitioners are explicitly authorized and encouraged to inspect, compile, audit, and evaluate the Radiance source code for potential security vulnerabilities. 

Responsible security research conducted in good faith according to this policy will not be considered a violation of the software license, nor will it be subject to legal action by the Radiance maintainers.
```

---

### 7.4 Updates for `CODE_OF_CONDUCT.md`

Ensure consistency with project governance and community leadership:
- Reiterate that community interaction, code reviews, and contribution discussions are governed by the Contributor Covenant standards.
- Clarify that moderation decisions are administered by [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] in accordance with the established pledge and standards.
