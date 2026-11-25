-- Coere Lab: the student study of Coere Connect (docs/lab.md).
--
-- Runs after 20261124000000_build_lane_holds.sql. Paste into the Supabase SQL
-- editor and run. It only adds: three tables, a sequence and its function, and one
-- site_settings row.
-- Nothing is dropped, rewritten or renamed. Safe to run again: a second run
-- changes nothing. `npm run db:check` runs every file twice against a local
-- Postgres and tests what they build.
--
-- Every table is written only by the site's server with the secret key,
-- after it has checked the person's session. Row Level Security is on with
-- no policy, so a browser that somehow reached the database would read and
-- write nothing.


-- Who joined the study, and what they were given (section 3).
--
-- The pair, both cases and the first condition are stored, not worked out
-- again from join_index, so a later change to the code never moves a student
-- to a different case halfway through. join_index comes from
-- lab_next_join_index() before the row is written, since the server needs it
-- to pick the assignment, and a sequence never hands two students the same one.
create sequence if not exists public.lab_join_seq as integer minvalue 0 start with 0;

create table if not exists public.lab_participants (
  user_id         uuid        primary key references public.profiles (id) on delete cascade,
  join_index      integer     not null unique,
  pair            text        not null,
  first_case      text        not null,
  second_case     text        not null,
  first_condition text        not null,
  consent_version text        not null,
  consented_at    timestamptz not null default now(),
  -- How often they already code with an AI: none, weekly or daily.
  ai_experience   text        not null,
  launch_opt_in   boolean     not null default false,
  created_at      timestamptz not null default now(),

  constraint lab_participants_pair_known      check (pair in ('build', 'strategy')),
  constraint lab_participants_cases_differ    check (first_case <> second_case),
  constraint lab_participants_case_sane       check (first_case ~ '^[a-z0-9_]{1,32}$' and second_case ~ '^[a-z0-9_]{1,32}$'),
  constraint lab_participants_condition_known check (first_condition in ('coere', 'baseline')),
  constraint lab_participants_consent_sane    check (consent_version ~ '^[a-z0-9_.]{1,16}$'),
  constraint lab_participants_experience_known check (ai_experience in ('none', 'weekly', 'daily'))
);


-- One row per student and task (section 4): when they opened it, when they
-- handed it in, what they said it took, and the operator's grade.
create table if not exists public.lab_work (
  user_id      uuid        not null references public.lab_participants (user_id) on delete cascade,
  case_id      text        not null,
  task_id      text        not null,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz,
  answer       text,
  -- Which AI they used, how many messages they sent, and how many times they
  -- had to explain the case again. Self reported: the site cannot see chats.
  ai_used      text,
  messages     smallint,
  reexplained  smallint,
  -- 1 to 5, asked only when the case ran with Coere on.
  coere_helped smallint,
  notes        text,
  score        smallint,
  score_notes  text,
  graded_at    timestamptz,

  primary key (user_id, case_id, task_id),
  constraint lab_work_ids_sane        check (case_id ~ '^[a-z0-9_]{1,32}$' and task_id ~ '^[a-z0-9_]{1,16}$'),
  constraint lab_work_answer_sane     check (answer is null or char_length(answer) <= 40000),
  constraint lab_work_ai_known        check (ai_used is null or ai_used in ('chatgpt', 'claude', 'both', 'other')),
  constraint lab_work_messages_sane   check (messages is null or messages between 0 and 500),
  constraint lab_work_reexplain_sane  check (reexplained is null or reexplained between 0 and 50),
  constraint lab_work_helped_sane     check (coere_helped is null or coere_helped between 1 and 5),
  constraint lab_work_notes_sane      check ((notes is null or char_length(notes) <= 2000) and (score_notes is null or char_length(score_notes) <= 2000)),
  constraint lab_work_score_sane      check (score is null or score between 0 and 100),
  constraint lab_work_submitted_after check (submitted_at is null or submitted_at >= started_at),
  constraint lab_work_answer_when_in  check (submitted_at is null or answer is not null)
);

create index if not exists lab_work_case_idx on public.lab_work (case_id, task_id);


-- The short survey after each case (section 5). Answers are one JSON object
-- so a question can change between sessions without a migration.
create table if not exists public.lab_surveys (
  user_id    uuid        not null references public.lab_participants (user_id) on delete cascade,
  case_id    text        not null,
  answers    jsonb       not null,
  created_at timestamptz not null default now(),

  primary key (user_id, case_id),
  constraint lab_surveys_case_sane    check (case_id ~ '^[a-z0-9_]{1,32}$'),
  constraint lab_surveys_answers_sane check (jsonb_typeof(answers) = 'object' and pg_column_size(answers) <= 8192)
);


create or replace function public.lab_next_join_index()
returns integer
language sql
volatile
security invoker
set search_path = ''
as $$
  select nextval('public.lab_join_seq')::integer;
$$;

revoke all on function public.lab_next_join_index() from public, anon, authenticated;
grant execute on function public.lab_next_join_index() to service_role;
revoke all on sequence public.lab_join_seq from public, anon, authenticated;
grant usage, select on sequence public.lab_join_seq to service_role;


alter table public.lab_participants enable row level security;
alter table public.lab_work         enable row level security;
alter table public.lab_surveys      enable row level security;

revoke all on public.lab_participants, public.lab_work, public.lab_surveys from anon, authenticated;
grant select, insert, update, delete on public.lab_participants, public.lab_work, public.lab_surveys to service_role;


-- The study's own settings, beside the launch countdowns: the stage the
-- operator has opened (0 is closed, 1 to 4 below) and the join code students
-- type to enter. Stage 1 is the first case's part 1, 2 its part 2, 3 the
-- second case's part 1 and 4 its part 2. On conflict do nothing, so what the
-- operator set survives a rerun.
insert into public.site_settings (key, value) values
  ('lab.study', '{"stage": 0, "code": ""}')
on conflict (key) do nothing;
