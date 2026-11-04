# Domain setup

Configure the deployment's domain through its hosting dashboard. Add the current A/CNAME and verification TXT records at the registrar's DNS settings, using the exact values returned by the hosting service.

Account-specific hostnames, verification values and registration IDs are intentionally omitted from this public repository. Keep deployment configuration in ignored local environment files or hosting settings. `.env.example` documents the public-origin field without identifying an owner.

After DNS and TLS verification, set the build-time `SITE_URL` to the HTTPS origin and rebuild. Never publish registrar credentials, API keys or account recovery information.
