# THIRD-PARTY SOFTWARE NOTICES & ATTRIBUTIONS

**Product:** RADIANCE AI Platform  
**License Architecture:** Dual-Layer (Proprietary Source-Available Core with Permissive Open-Source Third-Party Dependencies)  
**Maintained by:** [COPYRIGHT HOLDER NAME OR LEGAL ENTITY]  
**Last Updated:** November 15, 2026  

---

| 📖 [README](README.md) | ⚖️ [License](LICENSE) | 📜 [Third-Party Notices](THIRD_PARTY_NOTICES.md) | 🔍 [License Audit](LICENSE_AUDIT.md) | 🤝 [CLA](CONTRIBUTOR_LICENSE_AGREEMENT.md) | 👥 [Contributing](CONTRIBUTING.md) | 🛡️ [Security](SECURITY.md) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |

---

## Overview

Radiance incorporates open-source and third-party software components, libraries, user-interface elements, shaders, fonts, and assets. This document acknowledges upstream authors and provides the required legal copyright notices, permission terms, and disclaimers in accordance with each component's upstream license.

Original code authored by [COPYRIGHT HOLDER NAME OR LEGAL ENTITY] is licensed under the proprietary **Radiance Source-Available Community & Commercial License** (see `LICENSE`). The terms of that license apply exclusively to the original portions of Radiance and do **not** limit, alter, or restrict your rights with respect to any third-party components listed below, which remain governed by their respective upstream licenses.

Canonical texts for all referenced licenses are provided in the [`LICENSES/`](LICENSES/) directory.

---

## Table of Contents

