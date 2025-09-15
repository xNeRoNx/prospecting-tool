# Security Policy

## Supported Versions
This project follows rolling releases. Only the latest deployment from `main` is supported.

| Version | Supported |
|---------|-----------|
| Latest (main) | ✅ |
| Older commits / tags | ❌ |

## Scope
This is a static front‑end (no custom backend). Security issues of interest are limited to:
- Cross-Site Scripting (XSS) or HTML/JS injection via imported JSON / compressed URL data
- Prototype pollution / object injection through crafted payloads
- Denial of Service via extremely large or deeply nested import payloads
- Supply chain risks (malicious npm dependencies)

Out of scope (will be closed without action):
- Missing HTTP security headers (served by hosting platform)
- Rate limiting, auth/session issues (no server-side auth)
- “Open redirect” claims involving only hash fragments
- Automated scanner low-severity noise without practical exploit
- Vulnerabilities only present under `--dev` builds

## Reporting a Vulnerability
Send a private report via Discord DM to: **x_neron_x**

Please include:
1. Short title
2. Affected area (e.g. import URL, crafting import)
3. Steps to reproduce (minimal payload)
4. Impact (what an attacker could achieve)
5. Suggested remediation (optional)
6. Environment (browser + version)

Do **not** open a public issue or PR for unpatched vulnerabilities.

## Responsible Disclosure
- Do not share exploit details publicly before a fix is deployed.
- Avoid data destruction or privacy invasion while demonstrating impact.
- No bug bounty program currently. Attribution can be added (credit) if requested.

## Questions
Unsure if something counts? Ask privately via Discord `x_neron_x`.

Thank you for helping keep the project and its users safe.