# RADIANCE — MCP INVENTORY & TOOL ORCHESTRATION LOG

**Document Version:** 1.0.0  
**Phase 0 Date:** 2026-11-01  
**Project:** RADIANCE Platform Transformation  

---

## 1. AVAILABLE MCP SERVERS

| Server Name | Available Tools | Primary Capability | Access Type | Intended Transformation Use |
|---|---|---|---|---|
| **xerj** | `xerj_def`, `xerj_batch_search`, `xerj_search`, `xerj_semantic_search`, `xerj_vector_search`, `xerj_hybrid_search`, `xerj_memory_store`, `xerj_memory_recall`, `xerj_code_search`, `xerj_plan` | AST-aware code navigation, semantic search & codebase index | Local Lazy MCP | Rapid symbol lookup and architectural tracing across new modules. |
| **StitchMCP** | `create_project`, `get_project`, `delete_project`, `list_projects`, `list_screens`, `get_screen`, `download_file`, `generate_screen_from_text`, `edit_screens`, `create_design_system` | Design generation, design system generation and screen management | Remote Lazy MCP | Available for UI design system extraction and screen inspection when relevant. |

---

## 2. NATIVE / WORKSPACE TOOL CAPABILITIES

| Tool | Capability | Access Boundary | Usage Guidelines |
|---|---|---|---|
| `run_command` | PowerShell execution on Windows | Local Workspace (`c:\Tanixai-main`) | Non-destructive builds, typechecks, linter executions, package installs. Verify exit code 0. |
| `read_file` / `write_file` / `edit_file` | Filesystem IO | Local Workspace & AppData | Atomic updates, zero silent corruptions, strict formatting preservation. |
| `search_web` | Web search | Public Internet | Official documentation retrieval, latest package version verification, deprecation tracking. |

---

## 3. MCP BOUNDARY POLICIES

1. **Secret Redaction:** No API key, token, or connection string may ever be emitted into MCP arguments or persistent documentation.
2. **Production DB Isolation:** No remote destructive migrations or remote database alters will be attempted without confirmed credentials and explicit direction.
3. **Evidence Validation:** Every tool call output must be inspected; no tool execution is assumed to succeed without reviewing its returned status code.
