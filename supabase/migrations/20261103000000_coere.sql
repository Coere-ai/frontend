-- Coere: the whole database for coere.ai, in one file.
--
-- Paste into the Supabase SQL editor on a blank project and run. Safe to run
-- again: every statement is idempotent (create ... if not exists, create or
-- replace, drop before add, on conflict do nothing for seeds), so a second
-- run changes nothing. `npm run db:check` runs it twice against a local
-- Postgres and tests what it builds.
--
-- It has two parts, in this order:
--
--   1. Site analytics, everything behind /admin/analytics. These tables are
--      anonymous and written only by the server from POST /api/site/track.
--   2. Accounts (docs/accounts.md sections 10, 14, 15, 16 and Appendix A):
--      plans, profiles, devices, usage, the memory copy, synced settings,
--      organizations, the running totals behind the Statistics page, the
--      developer waitlist, who is interested in Coere Connect and Coere for
--      Teams, the site's settings (the launch countdowns), and the private
--      Storage bucket `memory`.
--
-- Part 1 is the Optagon landing page's four analytics migrations combined, in
-- their order:
--   20260905000000_site_analytics     site_visits and site_events
--   20260905000100_track_functions    record_heartbeat and record_conversion
--   20260906000000_section_views      site_section_views and record_sections
--   20261013000000_section_labels     label and position on sections
--
-- The order is changed in two places, the content in none, so it runs clean
-- in one pass on a fresh project. The label and position columns are created
-- with the table (and still added after it, for a table made before them).
-- record_sections is created once, in its final form, after every column it
-- writes: a `language sql` function is checked against the tables and columns
-- it names when it is created, so it can only come after them. Part 2 follows
-- the same rule.
--
-- The analytics are anonymous: nothing in part 1 identifies a person. The
-- visitor id is a random string the browser keeps in localStorage whose only
-- job is to tell a returning browser from a new one.
--
-- Every analytics table is written ONLY by the server, with the secret key,
-- from POST /api/site/track. Row Level Security is enabled with no policies at
-- all, which denies every anon and authenticated request by design: the
-- browser never talks to this database, so there is nothing to grant.

create extension if not exists pgcrypto;


-- Visits

-- One row per page load. Heartbeats update it in place (session_id is unique),
-- so a visit stays one row no matter how long it runs.
create table if not exists public.site_visits (
  id                uuid primary key default gen_random_uuid(),

  -- Per page-load id, minted client-side. UNIQUE so a heartbeat can upsert
  -- onto the view it belongs to instead of inserting a second row.
  session_id        text        not null unique,
  -- Stable per-browser id: the unique-visitor key.
  visitor_id        text        not null,

  path              text        not null default '/',
  -- Host only. The writer strips the rest: a query string can carry a person's
  -- search terms, and those are not ours to store.
  referrer          text,
  user_agent        text,

  -- Parsed from the user agent at WRITE time, so reads group on an indexed
  -- column instead of running a regex over every row.
  device            text,
  browser           text,
  os                text,

  -- Set by the edge, never by the client. Null in local development and for any
  -- address the edge could not place. That is "unknown", not zero.
  country           text,
  region            text,
  city              text,
  latitude          double precision,
  longitude         double precision,

  -- ACTIVE seconds (tab focused), grown by heartbeats.
  duration_seconds  integer     not null default 0,
  -- Deepest scroll reached, 0-100. Duration alone cannot separate a visit that
  -- read the page from one that sat on the hero with the tab open.
  max_scroll        integer     not null default 0,

  -- True when the user agent named a crawler or a link previewer. Classified on
  -- the write path so the dashboard can split people from machines by reading a
  -- column.
  is_bot            boolean     not null default false,
  bot_name          text,

  cta_clicks        integer     not null default 0,
  converted         boolean     not null default false,

  created_at        timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),

  constraint site_visits_duration_sane  check (duration_seconds >= 0 and duration_seconds <= 86400),
  constraint site_visits_scroll_sane    check (max_scroll between 0 and 100),
  constraint site_visits_cta_sane       check (cta_clicks >= 0),
  constraint site_visits_latitude_sane  check (latitude is null or latitude between -90 and 90),
  constraint site_visits_longitude_sane check (longitude is null or longitude between -180 and 180)
);

-- One row per tracked interaction. Separate from site_visits because the
-- cardinality differs in kind: a visit is one row with a handful of facts,
-- interactions are unbounded per visit. session_id joins an event back to its
-- visit, deliberately NOT as a foreign key, because events arrive by sendBeacon
-- during unload and can land before their visit row commits.
create table if not exists public.site_events (
  id          uuid primary key default gen_random_uuid(),
  session_id  text        not null,
  visitor_id  text        not null,
  path        text        not null,
  kind        text        not null,
  -- The element's own words, trimmed. Never markup.
  label       text,
  href        text,
  created_at  timestamptz not null default now(),

  constraint site_events_kind_known check (kind in ('click', 'cta', 'outbound', 'section'))
);

create index if not exists site_visits_created_idx  on public.site_visits (created_at desc);
create index if not exists site_visits_visitor_idx  on public.site_visits (visitor_id);
create index if not exists site_visits_bot_idx      on public.site_visits (is_bot, created_at desc);
create index if not exists site_visits_path_idx     on public.site_visits (created_at desc, path);
create index if not exists site_visits_country_idx  on public.site_visits (created_at desc, country);
create index if not exists site_visits_device_idx   on public.site_visits (created_at desc, device);

create index if not exists site_events_created_idx  on public.site_events (created_at desc);
create index if not exists site_events_kind_idx     on public.site_events (created_at desc, kind);
create index if not exists site_events_path_idx     on public.site_events (created_at desc, path);
create index if not exists site_events_session_idx  on public.site_events (session_id);

-- RLS on, no policies: anon and authenticated are denied everything. The
-- secret key bypasses RLS, and it is the only thing that ever connects.
alter table public.site_visits enable row level security;
alter table public.site_events enable row level security;

-- Belt and braces: even if a policy were added by accident later, the anon and
-- authenticated roles hold no table privileges to exercise it.
revoke all on public.site_visits from anon, authenticated;
revoke all on public.site_events from anon, authenticated;

-- And explicit rather than inherited: Supabase's default privileges grant
-- these on most projects, but stating them means the tables keep working on a
-- project where those defaults are off.
grant select, insert, update on public.site_visits to service_role;
grant select, insert on public.site_events to service_role;


-- Sections

-- One row per (visit, section): whether the reader ever got to that part of the
-- page, and how many ACTIVE seconds they spent with it filling the screen.
--
-- Kept apart from site_visits because the grain differs: a visit is one row, a
-- visit's sections are up to one row each. Kept apart from site_events because
-- an event is a moment and this is a duration that keeps growing.
--
-- `label` and `position` are what the browser reports for each section: its
-- name and its place down the page. Both are nullable, so a batch from a
-- browser tab that sends neither still lands.
create table if not exists public.site_section_views (
  id           uuid primary key default gen_random_uuid(),

  session_id   text        not null,
  visitor_id   text        not null,
  path         text        not null,
  -- The section element's DOM id, or a slug of its heading when it has none.
  section      text        not null,

  -- ACTIVE seconds during which this section filled more of the viewport than
  -- any other. Attributed to exactly one section per second, so the sections of
  -- a visit sum to no more than the visit itself.
  seconds      integer     not null default 0,

  label        text,
  position     smallint,

  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),

  -- A section is recorded at most once per visit; later beacons grow the row.
  constraint site_section_views_unique unique (session_id, section),
  constraint site_section_views_seconds_sane check (seconds >= 0 and seconds <= 86400),
  constraint site_section_views_label_sane check (label is null or char_length(label) <= 80),
  constraint site_section_views_position_sane check (position is null or position between 0 and 199)
);

create index if not exists site_section_views_created_idx on public.site_section_views (created_at desc);
create index if not exists site_section_views_section_idx on public.site_section_views (section, created_at desc);
create index if not exists site_section_views_session_idx on public.site_section_views (session_id);
-- The dashboard reads one page's sections at a time.
create index if not exists site_section_views_path_idx    on public.site_section_views (path, created_at desc);

alter table public.site_section_views enable row level security;
revoke all on public.site_section_views from anon, authenticated;
grant select, insert, update on public.site_section_views to service_role;

-- The section labels migration, kept for a project that already has the table
-- from before it. On a fresh project the columns exist and these do nothing.
alter table public.site_section_views
  add column if not exists label    text,
  add column if not exists position smallint;

alter table public.site_section_views
  drop constraint if exists site_section_views_label_sane,
  add constraint site_section_views_label_sane
    check (label is null or char_length(label) <= 80);

alter table public.site_section_views
  drop constraint if exists site_section_views_position_sane,
  add constraint site_section_views_position_sane
    check (position is null or position between 0 and 199);


-- Write helpers
--
-- Each exists so that a read-then-write becomes ONE statement. Beacons for the
-- same session arrive concurrently and out of order (the unload beacon races
-- the last interval tick), and doing this in application code would mean a
-- lost update whenever two land together. All three are security invoker, so
-- they run with the caller's rights, and the caller is only ever the server.

-- Fold a heartbeat into the visit it belongs to.
--
-- Duration and scroll only ever move UP. A late, smaller reading is a stale
-- one, and greatest() means it cannot walk a visit's numbers backwards.
-- The inputs are clamped here as well as in the API layer, so a direct caller
-- cannot write a value the table's own constraints would reject.
create or replace function public.record_heartbeat(
  p_session_id       text,
  p_duration_seconds integer,
  p_max_scroll       integer
) returns void
language sql
security invoker
set search_path = ''
as $$
  update public.site_visits
     set duration_seconds = greatest(duration_seconds, least(greatest(p_duration_seconds, 0), 86400)),
         max_scroll       = greatest(max_scroll,       least(greatest(p_max_scroll, 0), 100)),
         last_seen_at     = now()
   where session_id = p_session_id;
$$;

