import assert from "node:assert/strict";
import { test } from "node:test";

import { isTrackedPath } from "@/lib/analytics/tracked-paths";

import { PRIVACY_EFFECTIVE, PRIVACY_EFFECTIVE_LABEL, privacySections } from "./privacy";

const text = (id: string) => {
  const s = privacySections.find((x) => x.id === id);
  assert.ok(s, id);
  return [...s.paragraphs, ...(s.list ?? []), ...(s.after ?? [])].join(" ");
};

test("the policy names the backup controls as the Console's Account card labels them", () => {
  // apps/extension/src/console/settings/account-copy.ts in coere-v2.
  for (const label of ["Back up memory to coere.ai", "Include sensitive memories", "Delete memory copy"]) {
    assert.ok(text("backup").includes(label), label);
  }
});

test("the analytics section names every account page the tracker skips", () => {
  const pages: Array<[string, string]> = [
    ["/sign-in", "sign in"],
    ["/sign-up", "sign up"],
    ["/sign-out", "sign out"],
    ["/connect", "connect"],
    ["/account", "your account"],
    ["/dashboard", "dashboard"],
    ["/welcome", "welcome"],
  ];
  const said = text("analytics");
  for (const [path, name] of pages) {
    assert.equal(isTrackedPath(path), false, path);
    assert.ok(said.includes(name), name);
  }
});

test("the effective date reads as the date it holds", () => {
  const shown = new Date(`${PRIVACY_EFFECTIVE}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  assert.equal(PRIVACY_EFFECTIVE_LABEL, shown);
});

test("the policy says saved chat excerpts may go in front of a message before memory exists", () => {
  // coere-v2 import-context/smart/saved-chats.ts: local, redacted, and never from these chats.
  const said = text("extension");
  for (const words of ["Until your memory has enough in it", "short excerpts of the closest chats", "each with its chat's title, the AI site it came from and its date", "API keys, card numbers and passwords are taken out of the excerpts", "In Suggest, it only shows them", "temporary chat", "the chat you are in", "Include sensitive memories"]) {
    assert.ok(said.includes(words), words);
  }
  // The draft itself still never leaves the browser.
  assert.ok(said.includes("Your draft is never saved, never logged and never sent to coere.ai or to a model."));
});

test("the policy names what v4 sends through coere.ai and what the backup leaves out", () => {
  // coere-v2 docs/architecture.md "What each version sends", v4, and format/cloud-copy.ts.
  const sent = text("extension") + " " + text("requests");
  for (const words of ["Rewrite sends the text you selected", "Coere Forms and Apply", "workers send the text of every page they read", "the email you are answering", "each line you type to Cori", "for Ask for more", "for Ask Cori", "Add memory on any website", "Anthropic's id for the request"]) {
    assert.ok(sent.includes(words), words);
  }
  const backup = text("backup");
  for (const words of ["their addresses or the projects they sit in", "word for word from a chat", "Health, Money, and Beliefs and values sections are left out whole", "never in the copy"]) {
    assert.ok(backup.includes(words), words);
  }
});
