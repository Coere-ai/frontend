import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/user";
import { caseOpen, conditionOf } from "@/lib/lab/assign";
import { labCase } from "@/lib/lab/cases";
import { caseProgress, taskStatus } from "@/lib/lab/progress";
import { starterPrompt } from "@/lib/lab/starter";
import { readParticipant, readStudy, readSurveyDone, readWork } from "@/lib/lab/store";
import { supabaseConfigured } from "@/lib/supabase";
import { ConditionBox } from "@/site/lab/condition";
import { CopyButton } from "@/site/lab/copy-button";
import { LabShell } from "@/site/lab/lab-shell";
import { Packet } from "@/site/lab/packet";
import { SurveyForm } from "@/site/lab/survey-form";
import { TaskCard } from "@/site/lab/task-card";
import Link from "@/site/i18n/link";
import { requireEnglish } from "@/site/i18n/server";

export const metadata: Metadata = { title: "Coere Lab case", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/**
 * /lab/<case>: one case for one student. Only their own two cases open, and
 * only once a stage has opened one of its tasks; anything else is a 404, so
 * a student cannot read the matched case they work later and carry it over.
 */
export default async function LabCasePage({ params }: PageProps<"/[lang]/lab/[caseId]">) {
  await requireEnglish();
  const { caseId } = await params;
  const user = await requireUser(`/lab/${caseId}`);
  if (!supabaseConfigured()) redirect("/lab");
  const c = labCase(caseId);
  if (!c) notFound();
  const [study, me] = await Promise.all([readStudy(), readParticipant(user.id)]);
  if (!me) redirect("/lab");
  const condition = conditionOf(me, c.id);
  if (!condition || !caseOpen(me, c, study.stage)) notFound();

  const [work, surveys] = await Promise.all([readWork(user.id), readSurveyDone(user.id)]);
  const progress = caseProgress(me, c, study.stage, work);
  const starter = starterPrompt(c);

  return (
    <LabShell wide title={c.name} line={c.tagline}>
      <Link href="/lab" className="text-[14px] text-white/60 hover:text-white">
        Back to your cases
      </Link>
      <div className="mt-6">
        <ConditionBox condition={condition} />
      </div>

      <section className="mt-12">
        <h2 className="text-[22px] font-medium text-white">The packet</h2>
        <div className="mt-6">
          <Packet c={c} />
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-white/10 p-5">
        <h2 className="text-[18px] font-medium text-white">The starter chat</h2>
        <p className="mt-2 text-[15px] text-white/65">The whole packet as one message. Paste it into the AI before the first task.</p>
        <details className="mt-4">
          <summary className="cursor-pointer text-[14px] text-white/70">Show the text</summary>
          <pre className="mt-3 max-h-[320px] overflow-auto rounded-xl bg-black/40 p-4 text-[12px] leading-relaxed whitespace-pre-wrap text-white/80">{starter}</pre>
        </details>
        <div className="mt-4">
          <CopyButton text={starter} />
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-[22px] font-medium text-white">Tasks</h2>
        <p className="mt-2 text-[15px] text-white/65">
          Press Start when you begin a task, so the time is right. {progress.done} of {progress.total} handed in.
        </p>
        <ol className="mt-6 space-y-4">
          {c.tasks.map((t) => {
            const row = work.find((w) => w.caseId === c.id && w.taskId === t.id);
            return <TaskCard key={t.id} caseId={c.id} task={t} status={taskStatus(me, c, t.id, study.stage, work)} condition={condition} answer={row?.answer ?? null} />;
          })}
        </ol>
      </section>

      {progress.finished ? (
        <section className="mt-12 rounded-2xl border border-white/10 p-5">
          <h2 className="text-[18px] font-medium text-white">One last thing: the survey</h2>
          <p className="mt-2 mb-5 text-[15px] text-white/65">Two minutes, and every question can be skipped.</p>
          <SurveyForm caseId={c.id} condition={condition} done={surveys.includes(c.id)} />
        </section>
      ) : null}
    </LabShell>
  );
}