-- Mark a visit converted and count the click.
--
-- The conversion lives on the visit rather than being counted from site_events
-- so that "views that converted" stays a property of the view, countable
-- alongside every other per-visit number.
create or replace function public.record_conversion(p_session_id text)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.site_visits
     set cta_clicks   = cta_clicks + 1,
         converted    = true,
         last_seen_at = now()
   where session_id = p_session_id;
$$;

-- Fold a batch of section readings into one visit.
--
-- One statement for the whole batch: a page reports every section it has seen
-- at once, and doing this row by row would mean a round trip each and a lost
-- update whenever two beacons landed together.
--
-- `seconds` only ever moves UP, for the same reason heartbeats do. Keys a
-- batch does not carry are simply null in jsonb_to_recordset, so a batch with
-- ids only still lands, and coalesce() stops it erasing a label already known.
create or replace function public.record_sections(
  p_session_id text,
  p_visitor_id text,
  p_path       text,
  p_sections   jsonb
) returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.site_section_views
    (session_id, visitor_id, path, section, seconds, label, position)
  select
    p_session_id,
    p_visitor_id,
    p_path,
    s.section,
    -- GROUP BY with max() so a batch naming one section twice cannot abort the
    -- whole statement with "ON CONFLICT DO UPDATE command cannot affect row a
    -- second time" (SQLSTATE 21000). The caller de-duplicates too, but a write
    -- path must not depend on its callers being careful.
    max(least(greatest(s.seconds, 0), 86400)),
    max(left(nullif(btrim(s.label), ''), 80)),
    max(least(greatest(s.position, 0), 199))::smallint
  from jsonb_to_recordset(p_sections)
    as s(section text, seconds integer, label text, position integer)
  where s.section is not null and s.section <> ''
  group by s.section
  on conflict (session_id, section) do update
    set seconds      = greatest(public.site_section_views.seconds, excluded.seconds),
        -- A later beacon without a label must not erase the one already known.
        label        = coalesce(excluded.label, public.site_section_views.label),
        position     = coalesce(excluded.position, public.site_section_views.position),
        last_seen_at = now();
$$;

