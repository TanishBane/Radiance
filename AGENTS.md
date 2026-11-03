# Radiance contributor guidance

- Keep the Next.js App Router, React, TypeScript, Tailwind, AI provider registry, and Supabase boundaries intact. UI work belongs in `src/app`, `src/components`, and `src/features` unless existing ownership requires otherwise.
- Preserve Radiance's dark violet identity, editorial serif headings, and current interaction patterns. Use the semantic CSS variables in `src/app/globals.css`; keep motion brief, purposeful, and reduced-motion aware.
- Use native semantic controls and the existing Radix and Motion packages. Do not add dependencies or invent account, model, upload, or provider behavior.
- Preserve user data and existing local changes. Do not change database schemas or AI provider behavior for presentation work. Never commit, push, merge, or deploy unless asked.
- Useful commands: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, and `pnpm build`.
- Keep changes focused. Record meaningful UI decisions and verification evidence in `.antigravity/` without overwriting existing project history.
