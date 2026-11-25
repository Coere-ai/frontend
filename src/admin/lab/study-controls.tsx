import { saveLabStudyAction } from "@/app/(app)/admin/lab/actions";
import { Button, fieldClass, fieldStyle, Label } from "@/admin/controls";
import type { LabStudy } from "@/lib/lab/store";

import { Card } from "./card";

const STAGES = ["Closed", "1: first case, part 1", "2: first case, part 2", "3: second case, part 1", "4: second case, part 2"];

/** Opens the next stage at the start of each session, and sets the code students type to join. */
export function StudyControls({ study }: { study: LabStudy }) {
  return (
    <Card title="Session" line="Open one stage per session. Part 2 of a case waits for a later session, so memory has to carry over the gap.">
      <form action={saveLabStudyAction} className="flex flex-wrap items-end gap-3">
        <div className="w-[240px]">
          <Label htmlFor="lab-stage">Open stage</Label>
          <select id="lab-stage" name="stage" defaultValue={study.stage} className={fieldClass} style={fieldStyle}>
            {STAGES.map((s, i) => (
              <option key={s} value={i}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="w-[200px]">
          <Label htmlFor="lab-code">Join code</Label>
          <input id="lab-code" name="code" defaultValue={study.code} maxLength={32} placeholder="Empty: nobody can join" className={fieldClass} style={fieldStyle} />
        </div>
        <Button strong>Save</Button>
      </form>
    </Card>
  );
}
