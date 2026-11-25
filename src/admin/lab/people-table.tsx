import type { LabAdminData } from "@/lib/admin/lab";
import { conditionOf } from "@/lib/lab/assign";
import { labCase } from "@/lib/lab/cases";
import { caseProgress } from "@/lib/lab/progress";

import { Card } from "./card";

/** Who is in the study, what they were given and how far each is, so the room can be run from one screen. */
export function PeopleTable({ data }: { data: LabAdminData }) {
  const optIns = data.people.filter((p) => p.launchOptIn).length;
  return (
    <Card title={`Students (${data.people.length})`} line={`${optIns} said yes to being early Coere Connect users.`}>
      {data.people.length === 0 ? (
        <p className="text-[12.5px] text-[color:var(--color-muted)]">Nobody has joined yet. Set a join code above and read it out.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[12.5px] text-[color:var(--color-ink)]">
            <thead className="text-[11px] tracking-[0.05em] uppercase text-[color:var(--color-muted)]">
              <tr>
                <th className="py-1.5 pr-3 font-medium">#</th>
                <th className="py-1.5 pr-3 font-medium">Username</th>
                <th className="py-1.5 pr-3 font-medium">Codes with AI</th>
                <th className="py-1.5 pr-3 font-medium">Case 1</th>
                <th className="py-1.5 pr-3 font-medium">Case 2</th>
                <th className="py-1.5 pr-3 font-medium">Early user</th>
              </tr>
            </thead>
            <tbody>
              {data.people.map((p) => (
                <tr key={p.userId} className="border-t" style={{ borderColor: "var(--color-border)" }}>
                  <td className="py-1.5 pr-3 tabular-nums">{p.joinIndex}</td>
                  <td className="py-1.5 pr-3 font-medium">{p.username}</td>
                  <td className="py-1.5 pr-3">{p.aiExperience}</td>
                  {p.cases.map((id) => {
                    const c = labCase(id);
                    const prog = c ? caseProgress(p, c, data.study.stage, data.work.filter((w) => w.userId === p.userId)) : null;
                    return (
                      <td key={id} className="py-1.5 pr-3">
                        {c?.name ?? id}, {conditionOf(p, id) === "coere" ? "with Coere" : "without"}
                        {prog ? <span className="text-[color:var(--color-muted)]"> ({prog.done}/{prog.total})</span> : null}
                      </td>
                    );
                  })}
                  <td className="py-1.5 pr-3">{p.launchOptIn ? "yes" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
