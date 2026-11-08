# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js App Router, React, TypeScript, and Tailwind CSS.

## Users

People who want an AI assistant to use context they explicitly choose to retain across later conversations.

## Product Purpose

Radiance provides a chat workspace where people can save notes and response preferences, then use relevant saved context with a selected AI model when sharing is enabled. The homepage should help visitors understand this capability and lead them into the real chat at `/chat`.

## Positioning

Personal Intelligence is explicit and user-controlled: people save, edit, export, or delete notes and choose whether retrieved notes and preference labels may be sent to the selected provider. Radiance does not automatically infer memories from conversations. Retrieval today uses bounded lexical matching.

## Operating Context

People set up Personal Intelligence in Settings and chat with a registered model. Notes and preferences are managed on the current browser profile; context can be attached to a later request only when sharing is enabled.

## Capabilities and Constraints

- Notes are saved explicitly and can be edited, searched, exported, or deleted.
- Each note is limited to 500 characters; retrieval can attach up to five relevant notes and a small number of preference labels.
- Sharing retrieved context with the selected AI provider is opt-in.
- Current profile storage is plaintext browser storage. It is not account-isolated, synchronized, or end-to-end encrypted; other people using the same browser profile can read it.
- Do not claim automatic memory extraction, semantic retrieval, cross-device sync, encrypted vaults, or zero exposure as present features.
- Preserve the actual `/chat` route and working model selector.

## Brand Commitments

Radiance is the product name. The current project guidance commits the product to a dark violet identity, editorial serif headings, and concise, honest language. The Radiance mark is an existing asset. Homepage redesign may change its composition and presentation while preserving these brand cues.

## Evidence on Hand

The repository contains the live chat route, Settings-based Personal Intelligence, privacy disclosures, current feature descriptions, and an explicitly labeled demonstration preview. No verified testimonials, customer counts, benchmark claims, or case studies are supplied; do not invent them.

## Product Principles

- People decide what is retained.
- Explain present behavior separately from future direction.
- Make provider sharing understandable and opt-in.
- Keep the path from homepage to chat real and direct.

## Accessibility & Inclusion

Responsive web. Preserve semantic navigation, keyboard access, visible focus, readable contrast, and reduced-motion support. Keep important information available without animation.
