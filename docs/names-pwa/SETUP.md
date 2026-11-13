# Name swiper PWA: accounts, settings and secrets (owner runbook)

Everything the autonomous build ([`tasks/prd-names-pwa.md`](../../tasks/prd-names-pwa.md)) needs from outside the repo. Kiril does these steps, or a desktop agent does them on Kiril's computer while he watches. Nothing here is done by Ralph.

Work top to bottom. Each step ends with **Done when**, so it's easy to check. Steps marked **before the run** block the Ralph run; steps marked **before public launch** can wait until after the run.

Fixed values used below:

| What | Value |
|---|---|
| Supabase project | "Nest (EU)", ref `hkoumskvmkqqnwhnizbq`, region eu-central-1 (Frankfurt) |
| Supabase URL | `https://hkoumskvmkqqnwhnizbq.supabase.co` |
| Supabase auth callback (for Google) | `https://hkoumskvmkqqnwhnizbq.supabase.co/auth/v1/callback` |
| Site | `https://nestjourney.app` (Vercel project `ken`, deploys from `main`) |
| PWA | `https://nestjourney.app/names` |
| Sender address | `no-reply@nestjourney.app`, sender name `Nest` |

Never paste a secret into a chat, a GitHub issue, a commit or a doc. Secrets go only into the Supabase dashboard, the Vercel dashboard, a password manager, and the two gitignored files in step 10.

---

## 1. Merge the old-app removal (before the run)

