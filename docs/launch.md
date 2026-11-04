# Launching Coere v4 and coere.ai accounts

Everything the owner does by hand to go live, in order. The code for both
sides is built and on `main`: this site, and the v4 extension in coere-v2
(`pnpm build:v4`). Nothing below has been run against the real Supabase
project, the real Vercel deployment or the real Anthropic account yet, so
step 6 is the first real test.

The details behind each step are in the README sections named, and the
contract is `docs/accounts.md`.

## 1. Supabase

1. Make the project (or use the blank one).
2. Open the SQL editor, paste all of
   `supabase/migrations/20261103000000_coere.sql` and run it once. It makes
   every table, function, policy and the private `memory` bucket. Running it
   again changes nothing.
3. Authentication settings (README, "In the Supabase dashboard"):
   - Email sign in on, Confirm email on, OTP length 6, minimum password
     length 10.
   - Site URL `https://www.coere.ai`; Redirect URLs `https://www.coere.ai/**`.
   - Sessions: no time box and no inactivity timeout.
   - SMTP: a real sender. Supabase's own sender allows only a few emails an
     hour.
4. Paste the two email templates (README, "Email templates").
5. Copy the project URL, the publishable key and the secret key for step 2.

## 2. Vercel

Set these in the project's environment variables (Production), then
redeploy:

| Variable | Value |
| --- | --- |
| `SUPABASE_URL` | the project URL |
| `SUPABASE_PUBLISHABLE_KEY` | the publishable key |
| `SUPABASE_SECRET_KEY` | the secret key |
| `ANTHROPIC_API_KEY` | Coere's Claude key |
| `JEV_API_KEY` | optional; leave it unset to classify with Claude Haiku instead |
| `SECURITY_SALT` | a long random string |
| `USER`, `PASSWORD` | the admin panel's sign in |
| `COERE_EXTENSION_IDS` | the extension's id, from step 3 |

- The Claude route asks for `maxDuration` 800 seconds, so a long answer is
  not cut off. That needs Vercel Pro or above; on Hobby the deploy is
  refused, and the route must go back to 300.
- Any deployment protection or password gate must leave `/api/v1` open, or
  the extension cannot reach the site.

## 3. Chrome Web Store

1. In coere-v2, run `pnpm install` then `pnpm build:v4`, and zip the folder
   `apps/extension/.output/chrome-mv3-v4` (its contents, with
   `manifest.json` at the top).
2. Upload the zip as a new item in the Chrome Web Store developer
   dashboard. The item's id is shown at once, before review.
3. Put that id into `COERE_EXTENSION_IDS` on Vercel and redeploy. Without
   it, `/connect` refuses the extension in production.
4. The listing needs:
   - the privacy policy address, `https://www.coere.ai/privacy`. Read the
     page first; it lists what only the owner can fill in (legal name,
     address, where the data is stored, retention);
   - a reason for each permission. The ones to explain: host access to the
     nine AI sites (read and save chats there), to `www.coere.ai` (the
     account and every AI request), `externally_connectable` for coere.ai
     (the connect page hands over the sign in), `scripting`, `offscreen`,
     `storage` and `unlimitedStorage` (the local library and memory),
     `downloads` (exports), `tabGroups`, `activeTab`, `contextMenus` and
     `search` (Coere Actions);
   - the Limited Use statement in the data use form, which the privacy page
     already makes.

## 4. Before anyone else installs it

The free plan's monthly limit is $5 and the hidden daily limit is $2, so a
free person reaches the month's limit on the third day. Decide the plan
limits on `/admin/limits` (for example $60 a month to let $2 a day run all
month), and check the first build allowance ($10).

## 5. The launch countdown

`/install` and `/try-teams` count down to the moments on `/admin/launch`.
When the listing is live, point the site's Install buttons at it (the
`/install` links and `CHROME_STORE_URL` in
`src/site/dashboard/connect-first.tsx`).

## 6. The first real run

1. In Chrome, load the unpacked `chrome-mv3-v4` folder (or install from the
   store once it is listed). The connect page opens.
2. Sign in with an email code, press Connect Coere, and finish onboarding.
3. Let the first memory build run, then open `/dashboard`: the memory, the
   chats and the usage should be there, and Back up now should work.
4. Open `/admin` (USER and PASSWORD): the account, its cost by model and the
   security events should show.
5. On `/admin/organizations`, make a test organization with yourself as
   admin, then delete it.

If any step fails, the server logs on Vercel and the security events on
`/admin/security` say where.
