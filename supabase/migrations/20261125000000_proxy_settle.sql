-- Coere: one settle call per answer, one call to store a new batch, a site
-- wide first build budget, the batch pending answer, a durable sign up limit
-- and a daily bound on feature counts per account.
--
-- Runs after 20261124000000_build_lane_holds.sql. Paste into the Supabase SQL
-- editor and run, before the site that calls it deploys. It only adds: two
-- tables, one nullable column, one trigger, one index, one seeded setting
-- and five functions, and
-- it replaces the body of the seven argument reserve_spend with the same
-- rules plus three (below). The four argument reserve_spend, record_usage and
-- record_app_events stay exactly as they were, so the live site keeps
-- working while this runs and until the new site is live, and the new site
-- falls back to the old calls on PostgREST's PGRST202 for the minutes before
-- this has run. Safe to run again: a second run changes nothing.
-- `npm run db:check` runs every migration twice against a local Postgres and
-- tests what they build (scripts/db/checks-proxy.mjs).
--
-- Why (docs/accounts.md 8.4, 8.9, 8.10, 16):
--
--   * settle_call records a message's usage rows and lets its hold go in one
--     transaction, so the answer waits one round trip instead of two, and a
--     failed record keeps the hold by construction. store_batch does the same
--     for a new batch's row, so its cost is never held twice.
--   * A site wide daily budget on first build spend (site_settings
--     budget.first_build_daily), checked in reserve_spend, so a wave of new
--     accounts cannot drain Coere's key. First build batches not yet metered
--     count in it, since a batch's cost lands only when its results are read. Each new account gets a $10 first
--     build, and sign up needs only a username.
--   * A batch that only the message holds in flight keep from fitting is
--     told `pending` (wait 10 s), not that its limit is spent (wait an hour).
--   * Sign up attempts are counted per address hash in the database, not per
--     server instance.
--   * Feature counts are held to a daily bound per account, across all of
--     its devices, since a device token costs nothing to mint.
--   * A hold that runs out without being let go is charged as spend, its
--     charge_micros or else its worst case, where it used to be deleted for
--     free: a call that outran the route could be repeated forever with
--     recorded spend stuck at nothing.


-- The site wide first build budget ------------------------------------------

-- First build spend across every account, per UTC day: what accounts still
-- in their first build were charged. Kept by the trigger below, so reading
-- it is one row. No foreign key, so a deleted account's spend stays.
create table if not exists public.first_build_daily (
  day         date        primary key,
  cost_micros bigint      not null default 0,
  updated_at  timestamptz not null default now()
);

alter table public.first_build_daily enable row level security;
revoke all on public.first_build_daily from anon, authenticated;
grant select, insert, update, delete on public.first_build_daily to service_role;

-- Adds each usage row of an account still in its first build to today's row.
create or replace function public.count_first_build_spend()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.user_id is not null and new.cost_micros > 0
     and exists (select 1 from public.profiles p where p.id = new.user_id and p.first_build_at is null) then
    insert into public.first_build_daily as t (day, cost_micros)
    values ((new.created_at at time zone 'utc')::date, new.cost_micros)
    on conflict (day) do update
      set cost_micros = t.cost_micros + excluded.cost_micros,
          updated_at  = now();
  end if;
  return new;
end;
$$;

drop trigger if exists coere_count_first_build_spend on public.usage_events;
create trigger coere_count_first_build_spend
  after insert on public.usage_events
  for each row execute function public.count_first_build_spend();

-- $1,000 a day across every first build: a hundred whole first builds. The
-- operator changes it in the SQL editor, or deletes the row for no ceiling.
-- do nothing, so a value the operator set survives a rerun.
insert into public.site_settings (key, value) values
  ('budget.first_build_daily', '{"micros": 1000000000}')
on conflict (key) do nothing;


-- Batches not yet metered, which the budget counts as in flight across the site.
create index if not exists ai_batches_unmetered_idx on public.ai_batches (user_id) where metered_at is null;


-- Expired holds -------------------------------------------------------------

-- What an expired hold is charged when it was never let go (section 8.10):
-- set by the proxy for a call that ended early, null for its worst case.
alter table public.spend_holds add column if not exists charge_micros bigint check (charge_micros >= 0);


