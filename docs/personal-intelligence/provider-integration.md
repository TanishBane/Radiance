# Provider Integration

Personalization is independent of provider selection. The client constructs one bounded provider projection and the existing `/api/chat` route inserts it into the latest user message. The registered model/provider resolution, streaming response, failover, and telemetry paths are unchanged.

The context schema contains only `{category, content}` memory objects and known preference signals. Profile IDs and memory IDs are local metadata only. Empty context is omitted. The prompt boundary uses escaped JSON and labels it untrusted; raw memory text is never appended to the privileged system prompt.

Unit tests validate formatting, delimiter escaping, placement, size, and enum limits. No live provider integration was verified in this implementation; provider keys and deployment credentials were not used.
