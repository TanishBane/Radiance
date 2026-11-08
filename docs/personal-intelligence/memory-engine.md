# Memory Engine

## Current behavior

- Notes are created by direct user entry or the explicit “Remember this message” action.
- Categories are preference, goal, interest, project, knowledge, context, and temporary.
- Duplicate detection uses normalized token-set Jaccard similarity at a threshold of 0.8. It rejects a duplicate instead of silently merging or replacing it.
- The storage boundary rejects credential-like values, common API token formats, PEM private keys, US SSN-shaped values, and Luhn-valid payment card numbers. This is a best-effort filter, not a comprehensive detector.
- Users can inspect, edit, delete, export, or delete the local profile.
- Retrieval is deterministic lexical matching. It excludes expired memories, requires a minimum score, returns at most five memories, and limits their combined source text to 1,800 characters.
- An assistant response stores the selected memory IDs locally for an explanation badge; IDs are not included in the provider payload.

## Not implemented

There is no automatic extraction/classification, contradiction resolution, confidence update, semantic/vector retrieval, or background job. The source text is user-authored and provenance indicates that; confidence is not a model-derived estimate.