-- PostgREST grants EXECUTE on public functions to anon and authenticated by
-- default, which would let anyone with the publishable key inflate the numbers.
-- Only the service role, which is the only thing that ever connects, may call
-- these.
revoke all on function public.record_heartbeat(text, integer, integer) from public, anon, authenticated;
revoke all on function public.record_conversion(text) from public, anon, authenticated;
revoke all on function public.record_sections(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.record_heartbeat(text, integer, integer) to service_role;
grant execute on function public.record_conversion(text) to service_role;
grant execute on function public.record_sections(text, text, text, jsonb) to service_role;



-- ===========================================================================
-- Part 2. Accounts
-- ===========================================================================
--
-- The contract is docs/accounts.md. Every table below has Row Level Security
-- on. A signed in person reads only their own rows (and their organization's)
-- through the site's session client; anon gets nothing at all. The server's
-- secret key bypasses Row Level Security and is the only thing that writes.
--
-- Policies call (select auth.uid()) rather than auth.uid(), so Postgres runs
-- it once per statement instead of once per row.
--
-- Tables come first, in the order their foreign keys need. Then the helpers
-- the policies use, then the policies and grants, then Storage, then the
-- functions, which are `language sql` or name the tables, so they come last.


-- Plans

-- What an account may spend. The site reads the limits through device_auth()
-- on every metered call, so a plan change takes effect on the next request.
create table if not exists public.plans (
  id                    text        primary key,
  name                  text        not null,
  -- Integer micro dollars: 1 USD is 1,000,000. Money is never a float here.
  monthly_limit_micros  bigint      not null,
  -- Null means the plan has no lifetime limit, which is true of every seed.
  lifetime_limit_micros bigint,
  -- The daily AI spend limit (section 8.10), per UTC day. Null means none,
  -- which is true of every seed, so the monthly limit governs. The operator
  -- may set one. Until the account's first memory build has finished, the
  -- first build allowance applies in place of the monthly and daily limits.
  -- None of the limits is shown to the person.
  daily_limit_micros       bigint,
  first_build_limit_micros bigint   not null default 10000000,
  storage_limit_bytes   bigint      not null,
  requests_per_minute   integer     not null,
  created_at            timestamptz not null default now(),

  constraint plans_limits_sane check (
    monthly_limit_micros >= 0 and storage_limit_bytes >= 0 and requests_per_minute > 0
    and (lifetime_limit_micros is null or lifetime_limit_micros >= 0)
    and (daily_limit_micros is null or daily_limit_micros >= 0) and first_build_limit_micros >= 0)
);

-- The three plans of section 10, each with a $10 first build, then its
-- monthly limit and no daily limit. do nothing, so an operator's later edit
-- of a plan's limits survives a second run of this file.
insert into public.plans (id, name, monthly_limit_micros, daily_limit_micros, first_build_limit_micros, storage_limit_bytes, requests_per_minute) values
  ('free', 'Free',   5000000, null, 10000000,  26214400,  60),
  ('plus', 'Plus',  20000000, null, 10000000, 104857600, 120),
  ('team', 'Team', 100000000, null, 10000000, 524288000, 300)
on conflict (id) do nothing;


-- Profiles

-- One row per account, made by the trigger on auth.users below. auth.users
-- belongs to Supabase Auth; everything Coere knows about a person hangs off
-- this row instead, so deleting the auth user cascades through all of it.
create table if not exists public.profiles (
  id                uuid        primary key references auth.users (id) on delete cascade,
  email             text,
  -- Stored lowercase. Sign in by username turns it into the email on the
  -- server, so it must be unique.
  username          text        unique,
  display_name      text,
  plan_id           text        not null default 'free' references public.plans (id),
  -- The operator's limits for this one person, set in the admin panel. Null
  -- means the plan's. device_auth() resolves them, so the site never does.
  monthly_limit_micros  bigint,
  lifetime_limit_micros bigint,
  daily_limit_micros       bigint,
  first_build_limit_micros bigint,
  -- When the first memory build finished: the first memory_built event, set
  -- by record_app_events(). Null until then, and the monthly and daily
  -- limits wait for it.
  first_build_at          timestamptz,
  -- user_totals.cost_micros at the last turn of the first build: when the
  -- free build began (0, or when the operator reset it) while first_build_at
  -- is null, and when it finished after. The first build allowance counts
  -- spend above it, and so do the month and the day the build finished in.
  first_build_mark_micros bigint      not null default 0,
  status            text        not null default 'active',
  -- The memory backup is on by default (section 13); sensitive memories are
  -- left out of it unless the person turns them on.
  memory_sync       boolean     not null default true,
  include_sensitive boolean     not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  last_seen_at      timestamptz,

  constraint profiles_status_known   check (status in ('active', 'suspended')),
  constraint profiles_username_shape check (username is null or username ~ '^[a-z0-9_]{3,24}$'),
  constraint profiles_display_sane   check (display_name is null or char_length(display_name) <= 80),
  constraint profiles_limits_sane    check (
    (monthly_limit_micros is null or monthly_limit_micros >= 0)
    and (lifetime_limit_micros is null or lifetime_limit_micros >= 0)
    and (daily_limit_micros is null or daily_limit_micros >= 0)
    and (first_build_limit_micros is null or first_build_limit_micros >= 0)
    and first_build_mark_micros >= 0)
);


-- Organizations (section 14)

-- Made here, before the tables that point at it. A company and its people
-- reading from one shared knowledge graph. Only the Coere operator makes one,
-- from the admin panel, through create_organization().
--
-- An access object says what a member may do:
--   { "read": "all" | [section keys], "contribute": boolean }
-- read picks the sections of the shared graph they see, contribute whether
-- their memory goes into it. The checks below hold every stored one to that
-- shape, so the site can read it without guarding against a stray value.
create table if not exists public.organizations (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  slug            text        not null unique,
  plan_id         text        not null default 'team' references public.plans (id),
  -- The memory sections members share into the organization's graph.
  shared_sections text[]      not null default '{work}',
  -- What a member may do until an admin narrows it: everything.
  default_access  jsonb       not null default '{"read": "all", "contribute": true}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint organizations_name_sane check (char_length(btrim(name)) between 1 and 80),
  constraint organizations_slug_shape check (slug ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  constraint organizations_access_shape check (coalesce(
    jsonb_typeof(default_access) = 'object'
    and (default_access -> 'read' = '"all"'::jsonb or jsonb_typeof(default_access -> 'read') = 'array')
    and jsonb_typeof(default_access -> 'contribute') = 'boolean', false))
);

-- A person is in at most one organization: user_id is unique on its own, not
-- only with org_id. That is what lets device_auth() and the totals functions
-- find "the person's organization" with a plain lookup. There is no owner
-- role: admins run the organization, and the operator stands above them.
create table if not exists public.org_members (
  org_id       uuid        not null references public.organizations (id) on delete cascade,
  user_id      uuid        not null unique references public.profiles (id) on delete cascade,
  role         text        not null,
  -- Null means the organization's default_access. Admins always read everything.
  access       jsonb,
  share_memory boolean     not null default true,
  added_by     text        not null default 'invite',
  joined_at    timestamptz not null default now(),

  primary key (org_id, user_id),
  constraint org_members_role_known  check (role in ('admin', 'member')),
  constraint org_members_added_known check (added_by in ('operator', 'invite')),
  constraint org_members_access_shape check (access is null or coalesce(
    jsonb_typeof(access) = 'object'
    and (access -> 'read' = '"all"'::jsonb or jsonb_typeof(access -> 'read') = 'array')
    and jsonb_typeof(access -> 'contribute') = 'boolean', false))
);

-- An invite goes to an existing account, never to a bare email, so there is
-- no link to leak: the invited person sees it on their own dashboard and
-- accepts or declines it there.
create table if not exists public.org_invites (
  id          uuid        primary key default gen_random_uuid(),
  org_id      uuid        not null references public.organizations (id) on delete cascade,
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  role        text        not null,
  invited_by  uuid        references public.profiles (id) on delete set null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  declined_at timestamptz,
  revoked_at  timestamptz,

  constraint org_invites_role_known check (role in ('admin', 'member'))
);

create index if not exists org_invites_org_idx  on public.org_invites (org_id);
-- The organization page lists the signed in person's pending invites.
create index if not exists org_invites_user_idx on public.org_invites (user_id);

-- The merged graph's place in Storage and its counts. The graph itself is
-- org/<org id>/index.json in the memory bucket, built by the server.
create table if not exists public.org_memory (
  org_id       uuid        primary key references public.organizations (id) on delete cascade,
  index_path   text,
  index_bytes  bigint      not null default 0,
  entities     integer     not null default 0,
  facts        integer     not null default 0,
  relations    integer     not null default 0,
  sources      integer     not null default 0,
  contributors integer     not null default 0,
  updated_at   timestamptz not null default now()
);


-- Devices

-- One row per connected browser. The token itself is never stored, only the
-- hex SHA-256 of it, so a leaked table connects nobody.
create table if not exists public.devices (
  id                uuid        primary key default gen_random_uuid(),
  user_id           uuid        not null references public.profiles (id) on delete cascade,
  name              text        not null,
  token_hash        text        not null unique,
  -- The last 4 characters, so the person can tell their browsers apart.
  token_hint        text        not null,
  extension_id      text,
  extension_version text,
  created_at        timestamptz not null default now(),
  last_used_at      timestamptz,
  revoked_at        timestamptz,
  revoked_reason    text,

  constraint devices_revoked_known check (
    revoked_reason is null or revoked_reason in ('signed_out', 'user', 'admin', 'account'))
);

create index if not exists devices_user_idx on public.devices (user_id);

-- A connect code (section 4): lives 5 minutes, works once, and is bound to
-- the PKCE challenge and the extension id that asked for it.
create table if not exists public.device_codes (
  code_hash    text        primary key,
  user_id      uuid        not null references public.profiles (id) on delete cascade,
  challenge    text        not null,
  extension_id text        not null,
  device_name  text,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null,
  used_at      timestamptz
);


-- Usage

-- One row per metered call. user_id and device_id are set null when the
-- account goes, so the cost history stays whole and names nobody.
create table if not exists public.usage_events (
  id                 bigint      generated always as identity primary key,
  user_id            uuid        references public.profiles (id) on delete set null,
  device_id          uuid        references public.devices (id) on delete set null,
  kind               text        not null,
  model              text,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  status             smallint,
  duration_ms        integer,
  request_id         text,
  created_at         timestamptz not null default now(),

  constraint usage_events_kind_known check (kind in ('message', 'count_tokens', 'batch_result', 'jev'))
);

create index if not exists usage_events_user_idx    on public.usage_events (user_id, created_at desc);
create index if not exists usage_events_created_idx on public.usage_events (created_at desc);

-- This month's spend per account, kept by record_usage() so the limit check
-- in device_auth() reads one row instead of adding up the month's events.
create table if not exists public.usage_monthly (
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  -- The first day of the month in UTC.
  month         date        not null,
  requests      bigint      not null default 0,
  input_tokens  bigint      not null default 0,
  output_tokens bigint      not null default 0,
  cost_micros   bigint      not null default 0,
  updated_at    timestamptz not null default now(),

  primary key (user_id, month)
);

-- Each account's spend per UTC day, kept by record_usage() so the daily limit
-- reads one row, when the operator sets one. Server only.
create table if not exists public.usage_daily (
  user_id            uuid        not null references public.profiles (id) on delete cascade,
  day                date        not null,
  requests           bigint      not null default 0,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  updated_at         timestamptz not null default now(),

  primary key (user_id, day)
);

-- The admin Cost page adds up a range of days across every account.
create index if not exists usage_daily_day_idx on public.usage_daily (day);

-- The whole product's use per UTC day and model, kept by record_usage(), so
-- the Cost page splits any range by model without reading usage_events. No
-- foreign key, so a deleted account's use stays. model is '' for a row that
-- names none (a batch charged its reservation).
create table if not exists public.usage_model_daily (
  day                date        not null,
  model              text        not null,
  requests           bigint      not null default 0,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  updated_at         timestamptz not null default now(),

  primary key (day, model)
);

-- A batch id is stored as its caller's, so one account can never read or
-- cancel another's batch. metered_at makes reading the results twice count once.
-- reserved_micros is the batch's worst case cost, counted against the
-- account's limits by reserve_spend() until the batch is metered.
create table if not exists public.ai_batches (
  id              text        primary key,
  user_id         uuid        not null references public.profiles (id) on delete cascade,
  device_id       uuid        references public.devices (id) on delete set null,
  request_count   integer     not null default 0,
  reserved_micros bigint      not null default 0 check (reserved_micros >= 0),
  created_at      timestamptz not null default now(),
  metered_at      timestamptz
);

create index if not exists ai_batches_user_idx on public.ai_batches (user_id, created_at desc);

-- Spend promised to calls still in flight. Cost is recorded only once
-- Anthropic answers, so each metered call first holds its worst case here,
-- and reserve_spend() counts every live hold against the limits. A hold is
-- deleted when its call is metered, and simply runs out if the function dies.
create table if not exists public.spend_holds (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  amount_micros bigint      not null check (amount_micros >= 0),
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

create index if not exists spend_holds_user_idx on public.spend_holds (user_id, expires_at);


-- The memory copy

-- The latest .coere file per account, with the counts read from its manifest.
-- The file is <user id>/memory.coere in the memory bucket; the index the
-- dashboard reads is <user id>/index.json.
create table if not exists public.memory_files (
  user_id            uuid        primary key references public.profiles (id) on delete cascade,
  object_path        text        not null,
  index_path         text,
  bytes              bigint      not null default 0,
  index_bytes        bigint      not null default 0,
  digest             text        not null,
  format_version     text,
  generator_version  text,
  memories           integer     not null default 0,
  entities           integer     not null default 0,
  links              integer     not null default 0,
  chats              integer     not null default 0,
  documents          integer     not null default 0,
  sections           integer     not null default 0,
  includes_quotes    boolean     not null default true,
  includes_sensitive boolean     not null default false,
  device_id          uuid        references public.devices (id) on delete set null,
  uploaded_at        timestamptz not null default now()
);


-- Synced settings

-- One JSON object per account, keyed by the extension's storage keys
-- (section 6.6). version grows on every write so the extension can tell a
-- newer record from its own.
create table if not exists public.user_settings (
  user_id    uuid        primary key references public.profiles (id) on delete cascade,
  settings   jsonb       not null default '{}'::jsonb,
  version    bigint      not null default 0,
  updated_at timestamptz not null default now(),
  updated_by text,

  constraint user_settings_object  check (jsonb_typeof(settings) = 'object'),
  constraint user_settings_size    check (octet_length(settings::text) <= 65536),
  constraint user_settings_by_known check (updated_by is null or updated_by in ('site', 'extension'))
);


-- Logs

-- Feature counts from the extension (section 6.7). Counts and token numbers
-- only, never text. tokens_saved is kept per row as well as in the totals, so
-- a person's imports and transfers can be listed later at no extra cost.
create table if not exists public.app_events (
  id           bigint      generated always as identity primary key,
  user_id      uuid        references public.profiles (id) on delete set null,
  device_id    uuid        references public.devices (id) on delete set null,
  kind         text        not null,
  count        integer     not null,
  tokens_saved bigint      not null default 0,
  created_at   timestamptz not null default now(),

  constraint app_events_kind_known check (kind in (
    'extract_chat', 'extract_all', 'transfer', 'context_import', 'memory_search', 'cori_chat',
    'action_run', 'rewrite', 'voice', 'file_upload', 'memory_built', 'onboarding_done')),
  constraint app_events_count_sane check (count between 1 and 100000),
  constraint app_events_saved_sane check (tokens_saved between 0 and 100000000)
);

create index if not exists app_events_user_idx    on public.app_events (user_id, created_at desc);
create index if not exists app_events_created_idx on public.app_events (created_at desc, kind);

-- Who signed in, failed, connected or was refused. ip_hash is the first 16
-- hex characters of HMAC-SHA256(address, SECURITY_SALT); the address itself
-- is never stored.
create table if not exists public.security_events (
  id         bigint      generated always as identity primary key,
  user_id    uuid        references public.profiles (id) on delete set null,
  org_id     uuid        references public.organizations (id) on delete set null,
  kind       text        not null,
  ip_hash    text,
  country    text,
  created_at timestamptz not null default now(),

  constraint security_events_kind_known check (kind in (
    'sign_in', 'sign_in_failed', 'code_sent', 'sign_up', 'password_set', 'username_set',
    'sign_out', 'device_connected', 'device_revoked', 'token_rejected', 'rate_limited',
    'usage_limited', 'connect_refused', 'memory_deleted', 'account_deleted', 'org_created',
    'org_deleted', 'org_invite_sent', 'org_joined', 'org_left', 'org_member_removed',
    'admin_sign_in', 'admin_sign_in_failed', 'admin_viewed_memory'))
);

create index if not exists security_events_created_idx on public.security_events (created_at desc, kind);
create index if not exists security_events_user_idx    on public.security_events (user_id, created_at desc);


-- Running totals (section 15)
--
-- The Statistics page and the dashboards read these instead of adding up the
-- raw logs. They are written only by the functions at the end of this file,
-- in the same call as the event that changes them, so they never drift from
-- the logs by a lost update. The three tables share one set of counters.
--
-- tokens_saved is what the person would have pasted by hand minus what Coere
-- sent, summed over every context import and transfer.
-- memories, entities, links, chats and storage_bytes are set (not added) from
-- the latest memory file, by set_memory_totals().

create table if not exists public.user_totals (
  user_id            uuid        primary key references public.profiles (id) on delete cascade,
  requests           bigint      not null default 0,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  tokens_saved       bigint      not null default 0,
  context_imports    bigint      not null default 0,
  transfers          bigint      not null default 0,
  extractions        bigint      not null default 0,
  cori_chats         bigint      not null default 0,
  action_runs        bigint      not null default 0,
  memories           integer     not null default 0,
  entities           integer     not null default 0,
  links              integer     not null default 0,
  chats              integer     not null default 0,
  storage_bytes      bigint      not null default 0,
  updated_at         timestamptz not null default now()
);

-- An organization's totals grow with each member's usage while they are a
-- member, and keep those numbers after the member leaves. Its memory counts
-- are the merged graph's.
create table if not exists public.org_totals (
  org_id             uuid        primary key references public.organizations (id) on delete cascade,
  members            integer     not null default 0,
  requests           bigint      not null default 0,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  tokens_saved       bigint      not null default 0,
  context_imports    bigint      not null default 0,
  transfers          bigint      not null default 0,
  extractions        bigint      not null default 0,
  cori_chats         bigint      not null default 0,
  action_runs        bigint      not null default 0,
  memories           integer     not null default 0,
  entities           integer     not null default 0,
  links              integer     not null default 0,
  chats              integer     not null default 0,
  storage_bytes      bigint      not null default 0,
  updated_at         timestamptz not null default now()
);

-- The whole product, one row per UTC day. No foreign keys, so a deleted
-- account's numbers stay in the days they happened. The memory columns are
-- unused today (memory is a level, not a flow) and kept so all three tables
-- share one shape.
create table if not exists public.daily_totals (
  day                date        primary key,
  new_users          integer     not null default 0,
  new_orgs           integer     not null default 0,
  requests           bigint      not null default 0,
  input_tokens       bigint      not null default 0,
  output_tokens      bigint      not null default 0,
  cache_read_tokens  bigint      not null default 0,
  cache_write_tokens bigint      not null default 0,
  cost_micros        bigint      not null default 0,
  tokens_saved       bigint      not null default 0,
  context_imports    bigint      not null default 0,
  transfers          bigint      not null default 0,
  extractions        bigint      not null default 0,
  cori_chats         bigint      not null default 0,
  action_runs        bigint      not null default 0,
  memories           integer     not null default 0,
  entities           integer     not null default 0,
  links              integer     not null default 0,
  chats              integer     not null default 0,
  storage_bytes      bigint      not null default 0,
  updated_at         timestamptz not null default now()
);


-- The developer waitlist (section 16)

-- Written by the /developers/waitlist form's server action. The email is
-- unique and stored lowercase, so a repeat signup is a no-op, not a second row.
create table if not exists public.developer_waitlist (
  id         bigint      generated always as identity primary key,
  email      text        not null unique,
  source     text,
  ip_hash    text,
  created_at timestamptz not null default now(),

  constraint developer_waitlist_email_lower check (email = lower(email)),
  constraint developer_waitlist_email_sane  check (char_length(email) between 3 and 254),
  constraint developer_waitlist_source_sane check (source is null or char_length(source) <= 64)
);

create index if not exists developer_waitlist_created_idx on public.developer_waitlist (created_at desc);


-- Who is interested in a product that is not out yet (section 16)

-- Written by the I'm interested form on /install (connect) and /try-teams
-- (teams). One row per address and product, stored lowercase, so saying it
-- twice is a no-op, not a second row.
create table if not exists public.product_interest (
  id         bigint      generated always as identity primary key,
  email      text        not null,
  product    text        not null,
  source     text,
  ip_hash    text,
  created_at timestamptz not null default now(),

  constraint product_interest_email_product_key unique (email, product),
  constraint product_interest_email_lower check (email = lower(email)),
  constraint product_interest_email_format check (char_length(email) between 3 and 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint product_interest_product_known check (product in ('connect', 'teams')),
  constraint product_interest_source_sane check (source is null or char_length(source) <= 64)
);

create index if not exists product_interest_product_created_idx on public.product_interest (product, created_at desc);


-- The site's own settings (section 16)

-- Small values the operator changes in /admin without a deploy. Today the
-- launch countdowns: launch.connect for /install and launch.teams for
-- /try-teams, each {"at": "<ISO moment>", "show": true}.
create table if not exists public.site_settings (
  key        text        primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now(),

  constraint site_settings_key_sane check (key ~ '^[a-z0-9_.]{1,64}$'),
  constraint site_settings_value_object check (jsonb_typeof(value) = 'object' and pg_column_size(value) <= 8192)
);

-- do nothing, so a moment the operator set survives a rerun.
insert into public.site_settings (key, value) values
  ('launch.connect', '{"at": "2026-11-23T17:00:00.000Z", "show": true}'),
  ('launch.teams',   '{"at": "2026-11-23T17:00:00.000Z", "show": true}')
on conflict (key) do nothing;


-- Organization helpers for the policies
--
-- A policy on org_members that asked org_members "which organization is the
-- caller in?" would run its own policy again and recurse. These two read
-- org_members as their owner (security definer), outside Row Level Security,
-- and return only the caller's own organization and role, so nothing leaks.

create or replace function public.my_org_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select m.org_id from public.org_members m where m.user_id = (select auth.uid());
$$;

create or replace function public.my_org_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select m.role from public.org_members m where m.user_id = (select auth.uid());
$$;

revoke all on function public.my_org_id() from public, anon;
revoke all on function public.my_org_role() from public, anon;
grant execute on function public.my_org_id() to authenticated, service_role;
grant execute on function public.my_org_role() to authenticated, service_role;


-- A new account
--
-- Supabase Auth inserts into auth.users on every sign up, by code, link or
-- password, before the address is proven. This makes the profile and the
-- totals row in the same transaction, so there is never an account without
-- them. The username and the count in today's sign ups wait until the email
-- is confirmed (public.welcome_user below), so an address nobody confirms
-- never holds a username or counts as a sign up. An account made already
-- confirmed (by the operator, or with confirmation off) is welcomed at once.

-- The confirmed half of a sign up. The username comes from the sign up form
-- (options.data.username). A username that is malformed or already taken is
-- dropped rather than failing the confirmation: the person can set one later.
create or replace function public.welcome_user(p_user uuid, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_username text := lower(btrim(coalesce(p_meta ->> 'username', '')));
begin
  if v_username ~ '^[a-z0-9_]{3,24}$' then
    begin
      update public.profiles set username = v_username, updated_at = now()
      where id = p_user and username is null;
    exception when unique_violation then
      -- The username was taken between the form's check and now.
      null;
    end;
  end if;

  insert into public.daily_totals (day, new_users)
  values ((now() at time zone 'utc')::date, 1)
  on conflict (day) do update
    set new_users = public.daily_totals.new_users + 1, updated_at = now();
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, username)
  values (new.id, lower(new.email), null)
  on conflict (id) do nothing;

  insert into public.user_totals (user_id) values (new.id) on conflict (user_id) do nothing;

  if new.email_confirmed_at is not null then
    perform public.welcome_user(new.id, new.raw_user_meta_data);
  end if;

  return new;
end;
$$;

-- The first time an address is confirmed: by the emailed code, the link or
-- an accepted invite.
create or replace function public.handle_user_confirmed()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform public.welcome_user(new.id, new.raw_user_meta_data);
  return new;
end;
$$;

-- Keeps profiles.email in step when a person changes their address, since
-- sign in by username reads the email from the profile.
create or replace function public.handle_user_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = lower(new.email), updated_at = now() where id = new.id;
  return new;
end;
$$;

revoke all on function public.welcome_user(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.handle_user_confirmed() from public, anon, authenticated;
revoke all on function public.handle_user_email() from public, anon, authenticated;

drop trigger if exists coere_on_auth_user_created on auth.users;
create trigger coere_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists coere_on_auth_user_confirmed on auth.users;
create trigger coere_on_auth_user_confirmed
  after update of email_confirmed_at on auth.users
  for each row when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_user_confirmed();

drop trigger if exists coere_on_auth_user_email on auth.users;
create trigger coere_on_auth_user_email
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function public.handle_user_email();


-- Row Level Security and grants
--
-- Supabase's default privileges grant every new public table to anon and
-- authenticated. So each table first loses all of that, then gets back only
-- what section 10 allows. Privileges decide which columns and verbs a role
-- may use at all; the policies then decide which rows. Tables with no policy
-- (device_codes, usage_daily, usage_model_daily, ai_batches, spend_holds,
-- app_events, security_events, daily_totals, developer_waitlist,
-- product_interest, site_settings) are server only: Row Level Security on
-- with no policy denies every signed in request.

alter table public.plans              enable row level security;
alter table public.profiles           enable row level security;
alter table public.organizations      enable row level security;
alter table public.org_members        enable row level security;
alter table public.org_invites        enable row level security;
alter table public.org_memory         enable row level security;
alter table public.devices            enable row level security;
alter table public.device_codes       enable row level security;
alter table public.usage_events       enable row level security;
alter table public.usage_monthly      enable row level security;
alter table public.usage_daily        enable row level security;
alter table public.usage_model_daily  enable row level security;
alter table public.ai_batches         enable row level security;
alter table public.spend_holds        enable row level security;
alter table public.memory_files       enable row level security;
alter table public.user_settings      enable row level security;
alter table public.app_events         enable row level security;
alter table public.security_events    enable row level security;
alter table public.user_totals        enable row level security;
alter table public.org_totals         enable row level security;
alter table public.daily_totals       enable row level security;
alter table public.developer_waitlist enable row level security;
alter table public.product_interest   enable row level security;
alter table public.site_settings      enable row level security;

revoke all on
  public.plans, public.profiles, public.organizations, public.org_members, public.org_invites,
  public.org_memory, public.devices, public.device_codes, public.usage_events,
  public.usage_monthly, public.usage_daily, public.usage_model_daily, public.ai_batches, public.spend_holds,
  public.memory_files, public.user_settings,
  public.app_events, public.security_events, public.user_totals, public.org_totals,
  public.daily_totals, public.developer_waitlist, public.product_interest, public.site_settings
from anon, authenticated;

-- Stated rather than inherited, as in part 1, so the server keeps working on
-- a project where Supabase's default grants are off.
grant select, insert, update, delete on
  public.plans, public.profiles, public.organizations, public.org_members, public.org_invites,
  public.org_memory, public.devices, public.device_codes, public.usage_events,
  public.usage_monthly, public.usage_daily, public.usage_model_daily, public.ai_batches, public.spend_holds,
  public.memory_files, public.user_settings,
  public.app_events, public.security_events, public.user_totals, public.org_totals,
  public.daily_totals, public.developer_waitlist, public.product_interest, public.site_settings
to service_role;

-- What a signed in person may read. Rows are narrowed by the policies below.
grant select on
  public.organizations, public.org_members, public.org_invites,
  public.org_memory, public.usage_events, public.usage_monthly, public.memory_files,
  public.user_settings, public.user_totals, public.org_totals
to authenticated;

-- plans and profiles: every column but the spend limits and the first
-- build, which are never shown to the person (section 8.10). Column grants,
-- as for devices below, so the limits stay on the server: a select naming
-- one of them (or select *) is refused. The extension reads its own resolved
-- limits through GET /api/v1/account, which the server answers.
grant select (id, name, storage_limit_bytes, requests_per_minute, created_at)
  on public.plans to authenticated;
grant select (id, email, username, display_name, plan_id, status, memory_sync,
              include_sensitive, created_at, updated_at, last_seen_at)
  on public.profiles to authenticated;

-- devices: every column but token_hash. A column grant, not a policy,
-- because policies pick rows and cannot hide a column. A select naming
-- token_hash (or select *) is refused for a signed in person.
grant select (id, user_id, name, token_hint, extension_id, extension_version,
              created_at, last_used_at, revoked_at, revoked_reason)
  on public.devices to authenticated;

-- profiles: a person may change their display name and nothing else. Plan,
-- their limits, the first build, status, username and the memory switches go
-- through the server, which checks what each change is allowed to be.
grant update (display_name) on public.profiles to authenticated;


-- Policies. Each is dropped first so a second run replaces it.

-- Plans are public facts about prices.
drop policy if exists plans_read on public.plans;
create policy plans_read on public.plans
  for select to authenticated using (true);

drop policy if exists profiles_read_own on public.profiles;
create policy profiles_read_own on public.profiles
  for select to authenticated using (id = (select auth.uid()));

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

drop policy if exists devices_read_own on public.devices;
create policy devices_read_own on public.devices
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists usage_events_read_own on public.usage_events;
create policy usage_events_read_own on public.usage_events
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists usage_monthly_read_own on public.usage_monthly;
create policy usage_monthly_read_own on public.usage_monthly
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists memory_files_read_own on public.memory_files;
create policy memory_files_read_own on public.memory_files
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists user_settings_read_own on public.user_settings;
create policy user_settings_read_own on public.user_settings
  for select to authenticated using (user_id = (select auth.uid()));

drop policy if exists user_totals_read_own on public.user_totals;
create policy user_totals_read_own on public.user_totals
  for select to authenticated using (user_id = (select auth.uid()));

-- Organization rows: members only. my_org_id() is null for a person in no
-- organization, and null equals nothing, so they see none.
drop policy if exists organizations_read_member on public.organizations;
create policy organizations_read_member on public.organizations
  for select to authenticated using (id = (select public.my_org_id()));

drop policy if exists org_members_read_member on public.org_members;
create policy org_members_read_member on public.org_members
  for select to authenticated using (org_id = (select public.my_org_id()));

drop policy if exists org_memory_read_member on public.org_memory;
create policy org_memory_read_member on public.org_memory
  for select to authenticated using (org_id = (select public.my_org_id()));

drop policy if exists org_totals_read_member on public.org_totals;
create policy org_totals_read_member on public.org_totals
  for select to authenticated using (org_id = (select public.my_org_id()));

-- Invites: the organization's admins, and the invited person, who is not a
-- member yet and reads only the invites made for their own account.
drop policy if exists org_invites_read_admin on public.org_invites;
create policy org_invites_read_admin on public.org_invites
  for select to authenticated using (
    org_id = (select public.my_org_id()) and (select public.my_org_role()) = 'admin');

drop policy if exists org_invites_read_own on public.org_invites;
create policy org_invites_read_own on public.org_invites
  for select to authenticated using (user_id = (select auth.uid()));


-- Storage
--
-- One private bucket. Each person's files sit under a folder named by their
-- user id; the organizations' merged graphs sit under org/. Uploads come only
-- through signed upload URLs the server makes, so no policy allows insert or
-- update. A signed in person may read and delete their own folder and
-- nothing else: org/ never matches a user id, so the shared graphs are read
-- through the server, which checks membership first.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('memory', 'memory', false, 52428800,
        array['application/vnd.coere.memory+zip', 'application/json'])
on conflict (id) do update
  set public             = false,
      file_size_limit    = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists coere_memory_read_own on storage.objects;
create policy coere_memory_read_own on storage.objects
  for select to authenticated using (
    bucket_id = 'memory' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists coere_memory_delete_own on storage.objects;
create policy coere_memory_delete_own on storage.objects
  for delete to authenticated using (
    bucket_id = 'memory' and (storage.foldername(name))[1] = (select auth.uid())::text);


-- Server functions (Appendix A)
--
-- Each turns a read then write into one database call, so concurrent
-- requests cannot lose an update, and so a counter and the event behind it
-- are written together or not at all. All are security invoker: the only
-- caller is the server's secret key (service_role), which bypasses Row Level
-- Security. They are revoked from everyone else at the end.
--
-- Months and days are UTC, so a total means the same thing wherever the
-- server runs.

-- One account's spend limits (section 8.10), each resolved (the person's
-- own when the operator set one, else the plan's) and beside the spend it is
-- checked against. Until the first memory build has finished, the first
-- build allowance applies in place of the monthly and daily limits, against
-- everything spent since the free build began, and the month and the day
-- count nothing. After, the monthly limit applies to this UTC month's spend
-- and the daily limit to this UTC day's, each less what the first build
-- spent, so the free build never counts against either: in the month or on
-- the day the build finished, only spend after it counts. A null daily limit
-- means none, which is true of every seeded plan. The lifetime limit (null
-- means none) applies always, against everything. first_build_cost_micros is
-- 0 once the build is done. No row for no account.
create or replace function public.spend_state(p_user uuid)
returns table (
  monthly_limit_micros bigint, month_cost_micros bigint,
  lifetime_limit_micros bigint, lifetime_cost_micros bigint,
  daily_limit_micros bigint, day_cost_micros bigint,
  first_build_done boolean, first_build_limit_micros bigint, first_build_cost_micros bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(p.monthly_limit_micros, pl.monthly_limit_micros),
         (case when p.first_build_at is null then 0
               when p.first_build_at >= date_trunc('month', now() at time zone 'utc') at time zone 'utc'
               then greatest(coalesce(ut.cost_micros, 0) - p.first_build_mark_micros, 0)
               else coalesce(um.cost_micros, 0) end)::bigint,
         coalesce(p.lifetime_limit_micros, pl.lifetime_limit_micros),
         coalesce(ut.cost_micros, 0)::bigint,
         coalesce(p.daily_limit_micros, pl.daily_limit_micros),
         (case when p.first_build_at is null then 0
               when p.first_build_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'
               then greatest(coalesce(ut.cost_micros, 0) - p.first_build_mark_micros, 0)
               else coalesce(ud.cost_micros, 0) end)::bigint,
         p.first_build_at is not null,
         coalesce(p.first_build_limit_micros, pl.first_build_limit_micros),
         (case when p.first_build_at is null
               then greatest(coalesce(ut.cost_micros, 0) - p.first_build_mark_micros, 0)
               else 0 end)::bigint
    from public.profiles p
    join public.plans pl on pl.id = p.plan_id
    left join public.user_totals ut on ut.user_id = p.id
    left join public.usage_monthly um
      on um.user_id = p.id and um.month = date_trunc('month', now() at time zone 'utc')::date
    left join public.usage_daily ud on ud.user_id = p.id and ud.day = (now() at time zone 'utc')::date
   where p.id = p_user;
$$;

-- Checks a device token and returns everything a metered call needs: the
-- account, the organization, and spend_state()'s limits and spend, so the
-- gate needs no second call. Each limit is already resolved: the person's
-- own when the operator set one, else the plan's. first_build_done says
-- whether the first build allowance or the monthly and daily limits apply.
-- No row means unknown or revoked, and the route answers signed_out.
-- last_used_at and last_seen_at are touched at most every 5 minutes, so a
-- busy extension does not write a row on every request.
create or replace function public.device_auth(p_token_hash text)
returns table (
  device_id uuid, user_id uuid, status text, plan_id text,
  monthly_limit_micros bigint, lifetime_limit_micros bigint,
  storage_limit_bytes bigint, requests_per_minute integer,
  month_cost_micros bigint, lifetime_cost_micros bigint,
  memory_sync boolean, include_sensitive boolean, org_id uuid,
  daily_limit_micros bigint, day_cost_micros bigint, first_build_done boolean,
  first_build_limit_micros bigint, first_build_cost_micros bigint)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_device public.devices%rowtype;
begin
  select d.* into v_device
    from public.devices d
   where d.token_hash = p_token_hash and d.revoked_at is null;
  if not found then
    return;
  end if;

  if v_device.last_used_at is null or v_device.last_used_at < now() - interval '5 minutes' then
    update public.devices d set last_used_at = now() where d.id = v_device.id;
    update public.profiles p set last_seen_at = now() where p.id = v_device.user_id;
  end if;

  return query
    select v_device.id, p.id, p.status, p.plan_id,
           s.monthly_limit_micros, s.lifetime_limit_micros,
           pl.storage_limit_bytes, pl.requests_per_minute,
           s.month_cost_micros, s.lifetime_cost_micros,
           p.memory_sync, p.include_sensitive, m.org_id,
           s.daily_limit_micros, s.day_cost_micros, s.first_build_done,
           s.first_build_limit_micros, s.first_build_cost_micros
      from public.profiles p
      join public.plans pl on pl.id = p.plan_id
      cross join lateral public.spend_state(p.id) s
      left join public.org_members m on m.user_id = p.id
     where p.id = v_device.user_id;
end;
$$;

-- Logs one metered call and adds it to this month's and today's spend, the
-- person's totals, their organization's totals, today's totals and today's
-- row for its model. A call with no user (it should not happen) still counts
-- in the day, so cost is never lost.
create or replace function public.record_usage(
  p_user uuid, p_device uuid, p_kind text, p_model text,
  p_input bigint, p_output bigint, p_cache_write bigint, p_cache_read bigint,
  p_cost_micros bigint, p_status integer, p_duration_ms integer, p_request_id text
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_month  date   := date_trunc('month', now() at time zone 'utc')::date;
  v_day    date   := (now() at time zone 'utc')::date;
  v_in     bigint := greatest(coalesce(p_input, 0), 0);
  v_out    bigint := greatest(coalesce(p_output, 0), 0);
  v_cw     bigint := greatest(coalesce(p_cache_write, 0), 0);
  v_cr     bigint := greatest(coalesce(p_cache_read, 0), 0);
  v_cost   bigint := greatest(coalesce(p_cost_micros, 0), 0);
  v_org    uuid;
begin
  insert into public.usage_events
    (user_id, device_id, kind, model, input_tokens, output_tokens, cache_write_tokens,
     cache_read_tokens, cost_micros, status, duration_ms, request_id)
  values
    (p_user, p_device, p_kind, p_model, v_in, v_out, v_cw, v_cr, v_cost,
     p_status::smallint, p_duration_ms, p_request_id);

  if p_user is not null then
    insert into public.usage_monthly as t (user_id, month, requests, input_tokens, output_tokens, cost_micros)
    values (p_user, v_month, 1, v_in, v_out, v_cost)
    on conflict (user_id, month) do update
      set requests      = t.requests + 1,
          input_tokens  = t.input_tokens + excluded.input_tokens,
          output_tokens = t.output_tokens + excluded.output_tokens,
          cost_micros   = t.cost_micros + excluded.cost_micros,
          updated_at    = now();

    insert into public.usage_daily as t
      (user_id, day, requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros)
    values (p_user, v_day, 1, v_in, v_out, v_cw, v_cr, v_cost)
    on conflict (user_id, day) do update
      set requests           = t.requests + 1,
          input_tokens       = t.input_tokens + excluded.input_tokens,
          output_tokens      = t.output_tokens + excluded.output_tokens,
          cache_write_tokens = t.cache_write_tokens + excluded.cache_write_tokens,
          cache_read_tokens  = t.cache_read_tokens + excluded.cache_read_tokens,
          cost_micros        = t.cost_micros + excluded.cost_micros,
          updated_at         = now();

    insert into public.user_totals as t
      (user_id, requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros)
    values (p_user, 1, v_in, v_out, v_cw, v_cr, v_cost)
    on conflict (user_id) do update
      set requests           = t.requests + 1,
          input_tokens       = t.input_tokens + excluded.input_tokens,
          output_tokens      = t.output_tokens + excluded.output_tokens,
          cache_write_tokens = t.cache_write_tokens + excluded.cache_write_tokens,
          cache_read_tokens  = t.cache_read_tokens + excluded.cache_read_tokens,
          cost_micros        = t.cost_micros + excluded.cost_micros,
          updated_at         = now();

    select m.org_id into v_org from public.org_members m where m.user_id = p_user;
    if v_org is not null then
      insert into public.org_totals as t
        (org_id, requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros)
      values (v_org, 1, v_in, v_out, v_cw, v_cr, v_cost)
      on conflict (org_id) do update
        set requests           = t.requests + 1,
            input_tokens       = t.input_tokens + excluded.input_tokens,
            output_tokens      = t.output_tokens + excluded.output_tokens,
            cache_write_tokens = t.cache_write_tokens + excluded.cache_write_tokens,
            cache_read_tokens  = t.cache_read_tokens + excluded.cache_read_tokens,
            cost_micros        = t.cost_micros + excluded.cost_micros,
            updated_at         = now();
    end if;
  end if;

  insert into public.daily_totals as t
    (day, requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros)
  values (v_day, 1, v_in, v_out, v_cw, v_cr, v_cost)
  on conflict (day) do update
    set requests           = t.requests + 1,
        input_tokens       = t.input_tokens + excluded.input_tokens,
        output_tokens      = t.output_tokens + excluded.output_tokens,
        cache_write_tokens = t.cache_write_tokens + excluded.cache_write_tokens,
        cache_read_tokens  = t.cache_read_tokens + excluded.cache_read_tokens,
        cost_micros        = t.cost_micros + excluded.cost_micros,
        updated_at         = now();

  insert into public.usage_model_daily as t
    (day, model, requests, input_tokens, output_tokens, cache_write_tokens, cache_read_tokens, cost_micros)
  values (v_day, coalesce(left(p_model, 64), ''), 1, v_in, v_out, v_cw, v_cr, v_cost)
  on conflict (day, model) do update
    set requests           = t.requests + 1,
        input_tokens       = t.input_tokens + excluded.input_tokens,
        output_tokens      = t.output_tokens + excluded.output_tokens,
        cache_write_tokens = t.cache_write_tokens + excluded.cache_write_tokens,
        cache_read_tokens  = t.cache_read_tokens + excluded.cache_read_tokens,
        cost_micros        = t.cost_micros + excluded.cost_micros,
        updated_at         = now();
end;
$$;

-- Meters a batch's results once: marks the batch metered and writes one
-- usage row per model in the same transaction. If any write fails, the mark
-- rolls back with it, so the next full read of the results meters again
-- rather than the cost being lost. False when the batch is not the caller's
-- or was metered already. p_rows: [{"model", "input", "output",
-- "cacheWrite", "cacheRead", "costMicros"}], one per model.
create or replace function public.meter_batch(
  p_user uuid, p_device uuid, p_batch text, p_rows jsonb,
  p_status integer, p_duration_ms integer, p_request_id text
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r record;
begin
  update public.ai_batches set metered_at = now()
   where id = p_batch and user_id = p_user and metered_at is null;
  if not found then
    return false;
  end if;

  for r in
    select * from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as x(
      model text, input bigint, output bigint, "cacheWrite" bigint, "cacheRead" bigint, "costMicros" bigint)
  loop
    perform public.record_usage(p_user, p_device, 'batch_result', r.model,
      r.input, r.output, r."cacheWrite", r."cacheRead", r."costMicros",
      p_status, p_duration_ms, p_request_id);
  end loop;
  return true;
end;
$$;

-- Holds a metered call's worst case against the account's limits before it
-- is forwarded (docs/accounts.md 8.10). The profile row is locked, so two
-- calls of one account never both pass on the same headroom. Pending spend
-- is every live hold plus the reservation of each batch not yet metered. A
-- message must fit whole. A batch may start while nothing is over a limit:
-- its worst case is far above what it costs, so asking it to fit would
-- refuse every batch of a small plan; its reservation then holds everything
-- else back until its results are metered. A batch whose results were never
-- read in 30 days (they expire after 29) is charged its reservation here.
-- Each limit is spend_state()'s, checked against its spend plus every
-- pending hold and reservation: the lifetime limit always, the first build
-- allowance until the first build has finished, and after it the monthly
-- limit and the daily limit when there is one. So any of them can be passed
-- by one batch at most. Answers the hold's id, or which limit refused it:
-- lifetime, first_build, monthly or daily, the one that lasts longest first.
create or replace function public.reserve_spend(
  p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean
) returns table (hold_id uuid, refused text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_amount  bigint := greatest(coalesce(p_amount, 0), 0);
  v_need    bigint;
  v_id      uuid;
  s         record;
  r         record;
begin
  perform 1 from public.profiles p where p.id = p_user for update of p;
  if not found then
    return query select null::uuid, 'monthly'::text;
    return;
  end if;

  for r in
    update public.ai_batches b set metered_at = now()
     where b.user_id = p_user and b.metered_at is null and b.reserved_micros > 0
       and b.created_at < now() - interval '30 days'
    returning b.id, b.device_id, b.reserved_micros
  loop
    perform public.record_usage(p_user, r.device_id, 'batch_result', null, 0, 0, 0, 0,
      r.reserved_micros, 200, 0, left(r.id, 120));
  end loop;

  delete from public.spend_holds h where h.user_id = p_user and h.expires_at <= now();

  -- What a limit must still hold above the spend already recorded: every
  -- pending hold and reservation, plus a message's whole worst case. For a
  -- batch it is 1 micro dollar, so in whole numbers "spend + need > limit"
  -- means the limit is already reached.
  select coalesce(sum(h.amount_micros), 0) into v_need from public.spend_holds h where h.user_id = p_user;
  v_need := v_need
    + (select coalesce(sum(b.reserved_micros), 0) from public.ai_batches b where b.user_id = p_user and b.metered_at is null)
    + case when p_batch then 1 else v_amount end;
  select * into s from public.spend_state(p_user);

  if s.lifetime_limit_micros is not null and s.lifetime_cost_micros + v_need > s.lifetime_limit_micros then
    return query select null::uuid, 'lifetime'::text;
    return;
  end if;
  if not s.first_build_done and s.first_build_cost_micros + v_need > s.first_build_limit_micros then
    return query select null::uuid, 'first_build'::text;
    return;
  end if;
  if s.first_build_done and s.month_cost_micros + v_need > s.monthly_limit_micros then
    return query select null::uuid, 'monthly'::text;
    return;
  end if;
  if s.first_build_done and s.daily_limit_micros is not null and s.day_cost_micros + v_need > s.daily_limit_micros then
    return query select null::uuid, 'daily'::text;
    return;
  end if;

  insert into public.spend_holds (user_id, amount_micros, expires_at)
  values (p_user, v_amount, now() + make_interval(secs => greatest(coalesce(p_ttl_seconds, 0), 1)))
  returning id into v_id;
  return query select v_id, null::text;
end;
$$;

-- A batch deleted before its results were metered can never be read again,
-- so it is charged its reservation, its worst case. The extension deletes a
-- batch only after reading its results through the proxy, which meters it
-- first, so this charges only a batch someone chose not to read.
create or replace function public.charge_unmetered_batch(p_user uuid, p_batch text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_device   uuid;
  v_reserved bigint;
begin
  update public.ai_batches b set metered_at = now()
   where b.id = p_batch and b.user_id = p_user and b.metered_at is null
  returning b.device_id, b.reserved_micros into v_device, v_reserved;
  if found and v_reserved > 0 then
    perform public.record_usage(p_user, v_device, 'batch_result', null, 0, 0, 0, 0,
      v_reserved, 200, 0, left(p_batch, 120));
  end if;
end;
$$;

-- Stores one batch of feature counts from the extension and adds it to the
-- person's, their organization's and today's totals. tokensSaved counts only
-- on context_import and transfer; the route already refuses it elsewhere,
-- and this ignores it elsewhere too, so a direct caller cannot inflate it.
-- The first memory_built marks the free first build done (first_build_at),
-- which ends the first build allowance and starts the monthly limit (and
-- the daily one, when set); a later one changes nothing.
create or replace function public.record_app_events(p_user uuid, p_device uuid, p_events jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_day         date := (now() at time zone 'utc')::date;
  v_org         uuid;
  v_imports     bigint;
  v_transfers   bigint;
  v_extractions bigint;
  v_cori        bigint;
  v_actions     bigint;
  v_saved       bigint;
  v_builds      bigint;
begin
  if p_events is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) = 0 then
    return;
  end if;

  -- One statement: the CTE stores the rows and the select adds them up, so
  -- the batch is parsed once.
  with batch as (
    select e.kind, e.count,
           case when e.kind in ('context_import', 'transfer')
                then greatest(coalesce(e."tokensSaved", 0), 0) else 0 end as saved
      from jsonb_to_recordset(p_events) as e(kind text, count integer, "tokensSaved" bigint)
  ), stored as (
    insert into public.app_events (user_id, device_id, kind, count, tokens_saved)
    select p_user, p_device, b.kind, b.count, b.saved from batch b
  )
  select coalesce(sum(b.count) filter (where b.kind = 'context_import'), 0),
         coalesce(sum(b.count) filter (where b.kind = 'transfer'), 0),
         coalesce(sum(b.count) filter (where b.kind in ('extract_chat', 'extract_all')), 0),
         coalesce(sum(b.count) filter (where b.kind = 'cori_chat'), 0),
         coalesce(sum(b.count) filter (where b.kind in ('action_run', 'rewrite', 'voice')), 0),
         coalesce(sum(b.saved), 0),
         coalesce(sum(b.count) filter (where b.kind = 'memory_built'), 0)
    into v_imports, v_transfers, v_extractions, v_cori, v_actions, v_saved, v_builds
    from batch b;

  if p_user is not null and v_builds > 0 then
    update public.profiles p
       set first_build_at = now(),
           first_build_mark_micros = coalesce((select ut.cost_micros from public.user_totals ut where ut.user_id = p_user), 0)
     where p.id = p_user and p.first_build_at is null;
  end if;

  if p_user is not null then
    insert into public.user_totals as t
      (user_id, context_imports, transfers, extractions, cori_chats, action_runs, tokens_saved)
    values (p_user, v_imports, v_transfers, v_extractions, v_cori, v_actions, v_saved)
    on conflict (user_id) do update
      set context_imports = t.context_imports + excluded.context_imports,
          transfers       = t.transfers + excluded.transfers,
          extractions     = t.extractions + excluded.extractions,
          cori_chats      = t.cori_chats + excluded.cori_chats,
          action_runs     = t.action_runs + excluded.action_runs,
          tokens_saved    = t.tokens_saved + excluded.tokens_saved,
          updated_at      = now();

    select m.org_id into v_org from public.org_members m where m.user_id = p_user;
    if v_org is not null then
      insert into public.org_totals as t
        (org_id, context_imports, transfers, extractions, cori_chats, action_runs, tokens_saved)
      values (v_org, v_imports, v_transfers, v_extractions, v_cori, v_actions, v_saved)
      on conflict (org_id) do update
        set context_imports = t.context_imports + excluded.context_imports,
            transfers       = t.transfers + excluded.transfers,
            extractions     = t.extractions + excluded.extractions,
            cori_chats      = t.cori_chats + excluded.cori_chats,
            action_runs     = t.action_runs + excluded.action_runs,
            tokens_saved    = t.tokens_saved + excluded.tokens_saved,
            updated_at      = now();
    end if;
  end if;

  insert into public.daily_totals as t
    (day, context_imports, transfers, extractions, cori_chats, action_runs, tokens_saved)
  values (v_day, v_imports, v_transfers, v_extractions, v_cori, v_actions, v_saved)
  on conflict (day) do update
    set context_imports = t.context_imports + excluded.context_imports,
        transfers       = t.transfers + excluded.transfers,
        extractions     = t.extractions + excluded.extractions,
        cori_chats      = t.cori_chats + excluded.cori_chats,
        action_runs     = t.action_runs + excluded.action_runs,
        tokens_saved    = t.tokens_saved + excluded.tokens_saved,
        updated_at      = now();
end;
$$;

-- Sets an organization's member count and memory columns from its rows.
-- Memory counts are the merged graph's (org_memory): facts are its memories,
-- relations its links, sources its chats. storage_bytes is the merged
-- index's size. The server calls it after merging the graph, and after a
-- member joins, leaves or is removed.
create or replace function public.set_org_memory_totals(p_org uuid)
returns void
language sql
security invoker
set search_path = ''
as $$
  insert into public.org_totals as t (org_id, members, memories, entities, links, chats, storage_bytes)
  select o.id,
         (select count(*)::integer from public.org_members m where m.org_id = o.id),
         coalesce(om.facts, 0), coalesce(om.entities, 0), coalesce(om.relations, 0),
         coalesce(om.sources, 0), coalesce(om.index_bytes, 0)
    from public.organizations o
    left join public.org_memory om on om.org_id = o.id
   where o.id = p_org
  on conflict (org_id) do update
    set members       = excluded.members,
        memories      = excluded.memories,
        entities      = excluded.entities,
        links         = excluded.links,
        chats         = excluded.chats,
        storage_bytes = excluded.storage_bytes,
        updated_at    = now();
$$;

-- Sets a person's memory columns from their latest memory file (zero when
-- they have none), then their organization's. Called after a commit and
-- after the file is deleted. A person with no profile (a deleted account)
-- is skipped.
create or replace function public.set_memory_totals(p_user uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_org uuid;
begin
  insert into public.user_totals as t (user_id, memories, entities, links, chats, storage_bytes)
  select p.id, coalesce(f.memories, 0), coalesce(f.entities, 0), coalesce(f.links, 0),
         coalesce(f.chats, 0), coalesce(f.bytes, 0)
    from public.profiles p
    left join public.memory_files f on f.user_id = p.id
   where p.id = p_user
  on conflict (user_id) do update
    set memories      = excluded.memories,
        entities      = excluded.entities,
        links         = excluded.links,
        chats         = excluded.chats,
        storage_bytes = excluded.storage_bytes,
        updated_at    = now();

  select m.org_id into v_org from public.org_members m where m.user_id = p_user;
  if v_org is not null then
    perform public.set_org_memory_totals(v_org);
  end if;
end;
$$;

-- The operator's call from the admin panel: makes an organization, its
-- graph and totals rows, and its first admin, all or nothing, and counts it
-- in today's totals. p_plan null means 'team'. An admin already in an
-- organization is refused with the message 'already_in_org'. A slug in use
-- fails with unique_violation (23505) on organizations_slug_key, so the
-- caller can try another. The unique user_id on org_members also stops two
-- creates racing for the same person.
create or replace function public.create_organization(p_name text, p_slug text, p_admin uuid, p_plan text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_org uuid;
begin
  if exists (select 1 from public.org_members m where m.user_id = p_admin) then
    raise exception 'already_in_org' using errcode = 'P0001';
  end if;

  insert into public.organizations (name, slug, plan_id)
  values (btrim(p_name), lower(btrim(p_slug)), coalesce(p_plan, 'team'))
  returning id into v_org;

  insert into public.org_members (org_id, user_id, role, added_by)
  values (v_org, p_admin, 'admin', 'operator');
  insert into public.org_memory (org_id) values (v_org) on conflict (org_id) do nothing;
  insert into public.org_totals (org_id, members) values (v_org, 1)
  on conflict (org_id) do update set members = 1, updated_at = now();

  insert into public.daily_totals as t (day, new_orgs)
  values ((now() at time zone 'utc')::date, 1)
  on conflict (day) do update set new_orgs = t.new_orgs + 1, updated_at = now();

  return v_org;
end;
$$;

-- Demotes or removes a member while keeping the rule that an organization
-- always has an admin (section 14.1). The organization row is locked, so
-- two admins demoting each other, or leaving, at the same moment are
-- counted one after the other instead of both seeing two admins. Answers
-- 'ok', 'last_admin' or 'not_member'. The operator's own actions do not go
-- through here.
create or replace function public.org_drop_member(p_org uuid, p_user uuid, p_action text)
returns text
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role   text;
  v_admins integer;
begin
  if p_action not in ('demote', 'remove') then
    raise exception 'unknown action %', p_action;
  end if;
  perform 1 from public.organizations o where o.id = p_org for update;
  select m.role into v_role from public.org_members m where m.org_id = p_org and m.user_id = p_user;
  if not found then
    return 'not_member';
  end if;
  if v_role = 'admin' then
    select count(*) into v_admins from public.org_members m where m.org_id = p_org and m.role = 'admin';
    if v_admins <= 1 then
      return 'last_admin';
    end if;
  end if;
  if p_action = 'demote' then
    update public.org_members m set role = 'member' where m.org_id = p_org and m.user_id = p_user;
  else
    delete from public.org_members m where m.org_id = p_org and m.user_id = p_user;
  end if;
  return 'ok';
end;
$$;

-- Accepts an invite for the signed in person and returns the organization's
-- id. The invite row is locked first, so two presses cannot both join.
-- Refusals, by message:
--   invite_not_found  no such invite, made for another account, or already
--                     accepted, declined or revoked (someone else's invite
--                     looks absent, so ids cannot be probed)
--   invite_expired    past its 7 days
--   already_in_org    the person is already in an organization
create or replace function public.accept_org_invite(p_user uuid, p_invite uuid)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_invite public.org_invites%rowtype;
begin
  select i.* into v_invite
    from public.org_invites i
   where i.id = p_invite
     for update;

  if not found or v_invite.user_id <> p_user or v_invite.accepted_at is not null
     or v_invite.declined_at is not null or v_invite.revoked_at is not null then
    raise exception 'invite_not_found' using errcode = 'P0001';
  end if;
  if v_invite.expires_at <= now() then
    raise exception 'invite_expired' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.org_members m where m.user_id = p_user) then
    raise exception 'already_in_org' using errcode = 'P0001';
  end if;

  insert into public.org_members (org_id, user_id, role, added_by)
  values (v_invite.org_id, p_user, v_invite.role, 'invite');

  update public.org_invites i set accepted_at = now() where i.id = v_invite.id;

  perform public.set_org_memory_totals(v_invite.org_id);

  return v_invite.org_id;
end;
$$;

-- Each table in public and storage, for /admin/database. row_estimate is the
-- planner's count, so it costs nothing on a big table; a table never
-- analyzed reads 0 rather than Postgres's -1.
create or replace function public.admin_table_stats()
returns table (schema_name text, table_name text, row_estimate bigint, total_bytes bigint,
               rls_enabled boolean, policy_count integer)
language sql
stable
security invoker
set search_path = ''
as $$
  select n.nspname::text,
         c.relname::text,
         greatest(c.reltuples, 0)::bigint,
         pg_catalog.pg_total_relation_size(c.oid)::bigint,
         c.relrowsecurity,
         (select count(*)::integer from pg_catalog.pg_policy p where p.polrelid = c.oid)
    from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
   where n.nspname in ('public', 'storage') and c.relkind in ('r', 'p')
   order by 1, 2;
$$;

-- Storage use for /admin/database and /admin/cost: one row per bucket with
-- folder null, then one row per first folder in memory (a user id, or org
-- for every organization's graphs together).
create or replace function public.admin_storage_usage()
returns table (bucket_id text, folder text, objects bigint, bytes bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select b.id::text, null::text, count(o.id)::bigint,
         coalesce(sum((o.metadata ->> 'size')::bigint), 0)::bigint
    from storage.buckets b
    left join storage.objects o on o.bucket_id = b.id
   group by b.id
  union all
  select o.bucket_id::text, (storage.foldername(o.name))[1], count(*)::bigint,
         coalesce(sum((o.metadata ->> 'size')::bigint), 0)::bigint
    from storage.objects o
   where o.bucket_id = 'memory'
   group by o.bucket_id, (storage.foldername(o.name))[1]
   order by 1, 2 nulls first;
$$;

-- The operator gives an account its free first build again: the monthly and
-- daily limits wait for the next memory_built, and the first build allowance
-- counts from what the account has spent so far, so spend before the reset
-- never uses it up. False when there is no such account.
create or replace function public.reset_first_build(p_user uuid)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.profiles p
     set first_build_at = null,
         first_build_mark_micros = coalesce((select ut.cost_micros from public.user_totals ut where ut.user_id = p_user), 0),
         updated_at = now()
   where p.id = p_user;
  return found;
end;
$$;

-- /admin/cost by model: requests, the four token counts and cost per model,
-- from the days on or after p_from (every day when null). It reads
-- usage_model_daily, a row per day and model, so any range costs the same
-- few rows however busy the product is. model is '' for a charged
-- reservation that names none.
create or replace function public.admin_usage_by_model(p_from date)
returns table (model text, requests bigint, input_tokens bigint, output_tokens bigint,
               cache_write_tokens bigint, cache_read_tokens bigint, cost_micros bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select u.model, sum(u.requests)::bigint, sum(u.input_tokens)::bigint, sum(u.output_tokens)::bigint,
         sum(u.cache_write_tokens)::bigint, sum(u.cache_read_tokens)::bigint, sum(u.cost_micros)::bigint
    from public.usage_model_daily u
   where p_from is null or u.day >= p_from
   group by u.model
   order by 7 desc, 2 desc, 1;
$$;

-- /admin/cost's top accounts over the days on or after p_from (all time from
-- user_totals when null): the p_limit largest by cost, by tokens (input plus
-- output) and by requests, together, so the page can sort by any of the three
-- and still show the true top of each. Each comes with spend_state()'s
-- limits and spend, so the page shows the limit in force the way the gate
-- reads it. A deleted account's use is left out.
create or replace function public.admin_top_accounts(p_from date, p_limit integer)
returns table (user_id uuid, email text, requests bigint, input_tokens bigint, output_tokens bigint,
               cache_write_tokens bigint, cache_read_tokens bigint, cost_micros bigint,
               monthly_limit_micros bigint, month_cost_micros bigint,
               lifetime_limit_micros bigint, lifetime_cost_micros bigint,
               daily_limit_micros bigint, day_cost_micros bigint,
               first_build_done boolean, first_build_limit_micros bigint, first_build_cost_micros bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  with sums as (
    select ud.user_id, sum(ud.requests)::bigint as requests, sum(ud.input_tokens)::bigint as input_tokens,
           sum(ud.output_tokens)::bigint as output_tokens, sum(ud.cache_write_tokens)::bigint as cache_write_tokens,
           sum(ud.cache_read_tokens)::bigint as cache_read_tokens, sum(ud.cost_micros)::bigint as cost_micros
      from public.usage_daily ud
     where p_from is not null and ud.day >= p_from
     group by ud.user_id
    union all
    select ut.user_id, ut.requests, ut.input_tokens, ut.output_tokens, ut.cache_write_tokens,
           ut.cache_read_tokens, ut.cost_micros
      from public.user_totals ut
     where p_from is null and ut.requests > 0
  ), ranked as (
    select s.*,
           row_number() over (order by s.cost_micros desc, s.requests desc, s.user_id) as by_cost,
           row_number() over (order by s.input_tokens + s.output_tokens desc, s.user_id) as by_tokens,
           row_number() over (order by s.requests desc, s.user_id) as by_requests
      from sums s
  )
  select r.user_id, p.email, r.requests, r.input_tokens, r.output_tokens, r.cache_write_tokens,
         r.cache_read_tokens, r.cost_micros, s.monthly_limit_micros, s.month_cost_micros,
         s.lifetime_limit_micros, s.lifetime_cost_micros, s.daily_limit_micros, s.day_cost_micros,
         s.first_build_done, s.first_build_limit_micros, s.first_build_cost_micros
    from ranked r
    join public.profiles p on p.id = r.user_id
    cross join lateral public.spend_state(r.user_id) s
   where least(r.by_cost, r.by_tokens, r.by_requests) <= least(greatest(coalesce(p_limit, 50), 1), 500)
   order by r.cost_micros desc, r.requests desc, r.user_id;
$$;

-- PostgREST grants EXECUTE on public functions to anon and authenticated by
-- default. These change totals and read across accounts, so only the server
-- may call them.
revoke all on function public.device_auth(text) from public, anon, authenticated;
revoke all on function public.record_usage(uuid, uuid, text, text, bigint, bigint, bigint, bigint, bigint, integer, integer, text) from public, anon, authenticated;
revoke all on function public.meter_batch(uuid, uuid, text, jsonb, integer, integer, text) from public, anon, authenticated;
revoke all on function public.reserve_spend(uuid, bigint, integer, boolean) from public, anon, authenticated;
revoke all on function public.charge_unmetered_batch(uuid, text) from public, anon, authenticated;
revoke all on function public.record_app_events(uuid, uuid, jsonb) from public, anon, authenticated;
revoke all on function public.set_memory_totals(uuid) from public, anon, authenticated;
revoke all on function public.set_org_memory_totals(uuid) from public, anon, authenticated;
revoke all on function public.create_organization(text, text, uuid, text) from public, anon, authenticated;
revoke all on function public.org_drop_member(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.accept_org_invite(uuid, uuid) from public, anon, authenticated;
revoke all on function public.admin_table_stats() from public, anon, authenticated;
revoke all on function public.admin_storage_usage() from public, anon, authenticated;
revoke all on function public.spend_state(uuid) from public, anon, authenticated;
revoke all on function public.reset_first_build(uuid) from public, anon, authenticated;
revoke all on function public.admin_usage_by_model(date) from public, anon, authenticated;
revoke all on function public.admin_top_accounts(date, integer) from public, anon, authenticated;
grant execute on function public.device_auth(text) to service_role;
grant execute on function public.record_usage(uuid, uuid, text, text, bigint, bigint, bigint, bigint, bigint, integer, integer, text) to service_role;
grant execute on function public.meter_batch(uuid, uuid, text, jsonb, integer, integer, text) to service_role;
grant execute on function public.reserve_spend(uuid, bigint, integer, boolean) to service_role;
grant execute on function public.charge_unmetered_batch(uuid, text) to service_role;
grant execute on function public.record_app_events(uuid, uuid, jsonb) to service_role;
grant execute on function public.set_memory_totals(uuid) to service_role;
grant execute on function public.set_org_memory_totals(uuid) to service_role;
grant execute on function public.create_organization(text, text, uuid, text) to service_role;
grant execute on function public.org_drop_member(uuid, uuid, text) to service_role;
grant execute on function public.accept_org_invite(uuid, uuid) to service_role;
grant execute on function public.admin_table_stats() to service_role;
grant execute on function public.admin_storage_usage() to service_role;
grant execute on function public.spend_state(uuid) to service_role;
grant execute on function public.reset_first_build(uuid) to service_role;
grant execute on function public.admin_usage_by_model(date) to service_role;
grant execute on function public.admin_top_accounts(date, integer) to service_role;
