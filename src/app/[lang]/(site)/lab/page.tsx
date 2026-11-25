import type { Metadata } from "next";

import { requireUser } from "@/lib/auth/user";
import { labCase } from "@/lib/lab/cases";
import { caseProgress } from "@/lib/lab/progress";
import { readParticipant, readStudy, readSurveyDone, readWork } from "@/lib/lab/store";
import { supabaseConfigured } from "@/lib/supabase";
import { JoinForm } from "@/site/lab/join-form";
import { LabShell } from "@/site/lab/lab-shell";
import { OptIn } from "@/site/lab/opt-in";
import { ButtonLink } from "@/site/ui/button";
import Link from "@/site/i18n/link";
import { requireEnglish } from "@/site/i18n/server";

export const metadata: Metadata = {
  title: "Coere Lab",
  description: "Try Coere Connect on real startup case studies before launch.",
  robots: { index: false, follow: false },
};

/** Per request: it reads the session and the student's own rows. */
export const dynamic = "force-dynamic";

/**
 * /lab: the study's front door (docs/lab.md). Signed out, it sends the
 * student to sign in and back. Not joined, it shows the join form. Joined,
 * it lists their two cases, which one runs with Coere, and how far along
 * they are, so a student coming back for session 3 knows where to go.
 */
export default async function LabPage() {
  await requireEnglish();
  const user = await requireUser("/lab");
  if (!supabaseConfigured()) return <LabShell title="Coere Lab" line="The study is not set up on this site yet." />;

  const [study, me] = await Promise.all([readStudy(), readParticipant(user.id)]);
  if (!me) {
    return (
      <LabShell title="Coere Lab" line="Work two startup case studies with ChatGPT and Claude over a few sessions. One case runs with Coere Connect and one without, so we can see what Coere really changes.">
        {study.code ? <JoinForm /> : <p className="text-[15px] text-white/65">The study is not open yet. Come back when the session starts.</p>}
      </LabShell>
    );
  }

  const [work, surveys] = await Promise.all([readWork(user.id), readSurveyDone(user.id)]);
  return (
    <LabShell title="Your cases" line={study.stage === 0 ? "The next session has not started yet. Your cases open when it does." : `Session stage ${study.stage} of 4 is open.`}>
      <Setup />
      <ol className="mt-10 space-y-4">
        {me.cases.map((id) => {
          const c = labCase(id);
          if (!c) return null;
          const p = caseProgress(me, c, study.stage, work);
          const surveyDue = p.finished && !surveys.includes(c.id);
          return (
            <li key={id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <div>
                <p className="text-[13px] text-white/55">
                  Case {p.slot}, {p.condition === "coere" ? "with Coere" : "without Coere"}
                </p>
                <p className="mt-1 text-[20px] font-medium text-white">{c.name}</p>
                <p className="text-[14px] text-white/60">{c.tagline}</p>
                <p className="mt-2 text-[14px] text-white/75">
                  {p.open === 0 ? "Not open yet" : `${p.done} of ${p.total} tasks handed in${surveyDue ? ". The survey is waiting." : ""}`}
                </p>
              </div>
              {p.open > 0 ? (
                <ButtonLink href={`/lab/${c.id}`} variant={p.finished ? "secondary" : "primary"}>
                  {p.finished ? "Review" : "Open the case"}
                </ButtonLink>
              ) : null}
            </li>
          );
        })}
      </ol>
      <OptIn on={me.launchOptIn} />
    </LabShell>
  );
}

/** The one time setup every student needs before the first case. */
function Setup() {
  return (
    <div className="rounded-2xl border border-white/10 p-5 text-[15px] leading-relaxed text-white/75">
      <p className="font-medium text-white">Before your first case</p>
      <ol className="mt-2 list-decimal space-y-1 pl-5">
        <li>
          Install Coere Connect from{" "}
          <Link href="/install" className="text-brand-400 underline underline-offset-2">
            the install page
          </Link>{" "}
          and connect it to this account when it asks.
        </li>
        <li>Sign in to ChatGPT and Claude in the same Chrome profile.</li>
        <li>Each case page says which Coere switches to set for it. Set them before you start.</li>
      </ol>
    </div>
  );
}
