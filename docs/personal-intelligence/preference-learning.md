# Preference Learning

Radiance currently records only deliberate response-direction choices: concise, detailed, technical, simpler language, more examples, or more practical guidance. The settings interface records these as global preferences. They can be individually removed.

For each preference axis (answer length, complexity, examples, practicality), retrieval selects the latest event no older than 180 days whose scope is global or matches the current chat mode. Up to four signals are sent as a small provider-neutral projection. This is explicit preference adaptation, not machine learning: the application does not mine thumbs-up/down feedback, corrections, or usage patterns and does not estimate confidence or stability.
