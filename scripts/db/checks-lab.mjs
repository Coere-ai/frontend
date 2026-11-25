// Checks of the Coere Lab tables (docs/lab.md): lab_participants, lab_work
// and lab_surveys, the join index function and the lab.study setting. All
// three tables are server only, like the interest tables.

import { A } from "./checks-accounts.mjs";
import { as, equal, one, refused, rows } from "./harness.mjs";

const DENIED = /permission denied/;
const JOIN =
  "insert into public.lab_participants (user_id, join_index, pair, first_case, second_case, first_condition, consent_version, ai_experience) values ($1, public.lab_next_join_index(), $2, $3, $4, $5, 'v1', 'weekly')";

export async function checkLabTables(db) {
  equal(
    "the three lab tables have Row Level Security on and no policy",
    await rows(
      db,
      "lab rls",
      `select c.relname as name, c.relrowsecurity as rls, (select count(*)::int from pg_policy p where p.polrelid = c.oid) as policies
         from pg_class c join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname like 'lab\\_%' and c.relkind = 'r' order by 1`,
    ),
    [
      { name: "lab_participants", rls: true, policies: 0 },
      { name: "lab_surveys", rls: true, policies: 0 },
      { name: "lab_work", rls: true, policies: 0 },
    ],
  );
  equal("the study starts closed with no code", await rows(db, "lab setting", "select value ->> 'stage' as stage, value ->> 'code' as code from public.site_settings where key = 'lab.study'"), [{ stage: "0", code: "" }]);

  await as(db, "service_role", null, async () => {
    equal("join indexes start at 0", await one(db, "first index", "select public.lab_next_join_index()"), 0);
    equal("and count up", await one(db, "second index", "select public.lab_next_join_index()"), 1);
    await rows(db, "join", JOIN, [A, "build", "shiftwise", "ledgerly", "coere"]);
    equal("a student joins", await one(db, "joined", "select join_index from public.lab_participants where user_id = $1", [A]), 2);
    await refused(db, "the same two cases are refused", JOIN, /lab_participants_pkey|lab_participants_cases_differ/, [A, "build", "shiftwise", "shiftwise", "coere"]);
    await refused(db, "an unknown condition is refused", "update public.lab_participants set first_condition = 'maybe' where user_id = $1", /lab_participants_condition_known/, [A]);

    await rows(db, "start", "insert into public.lab_work (user_id, case_id, task_id) values ($1, 'shiftwise', 't1')", [A]);
    await refused(db, "a task handed in with no answer is refused", "update public.lab_work set submitted_at = now() where user_id = $1", /lab_work_answer_when_in/, [A]);
    await rows(db, "submit", "update public.lab_work set submitted_at = now(), answer = 'create table x ();', ai_used = 'chatgpt', messages = 6, reexplained = 0, coere_helped = 4 where user_id = $1", [A]);
    await refused(db, "a grade over 100 is refused", "update public.lab_work set score = 101 where user_id = $1", /lab_work_score_sane/, [A]);
    await refused(db, "a helped score of 6 is refused", "update public.lab_work set coere_helped = 6 where user_id = $1", /lab_work_helped_sane/, [A]);
    await refused(db, "an unknown AI is refused", "update public.lab_work set ai_used = 'bard' where user_id = $1", /lab_work_ai_known/, [A]);

    await rows(db, "survey", "insert into public.lab_surveys (user_id, case_id, answers) values ($1, 'shiftwise', '{\"ease\": 4}')", [A]);
    await refused(db, "survey answers must be an object", "insert into public.lab_surveys (user_id, case_id, answers) values ($1, 'ledgerly', '[1]')", /lab_surveys_answers_sane/, [A]);
  });

  for (const role of ["anon", "authenticated"]) {
    await as(db, role, role === "authenticated" ? A : null, async () => {
      await refused(db, `${role} cannot read lab_work`, "select * from public.lab_work", DENIED);
      await refused(db, `${role} cannot join`, "insert into public.lab_participants (user_id, join_index, pair, first_case, second_case, first_condition, consent_version, ai_experience) values ($1, 99, 'build', 'a', 'b', 'coere', 'v1', 'none')", DENIED, [A]);
      await refused(db, `${role} cannot take a join index`, "select public.lab_next_join_index()", DENIED);
    });
  }
}

/** After a rerun over real rows: the student, their work and the setting are all still there. */
export async function checkLabKept(db) {
  equal("a rerun keeps the lab rows", await one(db, "lab kept", "select ((select count(*) from public.lab_participants) + (select count(*) from public.lab_work) + (select count(*) from public.lab_surveys))::int"), 3);
  // 3, not 2: the refused second join above still took an index, as a sequence does.
  equal("a rerun does not restart join indexes", await one(db, "seq kept", "select last_value::int from public.lab_join_seq"), 3);
}
