# Security and publishing

Report a suspected vulnerability privately to removed@example.invalid. Include the affected URL, reproduction steps and likely impact. Do not put credentials or personal data in a public issue.

This portfolio serves static files. It has no account system, uploads, contact-form API or database. Contact links open email, GitHub or LinkedIn. Local storage contains only rendering/camera/sound/motion preferences and visited chapter identifiers. Client-side files are public; keep credentials out of `src/`, `public/`, environment variables exposed to Vite, and Git history.

## Browser policy

`config/launch.mjs` defines the policy. Production HTML includes a CSP meta fallback. Scripts must come from the same origin; inline script handlers and eval are blocked. Images allow the local assets, canvas data and embedded-model blobs. Fetch allows same-origin assets and blob-backed model textures. Inline style attributes support the joystick and scene controls; inline script execution remains blocked. The no-JavaScript stylesheet is an external file.

The build emits `_headers` for compatible static hosts. `vercel.json` supplies equivalent rules on Vercel. The production preview applies the same response headers for browser checks. These include CSP, MIME-sniffing protection, a referrer policy, feature permissions and HSTS. HTML meta policies cannot implement MIME protection, HSTS, Permissions Policy or CSP frame-ancestors: verify response headers on the actual host after publication. A host that ignores `_headers` needs its own header configuration. The limited ChatGPT framing allowance preserves the Site embed.

Only fingerprinted JavaScript and CSS receive immutable caching rules. Fixed-name model files and images must be revalidated or versioned when replaced.

## Owner actions

- Enable two-factor authentication on GitHub, the hosting account and the domain registrar. Store recovery codes securely.
- Revoke any token pasted into a conversation, terminal transcript or issue. Use the connected GitHub integration or a local credential manager for future pushes.
- Keep the committed package lock; review dependency updates and the audit results.
- Verify the public URL in a signed-out browser before announcing it.
- Treat emulated browser checks as compatibility checks, not measurements of physical phone GPU performance.

## Repository access

Pushing source requires repository Contents write access. Pushing GitHub Actions workflow changes also requires Workflows write access for a fine-grained token. CI uses read-only repository permissions and does not persist checkout credentials. No deployment secret is required to build or test this project.
