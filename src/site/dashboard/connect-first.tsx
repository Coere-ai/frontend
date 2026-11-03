import type { ReactNode } from "react";

import { ButtonLink } from "@/site/ui/button";
import { ArrowUpRightIcon } from "@/site/ui/icons/interface-icons";

import { Wash } from "./panel";

/**
 * Where Coere is installed from. A placeholder until the store listing is
 * live: the search finds the listing once it is published.
 */
export const CHROME_STORE_URL = "https://chromewebstore.google.com/search/Coere";

/** The empty state of a new account: nothing to show until Coere runs in Chrome. */
export function ConnectFirst({ title = "Connect Coere in Chrome to start", children }: { title?: string; children?: ReactNode }) {
  return (
    <Wash>
      <p className="text-xl font-medium tracking-[-0.02em] text-neutral-950">{title}</p>
      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-neutral-500">
        {children ??
          "Add Coere to Chrome. When it installs, it opens coere.ai/connect in a new tab, and one press links it to this account. Your memory, chats and usage show here after that."}
      </p>
      <div className="mt-6">
        <ButtonLink href={CHROME_STORE_URL}>
          Get Coere for Chrome
          <ArrowUpRightIcon size={16} />
        </ButtonLink>
      </div>
    </Wash>
  );
}
