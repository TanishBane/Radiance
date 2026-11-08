# Privacy and conversion landing finish

- Clarified the current privacy posture without expanding product claims: explicit saves and opt-in provider sharing, plaintext browser storage without account isolation/sync/end-to-end encryption, and a direct `/privacy` link.
- Refined the FAQ into a keyboard-native disclosure list, preserving factual MVP limits and existing single-open behavior.
- Added a focused conversion ending linking to the real `/chat` route and a responsive footer with chat/privacy navigation.
- Styling is isolated in `landing-conversion.css`, namespaced under `.landing-root`, responsive, and reduced-motion aware. No provider or storage behavior changed.
- Verification: focused landing tests (4 passed), typecheck passed, full suite passed (39 files, 488 tests).
