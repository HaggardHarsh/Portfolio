# Security and publishing

Do not post credentials or personal data in a public issue. This public demo does not publish personal contact information.

This portfolio serves static files through a small header-enforcing Worker on Sites. It has no account system, uploads, contact-form API or database. Contact links open email, GitHub or LinkedIn. Local storage contains only rendering/camera/sound/motion preferences and visited chapter identifiers. Client-side files are public; keep credentials out of `src/`, `public/`, environment variables exposed to Vite, and Git history.

## Browser policy

`config/launch.mjs` defines the policy. Production HTML includes a CSP meta fallback. Scripts must come from the same origin; inline script handlers and eval are blocked. Images allow the local assets, canvas data and embedded-model blobs. Fetch allows same-origin assets and blob-backed model textures. Inline style attributes support the joystick and scene controls; inline script execution remains blocked. The no-JavaScript stylesheet is an external file.

The client build emits `_headers` for compatible static hosts. `vercel.json` supplies equivalent rules on Vercel. Sites did not apply `_headers` on its static response path, so the Sites build now generates a Worker that sets the headers on every response. These include CSP, MIME-sniffing protection, a referrer policy, feature permissions and HSTS. The local Worker preview checks the actual response code, not just an HTML policy fallback. HTML meta policies cannot implement MIME protection, HSTS, Permissions Policy or CSP frame-ancestors: verify response headers on the actual host after publication. The limited ChatGPT framing allowance preserves the Site embed.

The generated Worker contains a fixed asset table. It never reads filesystem paths from user input, executes uploaded code, accepts writes or forwards arbitrary URLs. Unknown paths return 404; methods other than GET/HEAD return 405. ETags enable conditional requests, and only fingerprinted script/style names receive immutable caching. The build checks the compressed artifact size before replacing its output.

Only fingerprinted JavaScript and CSS receive immutable caching rules. Fixed-name model files and images must be revalidated or versioned when replaced.

## Owner actions

- Enable two-factor authentication on GitHub, the hosting account and the domain registrar. Store recovery codes securely.
- Revoke any token pasted into a conversation, terminal transcript or issue. Use the connected GitHub integration or a local credential manager for future pushes.
- Keep the committed package lock; review dependency updates and the audit results.
- Verify the public URL in a signed-out browser before announcing it.
- Treat emulated browser checks as compatibility checks, not measurements of physical phone GPU performance.

## Repository access

Pushing source requires repository Contents write access. Pushing GitHub Actions workflow changes also requires Workflows write access for a fine-grained token. CI uses read-only repository permissions and does not persist checkout credentials. No deployment secret is required to build or test this project.
