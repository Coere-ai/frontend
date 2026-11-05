import { setBackupSwitch } from "@/app/(site)/account/actions";

import { Part, Row, rowButtonClass } from "./rows";

/**
 * The two memory backup switches. Coere's Settings can turn them off; only
 * this page turns them on, signed in on coere.ai, so a token copied from a
 * browser cannot start sending memory here (docs/accounts.md 8.12).
 */
export function Backup({ sync, includeSensitive }: { sync: boolean; includeSensitive: boolean }) {
  return (
    <Part title="Memory backup" line="With the backup on, Coere keeps a copy of your memory file on coere.ai. Turning it off removes that copy.">
      <ul className="divide-y divide-neutral-100">
        <Row name="Back up memory to coere.ai" detail={sync ? "On" : "Off"}>
          <Switch field="sync" on={sync} />
        </Row>
        <Row name="Include sensitive memories" detail={!sync ? "Waits until the backup is on" : includeSensitive ? "On" : "Off"}>
          {sync ? <Switch field="includeSensitive" on={includeSensitive} /> : null}
        </Row>
      </ul>
    </Part>
  );
}

function Switch({ field, on }: { field: "sync" | "includeSensitive"; on: boolean }) {
  return (
    <form action={setBackupSwitch}>
      <input type="hidden" name={field} value={on ? "off" : "on"} />
      <button type="submit" className={rowButtonClass}>
        {on ? "Turn off" : "Turn on"}
      </button>
    </form>
  );
}
