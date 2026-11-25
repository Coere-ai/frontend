import type { LabCase } from "@/lib/lab/types";

/** The case packet as a student reads it: the story, the facts, the data, the people and the rules. */
export function Packet({ c }: { c: LabCase }) {
  return (
    <div className="space-y-8 text-[15px] leading-relaxed text-white/80">
      <div className="space-y-3">
        {c.brief.map((p) => (
          <p key={p.slice(0, 40)}>{p}</p>
        ))}
      </div>
      <Block title="Facts">
        <dl className="divide-y divide-white/10">
          {c.facts.map((f) => (
            <div key={f.label} className="grid gap-1 py-2.5 sm:grid-cols-[160px_1fr]">
              <dt className="text-white/55">{f.label}</dt>
              <dd className="text-white">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Block>
      {c.table ? (
        <Block title={c.table.caption}>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-white/[0.05] text-white/60">
                <tr>
                  {c.table.columns.map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-white">
                {c.table.rows.map((r) => (
                  <tr key={r[0]}>
                    {r.map((v, i) => (
                      <td key={i} className="px-3 py-2 tabular-nums">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>
      ) : null}
      <Block title="People">
        <ul className="space-y-2">
          {c.people.map((p) => (
            <li key={p.name}>
              <span className="text-white">{p.name}</span>, {p.role}. {p.note}
            </li>
          ))}
        </ul>
      </Block>
      <Block title="Rules and limits">
        <ul className="list-disc space-y-1.5 pl-5">
          {c.constraints.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </Block>
      <Block title="Goals">
        <ul className="list-disc space-y-1.5 pl-5">
          {c.goals.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[13px] font-medium tracking-wide text-white/55 uppercase">{title}</h3>
      {children}
    </section>
  );
}
