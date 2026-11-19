import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { connectedExtensionId, EXTENSION_SIGN_OUT, signOutExtension, signOutThenSubmit } from "./extension-sign-out";

const ID = "a".repeat(32);

describe("connectedExtensionId", () => {
  it("reads the coere_ext cookie among others", () => {
    assert.equal(connectedExtensionId(`coere_signed_in=1; coere_ext=${ID}; other=x`), ID);
  });

  it("refuses a malformed id or no cookie", () => {
    assert.equal(connectedExtensionId("coere_ext=not-an-id"), null);
    assert.equal(connectedExtensionId(`xcoere_ext=${ID}`), null);
    assert.equal(connectedExtensionId(""), null);
  });
});

describe("signOutExtension", () => {
  it("asks the connected extension with the one fixed message", async () => {
    const sent: Array<[string, unknown]> = [];
    await signOutExtension(`coere_ext=${ID}`, async (id, message) => {
      sent.push([id, message]);
      return { ok: true, answer: { ok: true } };
    });
    assert.deepEqual(sent, [[ID, EXTENSION_SIGN_OUT]]);
    assert.deepEqual(EXTENSION_SIGN_OUT, { type: "coere.sign_out" });
  });

  it("asks nobody without a connected extension, and never throws", async () => {
    let asked = 0;
    await signOutExtension("", async () => {
      asked++;
      return { ok: false, reason: "missing" };
    });
    assert.equal(asked, 0);
    await signOutExtension(`coere_ext=${ID}`, async () => Promise.reject(new Error("gone")));
  });
});

/**
 * A form as a browser runs one: requestSubmit is ignored while the form
 * fires its submit event, and promise callbacks run between that event's
 * listeners. `press` fires the event: the handler runs, then the microtask
 * queue drains while the form is still firing, then the event ends.
 */
function browserForm() {
  let firing = false;
  let submitted = 0;
  return {
    requestSubmit: () => {
      if (!firing) submitted++;
    },
    async press(handler: () => void) {
      firing = true;
      handler();
      for (let i = 0; i < 20; i++) await Promise.resolve();
      firing = false;
    },
    get submitted() {
      return submitted;
    },
  };
}

const nextTask = () => new Promise((resolve) => setTimeout(resolve, 5));

describe("signOutThenSubmit", () => {
  it("submits again once the press's own submit event is over, with no Coere connected", async () => {
    const form = browserForm();
    await form.press(() => void signOutThenSubmit("coere_signed_in=1", async () => ({ ok: false, reason: "missing" }), () => form.requestSubmit()));
    await nextTask();
    assert.equal(form.submitted, 1);
  });

  it("submits again when the browser has no extension bridge and the ask settles at once", async () => {
    const form = browserForm();
    await form.press(() => void signOutThenSubmit(`coere_ext=${ID}`, () => Promise.resolve({ ok: false, reason: "missing" }), () => form.requestSubmit()));
    await nextTask();
    assert.equal(form.submitted, 1);
  });

  it("asks the connected Coere before it submits", async () => {
    const order: string[] = [];
    await signOutThenSubmit(
      `coere_ext=${ID}`,
      async () => {
        order.push("asked");
        return { ok: true, answer: { ok: true } };
      },
      () => order.push("submitted"),
      (run) => run(),
    );
    assert.deepEqual(order, ["asked", "submitted"]);
  });
});
