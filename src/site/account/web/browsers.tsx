import { revokeAllBrowsers, revokeBrowser } from "@/app/(site)/account/actions";
import { ago } from "@/lib/dashboard/format";
import type { DeviceRow } from "@/lib/v1/devices-body";
import { buttonClass } from "@/site/ui/button";

import { ConfirmButton } from "./confirm-button";
import { Part, Row, rowButtonClass } from "./rows";

/**
 * Every browser Coere is connected in, each with Revoke, and one button
 * that signs them all out. This works from any browser, a phone included,
 * so a lost laptop can be cut off without Coere installed anywhere.
 */
export function Browsers({ devices }: { devices: DeviceRow[] }) {
  const live = devices.filter((d) => !d.revoked_at);
  return (
    <Part title="Browsers" line="Coere is connected in these browsers. Revoke one you lost or no longer use, and Coere there is signed out at once.">
      {live.length === 0 ? (
        <p className="text-[15px] text-neutral-500">No browser is connected.</p>
      ) : (
        <>
          <ul className="divide-y divide-neutral-100">
            {live.map((d) => (
              <Row
                key={d.id}
                name={d.name}
                detail={[`Token ending ${d.token_hint}`, d.extension_version ? `Coere ${d.extension_version}` : null, d.last_used_at ? `used ${ago(d.last_used_at)}` : `connected ${ago(d.created_at)}`]
                  .filter(Boolean)
                  .join(", ")}
              >
                <form action={revokeBrowser}>
                  <input type="hidden" name="deviceId" value={d.id} />
                  <ConfirmButton question={`Revoke ${d.name}? Coere in that browser will be signed out.`} className={rowButtonClass}>
                    Revoke
                  </ConfirmButton>
                </form>
              </Row>
            ))}
          </ul>
          <form action={revokeAllBrowsers} className="mt-5">
            <ConfirmButton question="Sign out Coere in every browser? Each one asks to connect again." className={buttonClass("secondary")}>
              Sign out every browser
            </ConfirmButton>
          </form>
        </>
      )}
    </Part>
  );
}
