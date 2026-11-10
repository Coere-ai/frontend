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
| Resend (or Postmark, SendGrid) | sends the sign in emails | free plan is enough to start |
| Chrome Web Store developer account | publishes the extension | one time $5 |
| Your domain registrar | DNS for coere.ai and the email sender | already yours |

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

## 3. The email sender (Resend)

Supabase's own sender allows only a few emails an hour, and every sign in
needs one, so set up a real sender before anyone else signs in.

1. Make an account at resend.com.
2. **Domains**, then **Add domain**: enter `coere.ai`.
3. Resend shows DNS records (an MX or return path record, an SPF TXT record
   and a DKIM TXT record). Add each one at your domain registrar exactly as
   shown, then press **Verify** in Resend. Wait until it says **Verified**
   (minutes to an hour).
4. **API Keys**, then **Create API key** with sending access. Copy it. You
   will paste it into Supabase in section 4.6; it does not go into Vercel.

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
   301 checks, so a failure on Supabase would be a Supabase difference.

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

1. **Sign In / Providers**, then **Email**:
   - **Enable Email provider**: on.
   - **Confirm email**: on.
   - **Email OTP Length**: `6`. Expiry: leave the default (3600 seconds).
   - **Minimum password length**: `10`.
   - **Secure password change**: your choice. On, a session older than a day
     must type an emailed code before changing its password on `/account`
     (the page handles it).
   - Save.
2. **Sign In / Providers**: leave every other provider off (no Google,
   GitHub, phone or anonymous sign in).
3. **URL Configuration**:
   - **Site URL**: `https://www.coere.ai`
   - **Redirect URLs**: add `https://www.coere.ai/**`. Add
     `http://localhost:3000/**` only if you run the site on your computer.
4. **Sessions**: leave **Time-box user sessions** and **Inactivity timeout**
   off (the default), so people stay signed in until they sign out.
5. **Rate Limits**: after section 4.6, raise **Rate limit for sending
   emails** to what your sender allows (for example 100 an hour to start).

### 4.5 Email templates

**Authentication**, then **Emails**, then **Templates**. A new address that
signs in by code gets **Confirm signup**, a known one gets **Magic Link**, so
both must hold the code and the link. Paste these exactly.

**Magic Link**. Subject: `Your Coere sign in code`

```html
<h2>Sign in to Coere</h2>
<p>Your code is <strong>{{ .Token }}</strong>. Type it on the sign in page.</p>
<p>Or open this link in the browser you want to sign in on:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Sign in to Coere</a></p>
<p>If you did not ask to sign in, you can ignore this email.</p>
```

**Confirm signup**. Subject: `Confirm your Coere account`

```html
<h2>Welcome to Coere</h2>
<p>Open this link to confirm your email and sign in:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next={{ .RedirectTo }}">Confirm your email</a></p>
<p>Or type this code on the sign in page: <strong>{{ .Token }}</strong></p>
<p>If you did not make a Coere account, you can ignore this email.</p>
```

**Reauthentication**: leave Supabase's own template; it already holds
`{{ .Token }}`, which the password change on `/account` needs. The other
templates (Invite user, Change email, Reset password) are not used.

Keep `next={{ .RedirectTo }}` last in both links: `/auth/confirm` reads
everything after `next=` as the page to return to.

### 4.6 SMTP

**Authentication**, then **Emails** (or **Notifications**), then **SMTP
Settings**. Turn on **Enable custom SMTP** and enter:

| Field | Value |
| --- | --- |
| Sender email | `no-reply@coere.ai` |
| Sender name | `Coere` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | the Resend API key from section 3 |

Save, then go back to section 4.4 step 5 and raise the email rate limit.

### 4.7 Storage

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
2. Open `https://www.coere.ai/sign-in`, sign in with your email: the code
   comes from `no-reply@coere.ai`, and after typing it you land on the
   dashboard page, which says to install Coere (expected for now).
3. Open `https://www.coere.ai/account`: your email shows; set a username.
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
   - **Data use**: declare email address (the account), user activity and
     website content (the chats it saves locally, and the cleaned AI requests
     and memory backup that go to coere.ai), and confirm the Limited Use
     statement; the privacy page makes it.
6. Submit for review.

## 9. The first real run (before you go public)

1. Install the extension (unpacked, or the store version once approved). The
   coere.ai connect page opens.
2. Sign in with an email code and press **Connect Coere**. Onboarding opens.
3. Pick your AIs, run Extract all, and let the first memory build finish.
4. Open `https://www.coere.ai/dashboard`: it shows Coere's own dashboard with
   your memory, library and Statistics. In Settings, the Account card shows
   your email and the backup.
5. Press **Back up now**, then in Supabase **Storage**, `memory`, check for a
   folder named by your user id.
6. In `/admin`: **Users** shows your account and its cost, **Cost** shows
   tokens by model, **Security** shows your sign ins and the connected
   device.
7. On `/admin/organizations`, make a test organization with yourself as
   admin, check its section in the dashboard, then delete it.
8. On `/account`, make a second test account, sign in again within ten
   minutes, and delete it, to prove deletion works on real Supabase.

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
| The sign in code never arrives | SMTP not set or domain not verified | Section 3 and 4.6; check Resend's logs |
| "Too many requests" on sign in | Supabase's email rate limit | Section 4.4 step 5 |
| The email link opens the home page | Redirect URL missing | Section 4.4 step 3 |
| `/admin` never accepts the password | `USER` or `PASSWORD` missing, or not redeployed | Section 7.2, then redeploy |
| `/admin` says storage is not configured | `SUPABASE_URL` or `SUPABASE_SECRET_KEY` missing | Section 7.2 |
| Connect Coere says the extension is not allowed | its id is not in `COERE_EXTENSION_IDS` | Section 8 step 3 or 4 |
| The dashboard says to install Coere with Coere installed | the same | the same |
| Memory never builds, the card says coere.ai is unavailable | `ANTHROPIC_API_KEY` missing or out of credit | Section 1 and 7.2 |
| Every extension call fails | Deployment protection covers `/api/v1` | Section 7.3 |
| Backup never appears in Storage | the backup switch is off on `/account`, or the file is over 50 MB | `/account`, section 4.7 |

Vercel's **Logs** for the deployment and `/admin/security` say where a
request failed. Send the error text, never a key.
