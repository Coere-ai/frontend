# Setting up Coere v4 and coere.ai

Everything the owner does by hand to make coere.ai and the v4 extension work,
in order, from empty accounts to the first real run. The code is built and on
`main` in both repositories: this site, and the v4 extension in coere-v2. None
of it has run against the real Supabase project, Vercel deployment or
Anthropic account yet, so section 9 is the first real test.

Budget about an hour for sections 1 to 8, plus Google's review of the store
listing (a few days).

Keep a private note (a password manager is best) open while you work. You
will copy about eight values into Vercel in section 7. Never paste a key into
a chat, a commit, an issue or a screenshot.

## 0. Accounts you need

| Service | What it is for | Cost |
| --- | --- | --- |
| Anthropic | the Claude API that builds memory | pay as you go, prepaid credits |
| Supabase | the database, sign in and memory backups | free plan is enough to start |
| Vercel | hosts www.coere.ai | Hobby works; Pro raises limits |
| Chrome Web Store developer account | publishes the extension | one time $5 |
| Your domain registrar | DNS for coere.ai | already yours |

## 1. Anthropic API key (`ANTHROPIC_API_KEY`)

1. Go to console.anthropic.com (Anthropic may send you on to its new Claude
   developer platform address) and sign in or make an account.
2. Billing: open **Settings**, then **Billing**. Add a card and buy credits;
   $25 to $50 is plenty to test. Turn on auto reload before launch, so the
   site never runs dry.
3. Spend limit: open **Settings**, then **Limits**, and set a monthly spend
   limit you are comfortable with. It is the safety net above the per account
   limits in the admin panel.
4. Make the key: open **API Keys**, press **Create Key**, name it
   `coere-ai-production`, keep the default workspace, and copy the value
   (`sk-ant-...`). It is shown once.
5. Rate limits: new accounts start on a low tier. Check **Settings**, then
   **Limits**. The tier rises as you spend; ask Anthropic for a higher tier
   before a big launch.

The extension uses `claude-sonnet-5-5` for memory building, `claude-haiku-5-5`
for short tasks, and allows `claude-opus-5-5`. No other setting is needed on
Anthropic's side.

## 2. Jev key (`JEV_API_KEY`): optional, skip it for launch

Jev is TypeSafe's classifier (`api.typesafe.ai`). Leave `JEV_API_KEY` unset.
The site then answers the extension's Jev calls with "not available", and the
extension sorts with Claude Haiku instead, so everything works. If TypeSafe
gives you a key later, add it in section 7 and redeploy. If you never use
Jev, remove TypeSafe from `/privacy`.

## 3. Email: none to set up

coere.ai sends no email. An account is a username and a password, so there
is no sign in code, no confirmation link and no reset email, and no sender
(Resend, SMTP or templates) to set up. Supabase's own sender reaches only
the project team's addresses, a few an hour, so nothing may depend on it.

Supabase Auth still needs an email for every account. The server gives each
one a placeholder, `<username>@users.coere.ai`, marks it confirmed when it
makes the account, and never shows it. No mail is ever sent to it, and a
null MX record (section 4.4 step 7) makes sure nothing would accept any.

A person who forgets their password writes to the site's contact email
(`/sign-in` says so). You then set a new one on `/admin/users`, the account,
**Set a new password**, and tell them; they change it on `/account`. A
person who forgot their username gets one the same way, with **Set the
username**. If they asked because someone else got into the account, also
press **Revoke every device**: the new password signs the account out on
coere.ai, but its Coere browsers stay connected until revoked.

An account made before usernames, with an emailed code, has no username
and no password, so it cannot sign in or be deleted by its owner. If
`/admin/users` shows one with no username, give it one with **Set the
username** and a password with **Set a new password**, and tell the person.

## 4. Supabase

### 4.1 Make the project

1. Sign in at supabase.com and press **New project**.
2. Name it `coere`, set a strong database password (save it), and pick the
   region nearest your users (for example East US).
3. Wait about two minutes for it to finish.

### 4.2 Run the migration (the whole database in one file)

1. Open **SQL Editor** in the left menu, then **New query**.
2. Open `supabase/migrations/20261103000000_coere.sql` from this repository,
   copy all of it, and paste it in.
3. Press **Run**. It should end with "Success. No rows returned". It is safe
   to run again later; a second run changes nothing.
