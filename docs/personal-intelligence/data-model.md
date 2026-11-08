# Personal Intelligence Data Model

The browser key is `radiance_personal_intelligence_v1`. Its strict Zod version 1 profile contains a random local `profileId`, update timestamp, sharing toggle, up to 100 memories, and up to 200 preference events. Invalid or unreadable data loads as a new disabled profile; writes fail closed when storage is unavailable or quota-limited.

Each memory has an ID, user-authored content (maximum 500 characters), category, importance (1–5), `user-confirmed` confidence, creation/update timestamps, optional expiry, and a source (`manual` or conversation/message references). Temporary category entries expire after 30 days by default. Other notes have no automatic expiry. The “Remember” action is explicit; ordinary chat does not create a memory.

Preference events contain a signal, scope (`global`, `build`, `plan`, or `ask`), timestamp, and optional source message ID. The profile records user intent, not an inferred preference score.

This is a local browser schema, not a database schema. It has no RLS or cross-user guarantees. Anyone using the same browser profile can access its local storage. Export is a JSON download; delete removes the profile storage key. Conversation records are stored independently and are not deleted by profile deletion.
