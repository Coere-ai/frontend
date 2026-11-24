-- Coere: spend holds that let a memory build run more calls at once.
--
-- Runs after 20261103000000_coere.sql. Paste into the Supabase SQL editor and
-- run, before the site that calls it deploys. It only adds: one nullable
-- column on spend_holds and a second reserve_spend that takes three more
-- arguments. Nothing is dropped, rewritten or renamed, and the four argument
-- reserve_spend the live site calls today stays exactly as it was, so the
-- site keeps working while this runs and until the new site is live. Safe to
-- run again: a second run changes nothing. `npm run db:check` runs both
-- files twice against a local Postgres and tests what they build.
--
-- Why (docs/accounts.md 8.10). Each metered call holds its worst case while it
-- runs, and a call is refused once spend plus every hold passes a limit. A
-- Sonnet call's worst case is about $0.26 while it really costs about a third
-- of that, so the $10 first build allowance was full with about 40 calls in
-- flight before anything was spent, and a build could not run faster. Now:
--
--   * Each hold keeps what its call will most likely cost (expected_micros)
--     beside its worst case (amount_micros).
--   * A message is refused as `pending` (wait 10 s) when spend plus every
--     hold's expected cost would pass a limit.
--   * It is refused as `concurrency` (wait 2 s) when spend plus every hold's
--     worst case would pass a limit by more than p_overrun, $5 on the site,
--     or when the account already has p_max_live holds, 128 on the site.
--     That bounds what calls in flight together can pass a limit by.
--   * A batch keeps the rules it had: its hold is its worst case.
--
-- With Sonnet at 16,000 max_tokens the $5 overrun is what binds: about 57
-- Sonnet calls fit the $10 first build at once before anything is spent and
-- about 38 at $5 spent. Near the limit the expected costs bind first, as
-- `pending`. A larger overrun, a tighter worst case or a lower Sonnet
-- max_tokens would let more run.


-- What the call will most likely cost, which reserve_spend weighs against
-- the limits. Null on a hold the four argument reserve_spend made, which is
-- read as its worst case.
alter table public.spend_holds add column if not exists expected_micros bigint check (expected_micros >= 0);


-- Holds a call's spend before it is forwarded, as the four argument
-- reserve_spend does, with the rules above. p_expected is the call's
-- expected cost, never read above p_amount, its worst case. Answers the
-- hold's id, or why not: the spent limit (lifetime, first_build, monthly or
-- daily, the one that lasts longest first), then `pending`, then
-- `concurrency`. A spent limit comes first so the extension waits for it as
-- it should, and `pending` before `concurrency` since near a limit the
-- longer wait is the right one.
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

  delete from public.spend_holds h where h.user_id = p_user and h.expires_at <= now();

  -- Every live hold's worst case, its expected cost, and how many there are.
  select coalesce(sum(h.amount_micros), 0), coalesce(sum(coalesce(h.expected_micros, h.amount_micros)), 0), count(*)
    into v_held, v_held_exp, v_live
    from public.spend_holds h where h.user_id = p_user;
  -- Batches not yet metered stay against the limits whole, since one may hold for hours.
  v_batches := (select coalesce(sum(b.reserved_micros), 0) from public.ai_batches b
                 where b.user_id = p_user and b.metered_at is null);
  select * into s from public.spend_state(p_user);

  -- Each limit in force, the one that lasts longest first, with the spend it
  -- is checked on. `spent` is the first limit the call does not fit; for a
  -- message, `over` is the first its worst case passes by more than the
  -- overrun, and `pending` whether the calls in flight fill any of them.
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
      -- A batch, as before: the spent limit once spend, every hold and every batch not yet metered fill it.
      if v_spent is null and l.spent + v_held + v_batches + 1 > l.lim then v_spent := l.name; end if;
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

-- Only the server may call it, as with the four argument one.
revoke all on function public.reserve_spend(uuid, bigint, integer, boolean, bigint, bigint, integer) from public, anon, authenticated;
grant execute on function public.reserve_spend(uuid, bigint, integer, boolean, bigint, bigint, integer) to service_role;

-- So the Data API sees the new function at once.
notify pgrst, 'reload schema';
