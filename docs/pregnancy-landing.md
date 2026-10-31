# Public pregnancy landing page

`/pregnancy` serves the existing Hebrew RTL landing page as a standalone HTML document through a Next.js route handler. It intentionally does not mount the authenticated AppShell, Supabase session/data providers, analytics or the app's React layouts. No changes to the existing application routes, account access or Vercel deployment protection are required. Use ordinary `<a href="/pregnancy">` links when linking to this document from React pages.

The brand name (`BRAND`, now קן) and page markup are in `src/lib/pregnancy-landing.mjs`. The look follows the app's Claude Design redesign (Heebo, warm grey canvas, purple accent, photo hero with glass cards). Its static assets (self-hosted Heebo subsets under the SIL Open Font License, and the hero photo) live in `public/landing/`, so the page still loads nothing from third parties. Copy is gender-neutral (infinitives, nouns, "אפשר…") and addresses whoever manages the pregnancy, alone or with someone they choose. Demo data is fictional and all features are described as planned. The waitlist endpoint is `/api/pregnancy-waitlist`, separate from the application's medical records. No dependency or database migration is added.

## Waitlist configuration

Collection is disabled until these server-only environment variables are configured:

- `PREGNANCY_OPERATOR_NAME`: actual list operator.
- `PREGNANCY_CONTACT_EMAIL`: monitored address for removal and privacy requests.
- `PREGNANCY_WAITLIST_WEBHOOK_URL`: HTTPS endpoint that persists a subscription before returning 2xx.
- `PREGNANCY_WAITLIST_WEBHOOK_TOKEN`: optional Bearer secret for the endpoint.

Set them separately in the intended Vercel environment. Do not expose them as NEXT_PUBLIC variables or commit secrets. Before enabling collection, complete the privacy copy with the actual provider and retention arrangements, and configure unsubscribe handling, deduplication and rate limits at the provider. Double opt-in is recommended. The app does not send mail or store subscriptions itself.

Only email, consent, consent text/version and submission time are forwarded. Missing consent, unexpected fields, cross-origin submissions and the honeypot are rejected. Upstream failure never produces success. The preview requires no environment variables and collects no emails.

Vercel deployment protection still applies to the entire deployment. Making the landing page accessible to visitors through the hosting layer is a separate decision; this change does not weaken that protection.
