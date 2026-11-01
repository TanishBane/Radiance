Implement production-grade enhancements to chat message presentation, interactive message actions, and streaming experience for the Radiance AI platform in Next.js 15.

Integrity mode: development

## Requirements

### R1. Message Presentation & Typography
Improve user and assistant message presentation in the Radiance chat workspace:
- Establish distinct visual separation between user and assistant messages with consistent message container widths across viewport sizes.
- Improve typography and spacing for paragraphs, headings (hierarchical scale), ordered and unordered lists, tables, blockquotes, links, and inline code.
- Improve code blocks: add language labels, syntax highlighting, copy-code buttons with user feedback, and horizontal scrolling for wide code blocks.
- Improve mathematical notation rendering for standard LaTeX/KaTeX expressions where supported or safely integrated.
- Ensure secure Markdown rendering: untrusted AI-generated HTML or scripts must never execute.

### R2. Message Actions & Interactions
Implement message actions that appear on hover for desktop and through an accessible action menu on mobile:
- Actions: Copy, Regenerate, Edit user message, Delete, Provide feedback, Retry failed generation, and View timestamp.
- Safe client-side export: implement safe export (e.g. copy formatted text or markdown download); omit unsafe external link sharing.
- Connect actions to the existing chat session and stream hooks (`use-chat-session`, `use-chat-stream`) and local workspace state.

### R3. Streaming Experience & Lifecycle Management
Provide a robust streaming experience:
- Smooth token streaming with no artificial typewriter delay after receiving the response.
- Clear generation indicator during active inference.
- Stop-generation button with proper cancellation that immediately halts streaming and cancels the underlying request.
- Streaming Markdown rendering that updates progressively without layout jumps or unformatted syntax flash.
- Clear error states with retry capability.
- Prevent duplicate messages.

## Verification Resources
- Project type checking: `npm run typecheck`
- Project linter: `npm run lint`
- Vitest test suite: `npm test`
- Playwright E2E test suite: `npm run test:e2e`
- Primary chat files:
  - `src/components/chat/message-item.tsx`
  - `src/features/chat/components/chat-workspace.tsx`
  - `src/features/chat/hooks/use-chat-stream.ts`
  - `src/features/chat/hooks/use-chat-session.ts`
  - `src/components/chat/chat-composer.tsx`
  - `src/lib/types/chat.ts`

## Acceptance Criteria

### Message Presentation
- [ ] User and assistant messages have distinct styling and maintain consistent message container widths across mobile and desktop viewports.
- [ ] Markdown elements (headings, paragraphs, lists, tables, blockquotes, links, inline code) render with consistent hierarchy, proportional spacing, and clean styling.
- [ ] Code blocks render syntax highlighting, display a language label, provide a functional copy button with feedback, and enable horizontal scrolling without clipping.
- [ ] Standard mathematical notation renders properly without raw unparsed syntax.
- [ ] AI-generated HTML and script tags are sanitized and prevented from executing in the DOM.

### Message Actions
- [ ] Message actions are visible on hover on desktop and accessible via an action menu on mobile viewports.
- [ ] Copy action writes message text to clipboard with user confirmation.
- [ ] Edit user message action allows editing and resubmitting with updated prompt.
- [ ] Regenerate and Retry failed generation re-trigger assistant generation using the stream hooks.
- [ ] Delete action removes the message from the session state.
- [ ] Provide feedback records sentiment/rating in session state.
- [ ] Message timestamp is accessible and clearly formatted.
- [ ] Client-side export exports or copies message content safely without external link sharing vulnerabilities.

### Streaming Experience
- [ ] Tokens stream smoothly and render progressively in Markdown without post-stream typewriter delay.
- [ ] Active generation displays a visible indicator; clicking the stop button immediately halts streaming and cancels the request.
- [ ] Stream or network errors display a clear error state UI with retry capability.
- [ ] Duplicate message submission and duplicate rendering are prevented.

### Quality & Verification
- [ ] `npm run typecheck` passes with zero errors.
- [ ] `npm run lint` passes with zero errors.
- [ ] `npm test` passes with newly added or updated Vitest tests covering message actions, state updates, and stream cancellation.
- [ ] `npm run test:e2e` passes with Playwright tests validating message rendering, desktop/mobile action menus, and streaming behavior.
