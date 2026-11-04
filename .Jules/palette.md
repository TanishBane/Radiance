## 2024-05-16 - Add ARIA label to "Remove attachment" button
**Learning:** Found a missing `aria-label` on an icon-only button ("Remove attachment"). Icon-only buttons need an `aria-label` for screen reader compatibility because `title` is not enough for accessibility purposes.
**Action:** Adding `aria-label="Remove attachment"` to the remove attachment button in `src/components/chat/chat-composer.tsx`.
