# Coere Lab: the student study of Coere Connect

Status: built for the pre launch sessions in late November 2026.

Coere Lab is a small study at `coere.ai/lab`. 10 to 15 student developers
work two startup case studies with ChatGPT and Claude on the web, over
several sessions. One case runs with Coere Connect on and the matched case
runs with it paused. The study answers four questions: did Coere help, where
did people get stuck, what data can improve memory and search, and who wants
to keep using Connect after launch.

## 1. Why it is built this way

- **Connect, not Forge.** Students use the web apps Connect already reads
  (chatgpt.com and claude.ai). Codex and Claude Code are out of scope: Connect
  has no adapter for them.
- **A crossover, not two groups.** Each student works one case with Coere and
  its twin without it. With about 12 people, a with and without group split
  would say nothing. The same person on the same task shape says something.
- **Matched pairs.** Shiftwise and Ledgerly (build) have the same five task
  shapes, the same number of rules and different domains. So do Greenbox and
  Parcelpoint (strategy). A student only ever sees the two cases of one pair.
- **Stages, not self pacing.** Part 2 of each case opens in a later session,
  so the case has to survive a gap. That gap is where memory matters most.
- **Starter chat, no extension change.** The packet goes into Coere as one
  pasted chat that Connect saves like any other. Nothing changed in the
  extension the week of launch.

## 2. What runs where

| Part | Path |
|---|---|
| Cases, assignment, stages, progress, summaries | `src/lib/lab/` (pure, tested) |
| Server reads and writes | `src/lib/lab/store.ts`, `src/lib/admin/lab.ts` |
| Student pages | `src/app/[lang]/(site)/lab/`, `src/site/lab/` |
| Admin page and CSV | `src/app/(app)/admin/lab/`, `src/admin/lab/`, `/api/admin/lab/csv` |
| Tables | `supabase/migrations/20261125000000_lab.sql` |

Every table is server only: Row Level Security on, no policy, written with
the secret key after the page or action checks the session. `/lab` goes
through the proxy like `/account`.

## 3. Assignment

Join number `n` comes from a sequence. Pair, case order and which case gets
Coere each flip on a different bit of `n`, so every 8 students cover all 8
combinations. The assignment is stored on the row, so a later code change
never moves a student.

## 4. What a student does

1. Signs up or signs in on coere.ai, opens `/lab`, types the join code and
   agrees to the consent text.
2. Installs Coere Connect and connects it to the same account.
3. Opens their first case. The page says which Coere switches to set:
   - **With Coere**: Add my context to chats on, Save new chats as they
     happen on. Paste the starter chat into ChatGPT, press Extract chat if
     Coere has not saved it.
   - **Without Coere**: both switches off, no search sheet or Transfer.
4. For each task: Start (the clock starts), work in the named AI, hand in the
   answer with the AI used, messages sent and times they explained the case
   again.
5. After the last task of a case, a short survey.

## 5. Running a session

On `/admin/lab`:

1. Before the first session, set a join code and save. An empty code lets
   nobody join.
2. Open stage 1 at the start of session 1, 2 at session 2, and so on.
   Stage 1 is the first case's part 1, 2 its part 2, 3 the second case's
   part 1, 4 its part 2. Students who finish early wait for the next stage.
3. Set each student's spend limit on `/admin/users` if the default allowance
   is too high or too low for the study. Model calls bill to Coere's key.

## 6. Reading the results

- **With Coere and Without Coere**: every hand in, with median minutes, how
  often the case was explained again, messages and mean score.
- **Same student, same task**: Coere minus without, over tasks a student
  handed in under both. This is the number to quote, with its n.
- **Flags** come from Coere's own `app_events` counts inside each case's
  time window: a case without Coere that still used memory import, search
  or Transfer, and a case with Coere where Coere never brought memory in.
  Count those out of the comparison or mention them.
- **Grading**: score each hand in 0 to 100 against the task's rubric. Most
  rubric lines check a detail from the packet, which is exactly what memory
  should carry.
- **CSV**: one row per student and task, without answers, for evals.

With 10 to 15 students these are signals, not proof. Say so when you quote
them.

## 7. Limits

- Time, messages and "explained again" are partly self reported. The clock
  only knows Start and Hand in.
- The site never sees chats. It cannot tell whether a student pasted the
  packet again in a Coere case, except through the "explained again" number.
- Capture works only on sites where Coere has seen how the page works; on
  others the student presses Extract chat.