-- The seven argument reserve_spend, with the budget and the batch pending answer.
--
-- As in 20261124000000_build_lane_holds, plus three rules:
--
--   * While the account is in its first build, the call is refused as
--     `site_budget` once today's first build spend across the site, plus the
--     reservations of every first build batch not yet metered, plus the
--     call's expected cost (a batch's worst case), passes
--     budget.first_build_daily. A spent limit of the account's own is named
--     first.
--   * A batch that does not fit only because of the message holds in flight
--     (spend and batches not yet metered alone leave room) is `pending`, as
--     a message is. Spend and batches filling the limit are still its name.
--   * An expired hold is charged before it is deleted (above).
create or replace function public.reserve_spend(
  p_user uuid, p_amount bigint, p_ttl_seconds integer, p_batch boolean,
  p_expected bigint, p_overrun bigint, p_max_live integer
) returns table (hold_id uuid, refused text)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_amount    bigint  := greatest(coalesce(p_amount, 0), 0);
  v_expected  bigint;
  v_overrun   bigint  := greatest(coalesce(p_overrun, 0), 0);
  v_max_live  integer := greatest(coalesce(p_max_live, 1), 1);
  v_batches   bigint;
  v_held      bigint;
  v_held_exp  bigint;
  v_live      integer;
  v_spent     text;
  v_pending   boolean := false;
  v_over      text;
  v_budget    bigint;
  v_id        uuid;
  s           record;
  l           record;
  r           record;
begin
  v_expected := case when p_batch then v_amount
                     else least(greatest(coalesce(p_expected, v_amount), 0), v_amount) end;

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

  -- A hold that ran out without being let go stands for a call whose cost was never recorded:
  -- one the proxy cut, kept, or that died with its function. It is charged, never dropped for free.
  for r in
    delete from public.spend_holds h where h.user_id = p_user and h.expires_at <= now()
    returning coalesce(h.charge_micros, h.amount_micros) as charge
  loop
    if r.charge > 0 then
      perform public.record_usage(p_user, null, 'message', null, 0, 0, 0, 0, r.charge, 504, 0, 'expired_hold');
    end if;
  end loop;

  -- Every live hold's worst case, its expected cost, and how many there are.
  select coalesce(sum(h.amount_micros), 0), coalesce(sum(coalesce(h.expected_micros, h.amount_micros)), 0), count(*)
    into v_held, v_held_exp, v_live
    from public.spend_holds h where h.user_id = p_user;
  -- Batches not yet metered stay against the limits whole, since one may hold for hours.
  v_batches := (select coalesce(sum(b.reserved_micros), 0) from public.ai_batches b
                 where b.user_id = p_user and b.metered_at is null);
  select * into s from public.spend_state(p_user);

  for l in
    select * from (values
      (1, 'lifetime'::text, s.lifetime_cost_micros, s.lifetime_limit_micros),
      (2, 'first_build'::text, s.first_build_cost_micros, case when not s.first_build_done then s.first_build_limit_micros end),
      (3, 'monthly'::text, s.month_cost_micros, case when s.first_build_done then s.monthly_limit_micros end),
      (4, 'daily'::text, s.day_cost_micros, case when s.first_build_done then s.daily_limit_micros end)
    ) as t (ord, name, spent, lim)
    where t.lim is not null
    order by t.ord
  loop
    if p_batch then
      -- A batch: the spent limit once spend and every batch not yet metered fill it, and
      -- pending when only the message holds in flight do.
      if v_spent is null and l.spent + v_held + v_batches + 1 > l.lim then
        if v_held > 0 and l.spent + v_batches + 1 <= l.lim then v_pending := true;
        else v_spent := l.name; end if;
      end if;
    else
      -- Spent: the call's expected cost does not fit even with nothing else in flight.
      if v_spent is null and l.spent + v_batches + v_expected > l.lim then v_spent := l.name; end if;
      -- Pending: the expected cost of the calls in flight fills the rest.
      if l.spent + v_batches + v_held_exp + v_expected > l.lim then v_pending := true; end if;
      -- Over: if every call in flight used its worst case, the limit would be passed by more than the overrun.
      if v_over is null and l.spent + v_batches + v_held + v_amount > l.lim + v_overrun then v_over := l.name; end if;
    end if;
  end loop;

  if v_spent is not null then
    return query select null::uuid, v_spent;
    return;
  end if;

  -- The site's first build budget for today, when one is set and the account is in its first build.
  if not s.first_build_done then
    select case when jsonb_typeof(ss.value -> 'micros') = 'number' then (ss.value ->> 'micros')::numeric::bigint end
      into v_budget
      from public.site_settings ss where ss.key = 'budget.first_build_daily';
    if v_budget is not null
       and coalesce((select f.cost_micros from public.first_build_daily f where f.day = (now() at time zone 'utc')::date), 0)
           + (select coalesce(sum(b.reserved_micros), 0) from public.ai_batches b
                join public.profiles p on p.id = b.user_id
               where b.metered_at is null and p.first_build_at is null)
           + v_expected > v_budget then
      return query select null::uuid, 'site_budget'::text;
      return;
    end if;
  end if;

  if v_pending then
    return query select null::uuid, 'pending'::text;
    return;
  end if;
  if not p_batch and v_live >= v_max_live then
    return query select null::uuid, 'concurrency'::text;
    return;
  end if;
  -- With nothing else in flight, the call alone passes the limit by more than the overrun: that is its spent limit.
  if v_over is not null then
    return query select null::uuid, case when v_live > 0 then 'concurrency' else v_over end;
    return;
  end if;

  insert into public.spend_holds (user_id, amount_micros, expected_micros, expires_at)
  values (p_user, v_amount, v_expected, now() + make_interval(secs => greatest(coalesce(p_ttl_seconds, 0), 1)))
  returning id into v_id;
  return query select v_id, null::text;
