# RADIANCE Documentation Hub

Welcome to the **RADIANCE** technical documentation repository. This directory houses comprehensive architectural specifications, developer onboarding guides, feature deep-dives, and operational runbooks.

---

## Documentation Directory Index

```
docs/
├── getting-started/
│   ├── installation.md       # Cloning, pnpm setup, and initial boot
│   └── environment.md        # Environment variable specs & security
│
├── architecture/
│   ├── overview.md           # End-to-end system design & Mermaid topology
│   └── ai-orchestration.md   # Multi-provider routing & streaming pipeline
│
├── features/
│   ├── conversations.md      # Chat lifecycle, editing, feedback & export
│   └── model-selection.md    # Multi-model matrix, pricing & capabilities
│
├── development/
│   ├── local-development.md  # Scripts, tooling, and workflow practices
│   └── testing.md            # Vitest unit suites & Playwright E2E matrix
│
├── operations/
│   ├── OVERVIEW.md           # Operations & production runbook index
│   ├── SENTRY.md             # Sentry error monitoring & performance
│   ├── CI_CD.md              # GitHub Actions quality gates
│   └── TROUBLESHOOTING.md    # Diagnosis & remediation playbooks
│
└── assets/
    ├── radiance-social-preview.png   # 1280x640 OpenGraph card
    └── screenshots/                  # Verified application interface captures
```

---

## Quick Navigation

- **New Contributors:** Start with the [Installation Guide](getting-started/installation.md) and [Environment Setup](getting-started/environment.md).
- **Core Architecture:** Read the [Architecture Overview](architecture/overview.md) and [AI Orchestration Pipeline](architecture/ai-orchestration.md).
- **Testing & Verification:** Review the [Testing Strategy](development/testing.md).
- **Production Operations:** Review the [Operational Runbooks](operations/OVERVIEW.md).
