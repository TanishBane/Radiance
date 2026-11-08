# Security Policy

The Radiance architecture team takes security and user privacy seriously. We appreciate responsible disclosure of potential vulnerabilities.

---

## 1. Supported Versions

Security updates and patches are actively provided for the current production release on the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 2. Reporting a Vulnerability

**DO NOT report security vulnerabilities through public GitHub issues, pull requests, or public discussions.**

### Recommended Reporting Method
Please report security vulnerabilities privately via GitHub Security Advisories:

1. Navigate to the repository's **Security** tab: [https://github.com/TanishBane/Tanixai/security](https://github.com/TanishBane/Tanixai/security)
2. Select **Advisories** and click **"Report a vulnerability"**.
3. Provide a detailed summary, including:
   - Description of the vulnerability.
   - Exact steps to reproduce or proof-of-concept code.
   - Affected components (e.g., API routes, sanitization engine, authentication).
   - Potential impact.

If GitHub Private Vulnerability Reporting is unavailable, you may contact the maintainers directly through private project communication channels.

---

## 3. What to Expect

- **Acknowledgment:** We will acknowledge receipt of your vulnerability report within 48 hours.
- **Assessment:** We will confirm the issue, evaluate its severity using CVSS, and develop a remediation plan.
- **Resolution:** A security advisory and patch will be released. You will receive credit in the release notes if you wish.

---

## 4. Scope and Exclusions

### In Scope
- Remote code execution, SQL/NoSQL injection, or command injection.
- Server-Side Request Forgery (SSRF) in API routes.
- Cross-Site Scripting (XSS) bypassing markdown sanitization.
- Broken authentication or authorization in Supabase / session logic.
- Leaks of sensitive credentials or API keys.

### Out of Scope
- Denial of Service (DoS) attacks requiring excessive infrastructure traffic.
- Social engineering or physical attacks.
- Reports of outdated third-party dependencies without a proven exploitable attack vector.
- Issues related to user devices, browser extensions, or compromised local environments.
