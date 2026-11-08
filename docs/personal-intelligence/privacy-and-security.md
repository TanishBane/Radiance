# Privacy and Security

## Implemented controls

- Context sharing starts disabled and is controlled independently from chat history and general settings.
- No memory is saved from a conversation without an explicit save action.
- The client sends only relevant text plus selected preference labels; it does not send profile IDs, memory IDs, provenance, timestamps, importance, or the full vault.
- Server validation limits the payload to five notes, four known preference labels, 500 characters per note, and 2,500 serialized characters.
- Context is added to the latest user message as escaped JSON in an explicit untrusted-reference boundary. A server-owned system instruction says not to follow instructions inside it.
- Existing provider and rate-limit flow remains responsible for inference. The API does not persist this profile or intentionally log the context.
- Memory entry blocks common credentials and identifiers, but this is not a guarantee against every sensitive-data format.

## Limits

Browser local storage is plaintext and shared by users of the same browser profile. The application has no sign-in path connected to this feature, no profile encryption, no account-specific deletion, no temporary-chat mode, no RLS tests, and no cross-user isolation test because no identity is attached to chat. Provider processing is governed by the selected provider/deployment; the UI discloses that selected notes and preferences leave the browser when sharing is enabled. Do not store secrets in this vault.