1. [External UI Components, Shaders & Generative Toolkits](#1-external-ui-components-shaders--generative-toolkits)
2. [Dual-Licensed Dependencies & License Elections](#2-dual-licensed-dependencies--license-elections)
3. [Server-Side Dynamically Linked Dependencies](#3-server-side-dynamically-linked-dependencies)
4. [Typographic & Web Font Software](#4-typographic--web-font-software)
5. [Iconography & Vector Systems](#5-iconography--vector-systems)
6. [Photographic & Visual References](#6-photographic--visual-references)
7. [Direct Production Runtime Dependencies](#7-direct-production-runtime-dependencies)
8. [Development & Build Tooling Dependencies](#8-development--build-tooling-dependencies)

---

## 1. External UI Components, Shaders & Generative Toolkits

### Aceternity UI Sidebar
- **Upstream Author:** Manu Arora (`@mannupaaji` / Aceternity UI)
- **Source URL:** https://ui.aceternity.com/components/sidebar
- **SPDX License:** MIT
- **Incorporated Files:** `src/components/ui/sidebar.tsx`, `src/components/navigation/sidebar-dock.tsx`
- **Notice:**
  ```text
  Copyright (c) Manu Arora / Aceternity UI
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### 21st.dev Shiny Button
- **Upstream Author:** Hyperiux Vault (`@hyperiux` on 21st.dev) / Magic UI
- **Source URL:** https://21st.dev/@hyperiux/shiny-button
- **SPDX License:** MIT
- **Incorporated Files:** `src/components/ui/shiny-button.tsx`, `src/components/ui/shiny-button.css`
- **Notice:**
  ```text
  Copyright (c) Hyperiux Vault / 21st.dev Community
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### 21st.dev 3D Voxel Wall
- **Upstream Author:** Mazyar Kawa (`@mazyar-kawa` on 21st.dev)
- **Source URL:** https://21st.dev/@mazyar-kawa/voxel-wall
- **SPDX License:** MIT
- **Incorporated Files:** `src/components/ui/voxel-wall.tsx`, `src/components/ui/voxel-wall-utils/*`
- **Notice:**
  ```text
  Copyright (c) Mazyar Kawa
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### 21st.dev AI Prompt Composer (Concept)
- **Upstream Author:** Neeraj Singh (`@neeraj-singh` on 21st.dev)
- **Source URL:** https://21st.dev/community/ai-prompt-composer-with-model-selector
- **SPDX License:** MIT
- **Incorporated Files:** Interface concepts adapted in `src/components/chat/chat-composer.tsx`
- **Notice:**
  ```text
  Copyright (c) Neeraj Singh / 21st.dev Community
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### 21st.dev Flagship Atmosphere Canvas Engines
- **Upstream Authors:** Manu Arora, `@ham7a311`, 21st.dev Community
- **Source URL:** https://ui.aceternity.com/components/spotlight, https://21st.dev/@ham7a311/ribbon-flow
- **SPDX License:** MIT
- **Incorporated Files:** `src/components/background/atmosphere-canvas-engine.tsx`, `aurora-gradient-background.tsx`
- **Notice:**
  ```text
  Copyright (c) Manu Arora, @ham7a311, 21st.dev Community
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### ASCII Magic Generative Canvas Toolkit
- **Upstream Author:** ASCII Magic (`ascii-magic.com`)
- **Source URL:** https://ascii-magic.com/
- **SPDX License:** MIT
- **Incorporated Files:** `src/lib/ascii-art/*`, `src/components/ui/ascii-art.tsx`, `src/components/background/arctic-icebergs-background.tsx`
- **Notice:**
  ```text
  Copyright (c) ASCII Magic (ascii-magic.com)
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### Shadcn ClassName Utility (`cn`)
- **Upstream Author:** shadcn (`shadcn/ui`)
- **Source URL:** https://ui.shadcn.com/
- **SPDX License:** MIT
- **Incorporated Files:** `src/lib/utils/cn.ts`
- **Notice:**
  ```text
  Copyright (c) shadcn
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### Simplex Noise 3D GLSL (`snoise`)
- **Upstream Authors:** Stefan Gustavson & Ian McEwan (Ashima Arts)
- **Source URL:** https://github.com/ashima/webgl-noise
- **SPDX License:** MIT
- **Incorporated Use:** Procedural WebGL noise algorithm in Starfield and atmosphere shaders
- **Notice:**
  ```text
  Copyright (C) 2011 Ashima Arts. All rights reserved.
  Copyright (C) 2011 Stefan Gustavson. All rights reserved.
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### Retired Prototype Notice: Ascend 3D Planet & Raw Templates
- **Prior Prototype Components:** `webgl-planet.tsx`, `radiance-planet-landing.tsx`, and `ascend-*.tsx`.
- **Status:** Formally deprecated and permanently removed from the active codebase. All raw standalone template files (`ascend.html`, `starfield.html`) and external asset hotlinks (`api.getlayers.ai`) have been purged from git tracking to ensure absolute compliance with third-party redistribution restrictions. Radiance's production landing page operates on an independent, original architecture.

---

## 2. Dual-Licensed Dependencies & License Elections

### JSZip (`jszip@3.10.2`)
- **Upstream Authors:** Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
- **Declared License:** `(MIT OR GPL-3.0-or-later)`
- **Formal Election:** Radiance explicitly, formally, and irrevocably elects the **MIT License**. The GPL-3.0-or-later license terms do not apply.
- **Notice:**
  ```text
  Copyright (c) 2009-2016 Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso
  Licensed under the MIT License (see LICENSES/MIT.txt)
  ```

### JSON-Schema (`json-schema@0.4.0`)
- **Upstream Author:** Kris Zyp
- **Declared License:** `(AFL-2.1 OR BSD-3-Clause)`
- **Formal Election:** Radiance explicitly elects the **BSD-3-Clause License**.
- **Notice:**
  ```text
  Copyright (c) 2005-2015, The Dojo Foundation
  Licensed under the BSD-3-Clause License (see LICENSES/BSD-3-Clause.txt)
  ```

---

## 3. Server-Side Dynamically Linked Dependencies

### Sharp Image Processing Engine (`@img/sharp-win32-x64@0.35.5`)
- **Upstream Authors:** Lovell Fuller and contributors
- **Binding License:** Apache-2.0
- **Bundled Binary Engine:** `libvips` (`LGPL-3.0-or-later`)
- **Architecture & Isolation:** Executed exclusively server-side in Node.js for `next/image` optimization. The `libvips` dynamic C-binary is unmodified and dynamically linked. It is never bundled into client-side code and does not trigger network copyleft under LGPL-3.0.
- **Notice:**
  ```text
  Copyright (c) Lovell Fuller and sharp contributors (Apache-2.0)
  libvips is Copyright (c) libvips contributors (LGPL-3.0-or-later; see LICENSES/LGPL-3.0.txt)
  ```

---

## 4. Typographic & Web Font Software

All fonts are licensed under the **SIL Open Font License, Version 1.1** (see [`LICENSES/OFL-1.1.txt`](LICENSES/OFL-1.1.txt)). They are bundled or delivered via Google Fonts CDN for visual presentation and are not sold as standalone font files.

### Cormorant Garamond
- **Copyright:** Copyright (c) 2015 Christian Thalmann (`christian.thalmann@gmail.com`), with Reserved Font Name "Cormorant".
- **Source:** https://github.com/CatharsisFonts/Cormorant

### Plus Jakarta Sans
- **Copyright:** Copyright (c) 2020 The Plus Jakarta Sans Project Authors (`https://github.com/tokotype/PlusJakartaSans`).
- **Source:** https://github.com/tokotype/PlusJakartaSans

### JetBrains Mono
- **Copyright:** Copyright (c) 2020 The JetBrains Mono Project Authors (`https://github.com/JetBrains/JetBrainsMono`).
- **Source:** https://github.com/JetBrains/JetBrainsMono

### KaTeX Fonts
- **Copyright:** Copyright (c) 2013-2020 Khan Academy (`https://github.com/KaTeX/KaTeX`).
- **Source:** https://github.com/KaTeX/KaTeX

---

## 5. Iconography & Vector Systems

### Lucide Icons (`lucide-react@0.479.0`)
- **Copyright:** Copyright (c) 2013-2022 Cole Bemis (MIT); Copyright (c) 2022-present Lucide Contributors (ISC)
- **License:** ISC License (see [`LICENSES/ISC.txt`](LICENSES/ISC.txt))
- **Source:** https://github.com/lucide-icons/lucide

### Tabler Icons (`@tabler/icons-react@3.50.0`)
- **Copyright:** Copyright (c) 2020-2024 Paweł Kuna
- **License:** MIT License (see [`LICENSES/MIT.txt`](LICENSES/MIT.txt))
- **Source:** https://github.com/tabler/tabler-icons

---

## 6. Photographic & Visual References

### Starry Ridge Texture (`src/lib/ascii-art/starry-ridge.ts`)
- **Original Work:** Photograph by Vincentiu Solomon
- **Source:** https://unsplash.com/photos/ln5drpv_ImI
- **License:** Unsplash License (Commercial & Non-Commercial free use without mandatory attribution)
- **Adaptation:** Procedurally quantized into 192x108 textmode ASCII art array for algorithmic background rendering.

---

## 7. Direct Production Runtime Dependencies

The following table catalogs all 31 direct production dependencies declared in `package.json`:

| Package Name | Resolved Version | Declared SPDX License | Upstream Repository | Applicable License File |
| :--- | :--- | :--- | :--- | :--- |
| `@ai-sdk/google` | `1.2.22` | Apache-2.0 | https://github.com/vercel/ai | `LICENSES/Apache-2.0.txt` |
| `@ai-sdk/groq` | `1.2.9` | Apache-2.0 | https://github.com/vercel/ai | `LICENSES/Apache-2.0.txt` |
| `@ai-sdk/openai` | `1.3.24` | Apache-2.0 | https://github.com/vercel/ai | `LICENSES/Apache-2.0.txt` |
| `@radix-ui/react-dialog` | `1.3.1` | MIT | https://github.com/radix-ui/primitives | `LICENSES/MIT.txt` |
| `@radix-ui/react-dropdown-menu` | `2.2.1` | MIT | https://github.com/radix-ui/primitives | `LICENSES/MIT.txt` |
| `@radix-ui/react-popover` | `1.3.1` | MIT | https://github.com/radix-ui/primitives | `LICENSES/MIT.txt` |
| `@radix-ui/react-slot` | `1.5.0` | MIT | https://github.com/radix-ui/primitives | `LICENSES/MIT.txt` |
| `@radix-ui/react-tooltip` | `1.4.1` | MIT | https://github.com/radix-ui/primitives | `LICENSES/MIT.txt` |
| `@react-three/fiber` | `9.8.2` | MIT | https://github.com/pmndrs/react-three-fiber | `LICENSES/MIT.txt` |
| `@react-three/postprocessing` | `3.2.2` | MIT | https://github.com/pmndrs/react-postprocessing | `LICENSES/MIT.txt` |
| `@sentry/nextjs` | `11.11.0` | MIT | https://github.com/getsentry/sentry-javascript | `LICENSES/MIT.txt` |
| `@supabase/ssr` | `0.5.2` | MIT | https://github.com/supabase/ssr | `LICENSES/MIT.txt` |
| `@supabase/supabase-js` | `2.118.0` | MIT | https://github.com/supabase/supabase-js | `LICENSES/MIT.txt` |
| `@tabler/icons-react` | `3.50.0` | MIT | https://github.com/tabler/tabler-icons | `LICENSES/MIT.txt` |
| `@upstash/ratelimit` | `2.2.0` | MIT | https://github.com/upstash/ratelimit-js | `LICENSES/MIT.txt` |
| `@upstash/redis` | `1.40.0` | MIT | https://github.com/upstash/redis-js | `LICENSES/MIT.txt` |
| `@vercel/analytics` | `2.0.1` | MIT | https://github.com/vercel/analytics | `LICENSES/MIT.txt` |
| `@vercel/speed-insights` | `2.1.0` | Apache-2.0 | https://github.com/vercel/speed-insights | `LICENSES/Apache-2.0.txt` |
| `ai` | `4.3.19` | Apache-2.0 | https://github.com/vercel/ai | `LICENSES/Apache-2.0.txt` |
| `clsx` | `2.1.1` | MIT | https://github.com/lukeed/clsx | `LICENSES/MIT.txt` |
| `katex` | `0.19.1` | MIT | https://github.com/KaTeX/KaTeX | `LICENSES/MIT.txt` |
| `lucide-react` | `0.479.0` | ISC | https://github.com/lucide-icons/lucide | `LICENSES/ISC.txt` |
| `mammoth` | `1.13.0` | BSD-2-Clause | https://github.com/mwilliamson/mammoth.js | `LICENSES/BSD-2-Clause.txt` |
| `motion` | `12.43.0` | MIT | https://github.com/motiondivision/motion | `LICENSES/MIT.txt` |
| `next` | `15.5.28` | MIT | https://github.com/vercel/next.js | `LICENSES/MIT.txt` |
| `postprocessing` | `6.39.6` | Zlib | https://github.com/pmndrs/postprocessing | `LICENSES/Zlib.txt` |
| `react` | `19.3.1` | MIT | https://github.com/react/react | `LICENSES/MIT.txt` |
| `react-dom` | `19.3.1` | MIT | https://github.com/react/react | `LICENSES/MIT.txt` |
| `tailwind-merge` | `3.7.0` | MIT | https://github.com/dcastil/tailwind-merge | `LICENSES/MIT.txt` |
| `three` | `0.174.0` | MIT | https://github.com/mrdoob/three.js | `LICENSES/MIT.txt` |
| `zod` | `3.25.76` | MIT | https://github.com/colinhacks/zod | `LICENSES/MIT.txt` |

---

## 8. Development & Build Tooling Dependencies

The following packages are strictly build-time, testing, or linting utilities and are not bundled into end-user client distributions:

| Package Name | Resolved Version | Declared SPDX License | Upstream Repository |
| :--- | :--- | :--- | :--- |
| `@playwright/test` | `1.64.1` | Apache-2.0 | https://github.com/microsoft/playwright |
| `@tailwindcss/postcss` | `4.3.3` | MIT | https://github.com/tailwindlabs/tailwindcss |
| `@testing-library/react` | `16.3.3` | MIT | https://github.com/testing-library/react-testing-library |
| `@types/*` | Various | MIT | https://github.com/DefinitelyTyped/DefinitelyTyped |
| `eslint` | `9.39.4` | MIT | https://github.com/eslint/eslint |
| `eslint-config-next` | `15.5.28` | MIT | https://github.com/vercel/next.js |
| `jsdom` | `26.1.0` | MIT | https://github.com/jsdom/jsdom |
| `postcss` | `8.5.32` | MIT | https://github.com/postcss/postcss |
| `tailwindcss` | `4.3.3` | MIT | https://github.com/tailwindlabs/tailwindcss |
| `typescript` | `5.9.3` | Apache-2.0 | https://github.com/microsoft/TypeScript |
| `vitest` | `3.2.7` | MIT | https://github.com/vitest-dev/vitest |
| `sentry` (CLI) | `0.45.0` | FSL-1.1-Apache-2.0 | https://github.com/getsentry/cli |
