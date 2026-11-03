-- Coere site analytics: the full schema.
--
-- The same statements as migrations/20261103000000_coere_site_analytics.sql,
-- kept here so the whole schema can be read in one place. When the schema
-- changes, add a new migration and bring this file up to date with it.
--
-- Paste into the Supabase SQL editor and run, or apply the migration with
-- the Supabase CLI. Safe to run again: every statement is idempotent (create
-- ... if not exists, create or replace, drop before add), so a second run
-- changes nothing.
--
-- This is the Optagon landing page's four analytics migrations combined, in
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
-- it names when it is created, so it can only come after them.
--
-- Everything is anonymous: there are no accounts on this site, so nothing here
-- identifies a person. The visitor id is a random string the browser keeps in
-- localStorage whose only job is to tell a returning browser from a new one.
--
-- Every table is written ONLY by the server, with the secret key, from
-- POST /api/site/track. Row Level Security is enabled with no policies at all,
-- which denies every anon and authenticated request by design: the browser
-- never talks to this database, so there is nothing to grant.

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