end;
$$;

revoke all on function public.reserve_spend(uuid, bigint, integer, boolean, bigint, bigint, integer) from public, anon, authenticated;
grant execute on function public.reserve_spend(uuid, bigint, integer, boolean, bigint, bigint, integer) to service_role;


-- One settle call per metered answer -----------------------------------------

-- Records a call's usage rows, one per model that ran, then lets its hold go,
-- in one transaction. A failed write rolls the delete back with it, so the
-- hold keeps counting until it runs out instead of vanishing with the cost
-- unrecorded. p_rows: [{"model", "input", "output", "cacheWrite",
-- "cacheRead", "costMicros"}], as meter_batch takes them. A null p_hold
-- only records.
create or replace function public.settle_call(
  p_hold uuid, p_user uuid, p_device uuid, p_kind text, p_rows jsonb,
  p_status integer, p_duration_ms integer, p_request_id text
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  r record;
begin
  for r in
    select * from jsonb_to_recordset(coalesce(p_rows, '[]'::jsonb)) as x(
      model text, input bigint, output bigint, "cacheWrite" bigint, "cacheRead" bigint, "costMicros" bigint)
  loop
    perform public.record_usage(p_user, p_device, p_kind, r.model,
      r.input, r.output, r."cacheWrite", r."cacheRead", r."costMicros",
      p_status, p_duration_ms, p_request_id);
  end loop;
  if p_hold is not null then
    delete from public.spend_holds h where h.id = p_hold and h.user_id = p_user;
  end if;
  return true;
end;
$$;

revoke all on function public.settle_call(uuid, uuid, uuid, text, jsonb, integer, integer, text) from public, anon, authenticated;
grant execute on function public.settle_call(uuid, uuid, uuid, text, jsonb, integer, integer, text) to service_role;


-- One call to store a new batch ----------------------------------------------

-- Stores a new batch as its caller's, with its worst case as its
-- reservation, and lets the create's hold go in the same transaction, so
-- the cost is never held twice: a hold left behind is charged its worst
-- case when it runs out, beside the batch's own reservation. Answers false,
-- and keeps the hold, when the id is already another account's.
create or replace function public.store_batch(
  p_hold uuid, p_id text, p_user uuid, p_device uuid, p_request_count integer, p_reserved bigint
) returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.ai_batches (id, user_id, device_id, request_count, reserved_micros)
  values (p_id, p_user, p_device, greatest(coalesce(p_request_count, 0), 0), greatest(coalesce(p_reserved, 0), 0))
  on conflict (id) do nothing;
  if not exists (select 1 from public.ai_batches b where b.id = p_id and b.user_id = p_user) then
    return false;
  end if;
  if p_hold is not null then
    delete from public.spend_holds h where h.id = p_hold and h.user_id = p_user;
  end if;
  return true;
end;
$$;

revoke all on function public.store_batch(uuid, text, uuid, uuid, integer, bigint) from public, anon, authenticated;
grant execute on function public.store_batch(uuid, text, uuid, uuid, integer, bigint) to service_role;


-- A durable sign up limit -----------------------------------------------------

-- Sign up attempts per address, as the keyed hash security_events uses, in a
-- fixed window. Server only. A row is reused when its window has ended.
create table if not exists public.sign_up_attempts (
  ip_hash      text        primary key,
  window_start timestamptz not null default now(),
  attempts     integer     not null default 0,

  constraint sign_up_attempts_hash_sane check (ip_hash ~ '^[0-9a-f]{1,64}$')
);

alter table public.sign_up_attempts enable row level security;
revoke all on public.sign_up_attempts from anon, authenticated;
grant select, insert, update, delete on public.sign_up_attempts to service_role;

-- Counts one attempt for the address and answers true when it is past
-- p_max in the window of p_window_seconds. Old rows are cleared now and then.
create or replace function public.hit_sign_up_limit(p_hash text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_window interval := make_interval(secs => greatest(coalesce(p_window_seconds, 0), 1));
  v_count  integer;
begin
  insert into public.sign_up_attempts as t (ip_hash, window_start, attempts)
  values (p_hash, now(), 1)
  on conflict (ip_hash) do update
    set attempts     = case when t.window_start <= now() - v_window then 1 else t.attempts + 1 end,
        window_start = case when t.window_start <= now() - v_window then now() else t.window_start end
  returning attempts into v_count;
  if random() < 0.01 then
    delete from public.sign_up_attempts a where a.window_start < now() - interval '1 day';
  end if;
  return v_count > greatest(coalesce(p_max, 1), 1);
end;
$$;

revoke all on function public.hit_sign_up_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.hit_sign_up_limit(text, integer, integer) to service_role;


-- A daily bound on feature counts --------------------------------------------

-- record_app_events, with each entry clamped to what the account has left
-- today across all its devices: p_day_count per kind, and p_day_saved tokens
-- saved in all. A device token costs nothing to mint, so a bound per device
-- would bound nothing. An entry with nothing left is dropped. Calls of one
-- account take turns, so two at once cannot both spend the same room. A call
-- with no account is not bounded; the events route always names one.
create or replace function public.record_app_events_capped(
  p_user uuid, p_device uuid, p_events jsonb, p_day_count integer, p_day_saved bigint
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_since  timestamptz := date_trunc('day', now() at time zone 'utc') at time zone 'utc';
  v_saved  bigint;
  v_out    jsonb := '[]'::jsonb;
  v_count  integer;
  v_keep   bigint;
  e        record;
begin
  if p_events is null or jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) = 0 then
    return;
  end if;
  if p_user is not null then
    perform pg_advisory_xact_lock(hashtextextended('app_events:' || p_user::text, 0));
  end if;
  v_saved := greatest(coalesce(p_day_saved, 0) - coalesce((select sum(a.tokens_saved) from public.app_events a
    where p_user is not null and a.user_id = p_user and a.created_at >= v_since), 0), 0);

  for e in
    select x.kind, x.count, x."tokensSaved" as saved
      from jsonb_to_recordset(p_events) as x(kind text, count integer, "tokensSaved" bigint)
  loop
    v_count := least(greatest(coalesce(e.count, 0), 0), greatest(coalesce(p_day_count, 0) - coalesce((select sum(a.count) from public.app_events a
      where p_user is not null and a.user_id = p_user and a.created_at >= v_since and a.kind = e.kind), 0), 0))::integer;
    continue when v_count < 1;
    if e.saved is null then
      v_out := v_out || jsonb_build_array(jsonb_build_object('kind', e.kind, 'count', v_count));
    else
      v_keep := least(greatest(e.saved, 0), v_saved);
      v_saved := v_saved - v_keep;
      v_out := v_out || jsonb_build_array(jsonb_build_object('kind', e.kind, 'count', v_count, 'tokensSaved', v_keep));
    end if;
  end loop;

  perform public.record_app_events(p_user, p_device, v_out);
end;
$$;

revoke all on function public.record_app_events_capped(uuid, uuid, jsonb, integer, bigint) from public, anon, authenticated;
grant execute on function public.record_app_events_capped(uuid, uuid, jsonb, integer, bigint) to service_role;

-- So the Data API sees the new functions at once.
notify pgrst, 'reload schema';
