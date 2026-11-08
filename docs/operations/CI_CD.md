# RADIANCE PLATFORM — CI/CD ENGINEERING & QUALITY GATES
**Document ID:** RADIANCE-DOC-OPS-004  
**Workflow File:** `.github/workflows/ci.yml`  

---

## 1. QUALITY GATE PIPELINE

```
Push to branch / Pull Request
        │
        ▼
   [ Checkout ]
        │
        ▼
 [ Setup Node 22 & pnpm ]
        │
        ▼
[ Restore Cache (~/store) ]
        │
        ▼
[ Install (frozen-lockfile) ]
        │
        ▼
[ Dependency Security Audit ]
        │
        ▼
[ Strict Typecheck (tsc) ]
        │
        ▼
[ ESLint Static Analysis ]
        │
        ▼
[ Vitest Suites (439 Tests) ]
        │
        ▼
[ Next.js Production Build ]
        │
        ▼
    CI RESULT (0 = PASS)
```

---

## 2. HARDENING SPECIFICATIONS

1. **Explicit Minimal Permissions:**
   The workflow declares `permissions: contents: read`. No write tokens are granted to actions or build steps.
2. **Concurrency Control:**
   `concurrency: group: ${{ github.workflow }}-${{ github.ref }}, cancel-in-progress: true` automatically aborts obsolete in-flight runs when new commits are pushed, conserving CI minutes and preventing stale race conditions.
3. **Execution Timeout:**
   `timeout-minutes: 20` prevents hung processes from idling indefinitely.
4. **Reproducible Frozen Lockfile:**
   `pnpm install --frozen-lockfile` guarantees that no untracked dependencies or unpinned transitive versions are introduced during CI.
5. **Supply Chain Audit Gate:**
   `pnpm audit --audit-level=critical --registry=https://registry.npmjs.org/` checks for known remote code execution or privilege escalation advisories.