1. Review and merge [ken PR #5](https://github.com/kirilreznik/ken/pull/5) ("Remove the old Ken PWA; keep only the landing page").
2. Merge the PR that adds this runbook and the PRD.

**Done when:** `main` in `kirilreznik/ken` has no `src/app/login`, and has `tasks/prd-names-pwa.md`.

## 2. Apply migration 0009 to the EU project (before the run)

The migration is `supabase/migrations/0009_names_pwa.sql` in `kirilreznik/pregnancy-manager` (makes a space's due date optional, adds `spaces.origin` and the RPCs `names_space`, `names_invite`, `names_join`, `prepare_account_deletion`). 0001–0008 are already on the EU project.

1. Merge the pregnancy-manager PR that adds `0009_names_pwa.sql` and `supabase/tests/names_pwa.sql`.
2. Apply it to `hkoumskvmkqqnwhnizbq` only (never the old Mumbai project): Supabase dashboard → SQL Editor → paste the file → Run. Or ask Claude to apply it with the Supabase connector, which records it in the migration history as `names_pwa`.
3. Check: SQL Editor → `select proname from pg_proc where proname like 'names_%';` returns `names_space`, `names_invite`, `names_join`.

**Done when:** the three functions exist and `select is_nullable from information_schema.columns where table_name='spaces' and column_name='due_date';` returns `YES`.

**Nest app follow-up (not part of this run):** the app must treat a space with no due date as "needs the due date" and ask for it before week-based screens. Track it in the app repo.

## 3. Supabase auth settings (before the run)

Dashboard → project "Nest (EU)" → **Authentication**.

### 3.1 URL configuration
Authentication → URL Configuration:
- **Site URL:** `https://nestjourney.app/names`
- **Redirect URLs** (add each):
  - `https://nestjourney.app/names/**`
  - `http://localhost:3000/names/**`
  - The Vercel preview pattern for project `ken`: `https://ken-*-<your-vercel-team-slug>.vercel.app/names/**` (copy the team slug from any preview URL)
  - Keep `ken://auth-callback` if the Nest app's step added it.

### 3.2 Email sign-in with a code
1. Authentication → Sign In / Providers → **Email**: enabled. "Confirm email": on. **Email OTP length: 6**. Email OTP expiration: 600 seconds (10 minutes).
2. **Do this after step 7:** Supabase locks template editing until custom SMTP is on. Authentication → Emails → Templates. A sign-in code is sent through two templates: **Confirm signup** (a new address) and **Magic Link** (an existing one). Replace the body of both with a Hebrew, right-to-left code email that shows `{{ .Token }}` and no link. Suggested subject: `קוד הכניסה שלך ל־Nest`. Suggested body:

```html
<div dir="rtl" lang="he" style="font-family:Arial,sans-serif;color:#1F1B1E;font-size:16px;line-height:1.5">
  <p>זה קוד הכניסה שלך לבחירת שם ב־Nest:</p>
  <p style="font-size:32px;font-weight:700;letter-spacing:6px;direction:ltr;text-align:right">{{ .Token }}</p>
  <p>הקוד תקף ל־10 דקות. אם לא ביקשת קוד, אפשר להתעלם מההודעה.</p>
  <p style="color:#6E655F;font-size:13px">Nest · nestjourney.app</p>
</div>
```

The swiper is **code only** (owner, 2026-11-04). The Nest app's password sign-up also uses **Confirm signup** and needs a link back to the app, so Confirm signup branches on the redirect: `{{ if or (eq .RedirectTo "ken://auth-callback") (eq .RedirectTo "pregnancymanager://auth-callback") }}` the app's confirmation link (`{{ .ConfirmationURL }}`) `{{ else }}` the Hebrew code-only body above `{{ end }}`. Match the redirect the app actually sends (`emailRedirectTo` in pregnancy-manager `src/`). Magic Link is code-only.

**Done when:** a swiper code email (Confirm signup and Magic Link) shows only the code; a Nest app sign-up still gets its confirmation link.

Note: the sign-up gate (3.3) applies to the Nest app too, since both use the same project.

### 3.3 Sign-ups: invite links only (2026-11-13)
Owner decision 2026-11-13: anyone who arrives through an in-app invite link (`/names/join/{code}`) may create an account; everyone else still gets the "not open yet" message. The gate is a Supabase **Before User Created** hook from pregnancy-manager migration `0012_names_invite_signups.sql` (email sign-in carries the code in user metadata; Google sign-in gets an IP pass first, valid an hour, from `names_signup_pass`). The invite must still be unused and unexpired. Setup, in this order:

1. Apply `0012_names_invite_signups.sql` to the EU project (SQL editor; never `supabase db push`).
2. Authentication → Hooks → **Before User Created** → Postgres → schema `public`, function `names_before_user_created` → enable.
3. Authentication → Sign In / Providers → turn **on** "Allow new users to sign up". (Doing this before step 2 opens sign-ups to everyone.)

Same project as the Nest app, so the hook gates its sign-ups too. To let one person in without a link: `insert into public.names_signup_allowlist (email) values ('their@email');`. Accounts made with the admin API pass when created with `app_metadata: { names_allow: true }` (or allowlist the address first). To close everything again, turn the switch in step 3 off. At public launch: disable the hook (step 2), keep the switch on.

### 3.3.1 Guest mode needs open sign-ups (2026-11-13)
Owner decision 2026-11-13: visitors swipe up to 100 names as guests, then must sign in, and anyone may create an account at that point. Open sign-ups by **disabling the Before User Created hook** (Authentication → Hooks); keep "Allow new users to sign up" on. Invite links keep working. While the hook is still on, a guest without an invite who reaches the wall gets the "not open yet" message.

### 3.4 Rate limits
Authentication → Rate Limits, after step 7 (custom SMTP) is in place:
- Emails sent per hour: 100
- Minimum interval between emails (per user): 30 seconds
- Token verifications: keep the default

## 4. Google sign-in (before the run)

You need a Google account that will own the project (Kiril's).

1. Open https://console.cloud.google.com and select the existing **Nest** project (`nest-4c83e`, also the Nest app's Firebase project; owner chose to reuse it on 2026-11-04). Adding a consent screen and a Web client doesn't affect Firebase.
2. Menu → **Google Auth Platform** (older consoles: APIs & Services → OAuth consent screen) → **Get started**:
   - App name: `Nest Journey`. Google rejects `Nest` (it matches its own Google Nest brand), checked 2026-11-04.
   - User support email: Kiril's address
   - Audience: **External**
   - Contact email: Kiril's address
   - Agree to the policy → Create
3. **Branding:**
   - App domain → Home page: `https://nestjourney.app`, Privacy policy: `https://nestjourney.app/names/privacy`, Terms of service: `https://nestjourney.app/names/terms`
   - Authorized domains: `nestjourney.app`
   - Logo: leave empty for now. Adding a logo sends the app to Google's brand verification (days); do it after launch with `brand/nest/png/icon-512.png`.
4. **Data access:** add only `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`. These are non-sensitive, so no Google review is needed.
5. **Audience:** **Publish app** (status "In production"). In "Testing" only listed test users can sign in.
6. **Clients → Create client:**
   - Application type: **Web application**
   - Name: `Nest names PWA`
   - Authorized JavaScript origins: `https://nestjourney.app`, `http://localhost:3000`
   - Authorized redirect URIs: `https://hkoumskvmkqqnwhnizbq.supabase.co/auth/v1/callback`
   - Create. Copy the **Client ID** and **Client secret** into the password manager.
7. Supabase → Authentication → Sign In / Providers → **Google**: enable, paste Client ID and Client secret, leave "Skip nonce checks" off, Save.

Known limit: Google's consent screen says "to continue to hkoumskvmkqqnwhnizbq.supabase.co". Showing `nestjourney.app` there needs a Supabase custom domain (paid add-on). Not needed for launch.

**Done when:** on any page, `supabase.auth.signInWithOAuth({ provider: 'google' })` lands on Google's account chooser for "Nest Journey", and after choosing an account it returns to `/names/auth/callback`. (Ralph checks the redirect; the full round trip is the owner check in step 13.)

## 5. SMS codes: postponed (next phase)

Owner decision 2026-11-04: SMS sign-in (Twilio Verify) is **not** part of this run. Leave Supabase's Phone provider off. Ralph's QA users sign in with admin-generated email codes instead (step 10). When the next phase adds SMS: create a Twilio account (paid upgrade), a Verify service (SMS only, 6 digits, Fraud Guard on, Geo permissions Israel only), paste Account SID, Auth Token and Verify Service SID into Supabase → Sign In / Providers → Phone, add test numbers, and set Cloudflare Turnstile (step 11) before opening it to the public.

## 6. Resend for email codes (before the run)

1. Sign up at https://resend.com with Kiril's email.
2. **Domains → Add domain:** `nestjourney.app`. Region: **EU (Ireland, eu-west-1)**, to keep email data in the EU like the database.
3. Resend shows DNS records. As of 2026-11-04 they are a DKIM TXT on `resend._domainkey`, a CNAME `send` → `send.forge.rmta.net` and a CNAME `rsend` → `rsend-euw1.forge.rmta.net` (older accounts got an MX plus an SPF TXT on `send`; add whatever Resend shows). Skip the optional receiving record, since the swiper only sends. Turn open and click tracking off. The DNS for `nestjourney.app` is at **GoDaddy** (nameservers `ns45/ns46.domaincontrol.com`, checked 2026-11-04; the site reaches Vercel through an A record), so add them in GoDaddy → My Products → `nestjourney.app` → DNS. Don't touch the existing A record. The root domain already has Google Workspace MX/SPF and a DMARC record (`p=quarantine`, checked 2026-11-04): **don't add a second `_dmarc` record** and don't touch the root MX/SPF. Resend's records live only on `send`, `rsend` and `resend._domainkey`, and its DKIM signature on `nestjourney.app` passes the existing DMARC.
4. Wait for Resend to show the domain as **Verified** (minutes to a few hours).
5. **API Keys → Create API key:** name `supabase-auth-smtp`, permission **Sending access**, domain `nestjourney.app`. Copy it once into the password manager.

**Done when:** the domain shows Verified in Resend.

(SendGrid works too: create an account, authenticate the domain, create an API key with Mail Send, and use host `smtp.sendgrid.net`, port 465, username `apikey` in step 7. Resend is recommended because it's simpler and has an EU region.)

## 7. Supabase custom SMTP (before the run)

Supabase → Authentication → Emails → **SMTP Settings** → Enable custom SMTP:
- Sender email: `no-reply@nestjourney.app`
- Sender name: `Nest`
- Host: `smtp.resend.com`
- Port: `465`
- Username: `resend`
- Password: the Resend API key from step 6

Then do step 3.4 (rate limits). Turning custom SMTP on resets the email limit to 30 per hour, so step 3.4 is needed.

**Done when:** a code sent from the Supabase dashboard (Authentication → Users → Add user → Send magic link, to Kiril's own address) arrives from `no-reply@nestjourney.app` with the Hebrew template and a 6-digit code.

## 8. Supabase keys (before the run)

Supabase → Project Settings → **API Keys**:
- **Publishable key** (`sb_publishable_…`): safe in the browser. Used as `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Secret key** (`sb_secret_…`): full admin access. Create one named `ken_server` (Supabase allows only letters, digits and underscores). Server and local QA only, never in the browser or a `NEXT_PUBLIC_` variable. Used as `SUPABASE_SERVICE_ROLE_KEY`.

## 9. Vercel environment variables (before the run)

Vercel → project `ken` → Settings → Environment Variables. As of 2026-11-04 the project still has `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` pointing at the old Mumbai project (`nxskkpcjyqjtgccnemgu`); **edit** those two to the EU values (after ken PR #5 is merged, since the old app on `main` still reads them), and add the rest. Add or edit each for **Production** and **Preview** (Development is not used; local runs read `.env.local`):

| Name | Value | Sensitive |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://hkoumskvmkqqnwhnizbq.supabase.co` | no |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable key | no |
| `SUPABASE_SERVICE_ROLE_KEY` | the `ken_server` secret key | **yes** (mark Sensitive) |
| `NEXT_PUBLIC_SITE_URL` | Production: `https://nestjourney.app`. Preview: leave unset (the code falls back to the request origin) | no |
| `PREGNANCY_OPERATOR_NAME` | **new** (not in Vercel yet as of 2026-11-04): the legal name of whoever runs the service (Kiril, as an individual) | no |
| `PREGNANCY_CONTACT_EMAIL` | **new**: the monitored address for privacy and deletion requests | no |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | leave unset until step 11 | no |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Production only: the Clarity project id (see [ANALYTICS.md](ANALYTICS.md)); leave unset elsewhere | no |

Google and Resend secrets are **not** Vercel variables. They live only in the Supabase dashboard.

**Done when:** the five variables are set in Production and Preview, and a redeploy of `main` succeeds.

## 10. Kiril's Mac: local files and tools (before the run)

In the `ken` checkout on the Mac:

1. Tools: Node 22 or newer (`node -v`), `jq` (`brew install jq`), the Claude Code CLI signed in (`claude --version`), git with push access to `kirilreznik/ken`.
2. `npm ci` (not `npm install`: npm 11 on the Mac drops the Linux esbuild entries from `package-lock.json`, which Vercel needs), then `npx playwright install chromium` (Ralph's browser checks; US-002 adds Playwright as a dev dependency if it isn't there yet).
3. Create `.env.local` (gitignored by `.env*`):

```
NEXT_PUBLIC_SUPABASE_URL=https://hkoumskvmkqqnwhnizbq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
SUPABASE_SERVICE_ROLE_KEY=<ken_server secret key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PREGNANCY_OPERATOR_NAME=<same as Vercel>
PREGNANCY_CONTACT_EMAIL=<same as Vercel>
```

4. Create `scripts/ralph/.env.test.local` (gitignored):

```
NAMES_QA_SUPABASE_URL=https://hkoumskvmkqqnwhnizbq.supabase.co
NAMES_QA_ANON_KEY=<publishable key>
NAMES_QA_SERVICE_ROLE_KEY=<ken_server secret key>
NAMES_QA_EMAIL_1=delivered+names-qa-1@resend.dev
NAMES_QA_EMAIL_2=delivered+names-qa-2@resend.dev
NAMES_QA_EMAIL_3=delivered+names-qa-3@resend.dev
```

These are Resend test addresses: mail to them is accepted and never delivered, so a sign-in screen test never bounces or reaches a real person. Ralph never reads an inbox: it gets each code from the Supabase admin API (`generate_link`, which returns the 6-digit `email_otp` without sending mail) using the secret key.

5. Create the three QA users (Supabase → Authentication → Users → Add user → Create new user, one per address above, **Auto Confirm User** on, no password needed), or let US-000 create them with the admin API. They work while sign-ups are off; with the invite-only hook on (3.3), allowlist their addresses first or create them with `app_metadata: { names_allow: true }`.

**Done when:** `npm run dev` serves `http://localhost:3000` and `scripts/ralph/.env.test.local` exists.

## 11. Bot protection with Cloudflare Turnstile (before public launch)

Code emails can be abused by bots (and SMS codes, once added, cost money per send), so the public sign-in needs a CAPTCHA. Do this **after** the Ralph run (with CAPTCHA on, Ralph's scripted sign-ins can't get a token).

1. Sign up at https://dash.cloudflare.com (free) → **Turnstile → Add widget**: name `Nest names`, hostnames `nestjourney.app` and `localhost`, mode **Managed**. Copy the site key and the secret key.
2. Supabase → Authentication → **Attack Protection** → Enable CAPTCHA protection → provider Turnstile → paste the **secret** key → Save.
3. Vercel → `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = the **site** key (Production and Preview) → redeploy.

The PWA already renders the widget and sends `captchaToken` when that variable is set (story US-024).

**Done when:** the sign-in screens show the Turnstile check and a code still arrives.

## 12. Privacy policy and terms (before public launch)

Ralph writes Hebrew drafts at `/names/privacy` and `/names/terms`, marked "טיוטה" at the top, from facts in the PRD (what's stored, where, for how long, who processes it: Supabase in Frankfurt, Vercel, Resend, Google, Cloudflare). Before turning on sign-ups (step 3.3):

1. Fill the operator name and contact email (step 9). Set 2026-11-04 to "Kiril Reznik" and `privacy@nestjourney.app`. **Create `privacy@nestjourney.app` as a Google Workspace alias (or group) for Kiril's mailbox before launch**, and send it a test email: the address is public on both pages.
2. A privacy lawyer reviews both pages once (decided 2026-10-30).
3. Replace the text in `src/content/names-legal/` (see the PRD) and remove the "טיוטה" banner by setting `LEGAL_DRAFT = false` there.
4. Translate the 4 email templates that are still Supabase's English defaults (Authentication → Emails: **Invite user**, **Change email address**, **Reset password**, **Reauthentication**) into short Hebrew in the same Nest style as the code email, keeping their `{{ .ConfirmationURL }}` / `{{ .Token }}` variables. The swiper and the Nest app don't send them today, but nothing in English should go out after launch.
5. Set `PREGNANCY_WAITLIST_WEBHOOK_URL` and `PREGNANCY_WAITLIST_WEBHOOK_TOKEN` in Vercel (Production + Preview). The landing waitlist reads them, and they were missing on 2026-11-04, so sign-ups the "not open yet" message sends to `/#waitlist` aren't forwarded anywhere.
6. Open sign-ups to everyone: disable the Before User Created hook (step 3.3); the switch is already on.

## 13. Owner checks after the run (things Ralph can't do)

On a real iPhone (Safari) and a real Android phone (Chrome), at `https://nestjourney.app/names`:

1. **Google:** sign in with a real Google account in the browser, then again from the installed home-screen app. Known risk: on iPhone, the home-screen app and Safari keep separate storage, so check that the Google round trip lands back inside the installed app, signed in. If it doesn't, tell Claude; the fallback is to hide Google inside the installed iOS app and keep email codes.
2. **Email:** sign in with your own address. The Hebrew email arrives from `no-reply@nestjourney.app`, not in spam, and the code works.
3. **Install:** iPhone: Share → "הוספה למסך הבית"; Android: the install button. The icon is the peach Nest mark, the app opens full screen at the swipe screen.
4. **Partner:** send an invite link to a second phone, join, keep the same name on both: it shows up as a match within a minute.
5. **Delete account** from settings on a test account: it disappears from Supabase → Authentication → Users.

## 14. Analytics and Clarity (after the analytics PR)

See [ANALYTICS.md](ANALYTICS.md): apply migration 0010, add yourself to `analytics.internal_users`,
create the Clarity project and set `NEXT_PUBLIC_CLARITY_PROJECT_ID` in Vercel (Production).

## Accounts summary

| Service | Account owner | What it's for | Cost |
|---|---|---|---|
| Supabase ("Kiril Personal", free plan) | Kiril | Database, auth, edge functions | Free tier |
| Vercel (project `ken`) | Kiril | Hosting nestjourney.app | Existing |
| Google Cloud (project `Nest`, `nest-4c83e`, shared with Firebase) | Kiril | Google sign-in | Free |
| Twilio (next phase, not now) | Kiril | SMS codes (Verify) | Pay per verification |
| Resend | Kiril | Sign-in code emails | Free tier (3,000/month, check current limits) |
| Cloudflare (Turnstile) | Kiril | Bot protection on sign-in | Free |
