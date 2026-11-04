# Connect portfolio.example

Sites has registered `portfolio.example` for this portfolio. Registration alone does not change DNS. The domain becomes live after DNS ownership validation and certificate issuance complete.

## Namify / .tech dashboard

Sign in to the account used at https://namify.get.tech. Open **Your domains → portfolio.example → Manage → DNS → DNS Records**. The .tech control-panel link is https://manage.get.tech if your account uses the legacy panel.

Official instructions: [DNS records](https://helpdesk.namify.tech/en/articles/10353226-how-to-add-edit-or-delete-dns-records), [A records](https://helpdesk.namify.tech/en/articles/10353230-how-to-add-edit-and-delete-an-a-record), [TXT records](https://helpdesk.namify.tech/en/articles/10353328-how-to-add-edit-and-delete-a-txt-record).

The current authoritative nameservers are the `tech-domains.*.orderbox-dns.com` set. The domain already uses the registrar's DNS; manage its records there.

Add the exact records returned by Sites on 2026-11-04:

| Type | Host in Namify | Value |
| --- | --- | --- |
| A | Leave blank (root / @) | 162.159.143.30 |
| A | Leave blank (root / @) | 172.66.3.26 |
| TXT | _openai-site-verification | verification-value-removed |
| TXT | _cf-custom-hostname | verification-value-removed |

Use Auto TTL. These verification TXT values are public DNS records, not account credentials. Replace conflicting website A/AAAA records for the root only; retain email/MX records and unrelated service records. Do not add a CNAME at the root alongside these A records.

The custom domain is pending until public DNS shows the records and Sites confirms both routing and SSL. Check the exact records rather than relying on a fixed propagation timer. Refresh the existing custom-domain registration; do not repeatedly add it. The native domain ID is `appgdom_6aeae3bc10988191a25d01a7bff38fc0`.

The build's canonical URL, social image URLs, robots file and sitemap use `https://portfolio.example`. `SITE_URL` can override that origin for another deployment. The existing Site URL remains https://portfolio.example while DNS is being configured.
