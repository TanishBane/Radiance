# Skills Audit

## Project-local skills installed

The official Skills CLI was run with telemetry disabled and pinned to `skills@1.7.6`; the resulting project copies and lock metadata are in `.agents/skills/` and `skills-lock.json`.

| Skill | Source repository | Audit status |
|---|---|---|
| `supabase` | `supabase/agent-skills` | Source and skill contents reviewed; MIT-licensed upstream. Used to inspect the existing Supabase boundary. |
| `supabase-postgres-best-practices` | `supabase/agent-skills` | Source and skill contents reviewed; MIT-licensed upstream. No database change was justified. |
| `vercel-react-best-practices` | `vercel-labs/agent-skills` | Source and skill contents reviewed; MIT-licensed upstream. Used while preserving React request/render boundaries. |
| `vercel-composition-patterns` | `vercel-labs/agent-skills` | Source and skill contents reviewed; MIT-licensed upstream. Used to keep the feature in a focused component. |

Existing user-level skills consulted included AI systems engineering, backend reliability, security best practices, security threat modeling, React patterns, UX/product craft, inclusive responsive web, plan writing, TDD, verification, Supabase, and Postgres best practices. The repository instructions also require frontend-design, ui-ux-pro-max, and design-system for substantial UI work.

The skills ecosystem search for AI memory/retrieval personalization did not identify a relevant memory-specific skill; no unrelated package was installed. No Supabase, database, or GitHub connector was available for live service verification. Skills are instructions, not proof that security or system behavior has been externally audited.