4. Check it:
   - **Table Editor** lists tables such as `profiles`, `devices`,
     `usage_events`, `organizations`, `plans`, `user_totals`,
     `developer_waitlist` and `site_visits`.
   - `plans` has three rows: free, plus and team.
   - **Storage** shows a private bucket named `memory`.
5. If it fails, copy the error message (not the SQL) and send it to the
   developer. `npm run db:check` runs the same file locally on PGlite with
   332 checks, so a failure on Supabase would be a Supabase difference.

This one file is every migration there is: site analytics, accounts, devices,
usage and limits, the memory backup, settings sync, organizations, running
totals, the waitlist and interest lists, the launch countdown settings, the
`memory` bucket with its policies, and every function the server calls.

### 4.3 Copy the three values

Open **Project Settings**, then **API Keys** (older projects: **API**).

| Copy | Save as | Where |
| --- | --- | --- |
| Project URL, like `https://abcdxyz.supabase.co` | `SUPABASE_URL` | Project Settings, then Data API (or the top of the API page) |
| Publishable key, `sb_publishable_...` | `SUPABASE_PUBLISHABLE_KEY` | API Keys. Older projects call it the **anon** key; that works too |
| Secret key, `sb_secret_...` | `SUPABASE_SECRET_KEY` | API Keys, **Secret keys**, **Create new secret key** if none. Older projects call it **service_role**; that works too |

The secret key can read and change everything. Only Vercel may hold it.

### 4.4 Sign in settings

Everything here is under **Authentication** in the left menu.

1. **Sign In / Providers**, then **User Signups**: turn **Allow new users
   to sign up** off. The server makes every account with the secret key
   (`auth.admin.createUser`), which this switch does not stop. Off, nobody
   holding the project URL and the publishable key can make an account
   straight through Supabase, around the site's username rules and limits.
   Save.
2. **Sign In / Providers**, then **Email**:
   - **Enable Email provider**: on. Supabase keeps a placeholder email for
     each account, and the password sign in runs through this provider.
   - **Confirm email**: on or off, the site works either way: the server
     confirms each account when it makes it, so Supabase never sends a
     confirmation, and with step 1 off no other way in makes an account.
   - **Secure password change**: off. On, Supabase would email a code before
     a password change on `/account`, and coere.ai sends no email. If it is
     left on, the page says to sign in again instead.
   - **Minimum password length**: `10`.
   - Save.
3. **Sign In / Providers**: leave every other provider off (no Google,
   GitHub, phone, magic link or anonymous sign in).
4. **URL Configuration**:
   - **Site URL**: `https://www.coere.ai`
   - **Redirect URLs**: none are needed, since no email carries a link.
5. **Sessions**: leave **Time-box user sessions** and **Inactivity timeout**
   off (the default), so people stay signed in until they sign out.
6. **Rate Limits**: every sign in reaches Supabase from the site's servers,
   not from the person's address, so raise **Rate limit for sign ups and
   sign ins** well above the default (for example 300 in 5 minutes). The
   site keeps its own limits: 10 tries in 15 minutes for each address and
   50 for each username. The email rate limit does not matter, since
   nothing is sent.
7. **Emails**: leave every security notification email (password changed,
   email changed and the rest) off; each would go to a placeholder. Then,
   at the registrar that runs `coere.ai`'s DNS, add a null MX record for
   the placeholder domain, so no catch-all or wildcard ever accepts mail
   for it:

   | Type | Name | Value | Priority |
   | --- | --- | --- | --- |
   | MX | `users` | `.` | `0` |

   Check it with `dig MX users.coere.ai`, which should answer `0 .`.

### 4.5 Storage

Nothing to make: the migration made the private `memory` bucket (50 MiB per
file) and its rules. Check **Storage**, then **Settings**: the global upload
limit must be at least 50 MB (the free plan's default is 50 MB).

## 5. Two values you make yourself

- **`SECURITY_SALT`**: a long random string. On a Mac or Linux terminal run
  `openssl rand -hex 32` and copy the output. Never change it later; it groups
  failed sign ins from one address in the security log without storing the
  address.
- **`USER` and `PASSWORD`**: the sign in for `/admin`. Pick a username and a
  password of 20 or more characters from your password manager. Changing the
  password later signs every admin session out.

## 6. Build the v4 extension zip

The zip is already built from the latest code (`coere-v4-1.1.3.zip`). To build
it yourself:

```bash
cd coere-v2
pnpm install
pnpm build:v4
cd apps/extension/.output/chrome-mv3-v4 && zip -r ../coere-v4.zip .
```

The zip must have `manifest.json` at its top. The build holds no API key and
talks only to `https://www.coere.ai`.

## 7. Vercel

### 7.1 The project and domains

1. In Vercel, **Add New**, then **Project**, and import the GitHub repository
   `Coere-ai/frontend` (skip if it already exists).
2. Framework preset: **Next.js**. Build command, output and install command:
   leave the defaults. Node.js version (Settings, then General): 22.x.
3. Production branch: `main`. Every push to `main` deploys.
4. **Settings**, then **Domains**: add `www.coere.ai` as the primary domain,
   and add `coere.ai` set to redirect to `www.coere.ai` (308). Follow
   Vercel's DNS instructions at your registrar.

### 7.2 Environment variables

**Settings**, then **Environment Variables**. Add each for **Production**
(and **Preview** if you use preview links). Mark the secret ones
**Sensitive**.

Required:

| Name | Value | Sensitive |
| --- | --- | --- |
| `SUPABASE_URL` | section 4.3 | no |
| `SUPABASE_PUBLISHABLE_KEY` | section 4.3 | no |
| `SUPABASE_SECRET_KEY` | section 4.3 | yes |
| `ANTHROPIC_API_KEY` | section 1 | yes |
| `SECURITY_SALT` | section 5 | yes |
| `USER` | section 5 | no |
| `PASSWORD` | section 5 | yes |
| `COERE_EXTENSION_IDS` | the extension's id from section 8, comma separated if more than one | no |

Optional:

| Name | When | Value |
| --- | --- | --- |
| `COERE_STORE_URL` | once the store listing is live | the listing's address; Add to Chrome on `/install` goes there. Unset, it opens a store search for Coere |
| `JEV_API_KEY` | only with a TypeSafe key | the key |
| `NEXT_PUBLIC_SITE_URL` | only if the site is not at www.coere.ai | the site's address; defaults to `https://www.coere.ai` |
| `GOOGLE_SITE_VERIFICATION`, `BING_SITE_VERIFICATION` | only for Search Console or Bing Webmaster Tools | their verification codes |

Do not set `ANALYTICS_TRUST_GENERIC_GEO_HEADERS` on Vercel; it is for other
hosts.

### 7.3 Deployment protection

**Settings**, then **Deployment Protection**: if Password Protection or
Vercel Authentication covers **Production**, turn it off (or exempt
`/api/v1`). The extension cannot pass a gate made for people.

### 7.4 Function duration

Every route asks for 300 seconds, the most Hobby allows. On Pro you may raise
the Claude route to 800 seconds in
`src/app/api/v1/anthropic/[...path]/route.ts`, so a very long answer is never
cut off.

### 7.5 Deploy and check

1. **Deployments**, the menu on the latest one, **Redeploy**. Variables only
   take effect on a new deployment.
2. Open `https://www.coere.ai/sign-up` and make your account with a
   username and a password. No email is asked for or sent. You land on the
   dashboard page, which says to install Coere (expected for now).
3. Open `https://www.coere.ai/account`: your username shows. Sign out, then
   sign in again at `/sign-in` with the username and password.
4. Open `https://www.coere.ai/admin` and sign in with `USER` and `PASSWORD`:
   **Users** lists your account, **Database** lists every table with Row
   Level Security on and no alert.

## 8. Chrome Web Store

1. Go to chrome.google.com/webstore/devconsole with the Google account that
   will own Coere, and pay the one time $5 registration.
2. **New item**, upload `coere-v4-1.1.3.zip`.
3. Copy the item's **ID** (32 letters), shown right away. Put it into
   `COERE_EXTENSION_IDS` on Vercel and redeploy. Without it coere.ai refuses
   to connect the extension and will not show the dashboard.
4. To test before review: in Chrome open `chrome://extensions`, turn on
   **Developer mode**, **Load unpacked**, and pick the unzipped folder. Its
   id differs from the store's; add it too:
   `COERE_EXTENSION_IDS=storeid,unpackedid`, and redeploy. Remove the
   unpacked id before you go public.
5. The listing:
   - **Privacy policy**: `https://www.coere.ai/privacy`. Add the company's
     legal name and address there first.
   - **Single purpose**: "Saves your AI chats and builds one memory you own,
     added to new chats on every AI."
   - **Permission justifications**: the nine AI sites (read and save the
     person's chats there and add their memory to new chats); `www.coere.ai`
     (the person's account and every AI request); `externally_connectable`
     for coere.ai (the sign in hands the extension its token); web accessible
     `console.html` for coere.ai (coere.ai shows the extension's own
     dashboard); `scripting`, `offscreen`, `storage`, `unlimitedStorage` (the
     local library and memory); `downloads` (exports); `tabGroups` (grouping
     the tabs Extract all opens); `activeTab`, `contextMenus`, `search`
     (Coere Actions).
   - **Data use**: declare authentication information (the account's
     username and device token, kept in the browser), user activity and
     website content (the chats it saves locally, and the cleaned AI requests
     and memory backup that go to coere.ai), and confirm the Limited Use
     statement; the privacy page makes it.
6. Submit for review.

## 9. The first real run (before you go public)

1. Install the extension (unpacked, or the store version once approved). The
   coere.ai connect page opens.
2. Sign in with your username and password and press **Connect Coere**.
   Onboarding opens.
3. Pick your AIs, run Extract all, and let the first memory build finish.
4. Open `https://www.coere.ai/dashboard`: it shows Coere's own dashboard with
   your memory, library and Statistics. In Settings, the Account card shows
   your username and the backup.
5. Press **Back up now**, then in Supabase **Storage**, `memory`, check for a
   folder named by your user id.
6. In `/admin`: **Users** shows your account and its cost, **Cost** shows
   tokens by model, **Security** shows your sign ins and the connected
   device.
7. On `/admin/organizations`, make a test organization with yourself as
   admin, check its section in the dashboard, then delete it.
8. Make a second test account at `/sign-up`. On `/admin/users`, open it and
   use **Set a new password**, then sign in with the new password, to prove
   the forgotten password path works. On `/account`, change its password
   (it asks for the current one first), sign in again within ten minutes, type its username and delete it, to
   prove deletion works on real Supabase.

## 10. Limits, countdown and launch

1. `/admin/limits`: the defaults are a $10 first build allowance (in place of
   the monthly limit until the first memory build finishes), then $5 a month
   on Free, $20 on Plus, $100 on Team, no daily limit and no lifetime limit.
   People never see a limit; they see one line only while paused. Change any
   value there; no code change is needed.
2. `/admin/launch`: set the countdown on `/install` and `/try-teams`, or turn
   the timer off.
3. When the store approves the listing: set `COERE_STORE_URL` to the listing
   and redeploy, and set the Connect countdown to now so `/install` shows Add
   to Chrome.

## 11. When something fails

| What you see | Most likely cause | Fix |
| --- | --- | --- |
| Sign in says the username or password is wrong for everyone at once, and the server log shows `sign in refused over_request_rate_limit` | Supabase's sign in rate limit, shared by the site's servers | Section 4.4 step 6 |
| Sign up says the account could not be made | `SUPABASE_SECRET_KEY` missing, or the Email provider off | Section 4.4 step 2 and 7.2 |
| Changing a password on `/account` says to sign in again | Secure password change is on | Section 4.4 step 2 |
| Someone forgot their password | there is no reset email | Section 3: set a new one on `/admin/users` |
| `/admin` never accepts the password | `USER` or `PASSWORD` missing, or not redeployed | Section 7.2, then redeploy |
| `/admin` says storage is not configured | `SUPABASE_URL` or `SUPABASE_SECRET_KEY` missing | Section 7.2 |
| Connect Coere says the extension is not allowed | its id is not in `COERE_EXTENSION_IDS` | Section 8 step 3 or 4 |
| The dashboard says to install Coere with Coere installed | the same | the same |
| Memory never builds, the card says coere.ai is unavailable | `ANTHROPIC_API_KEY` missing or out of credit | Section 1 and 7.2 |
| Every extension call fails | Deployment protection covers `/api/v1` | Section 7.3 |
| Backup never appears in Storage | the backup switch is off on `/account`, or the file is over 50 MB | `/account`, section 4.5 |

Vercel's **Logs** for the deployment and `/admin/security` say where a
request failed. Send the error text, never a key.
