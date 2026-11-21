import assert from "node:assert/strict";
import { test } from "node:test";

import { BOOKING_URL, gmailComposeHref, isBookingHref, mailtoHref, outlookComposeHref, readMailto } from "./links";

const EMAIL = "coereagent@gmail.com";

test("Gmail's compose link names the address and the subject", () => {
  assert.equal(gmailComposeHref(EMAIL), "https://mail.google.com/mail/?view=cm&fs=1&to=coereagent@gmail.com&su=Coere");
  assert.equal(gmailComposeHref(EMAIL, "Coere demo"), "https://mail.google.com/mail/?view=cm&fs=1&to=coereagent@gmail.com&su=Coere%20demo");
});

test("Outlook's compose link names the address and the subject", () => {
  assert.equal(outlookComposeHref(EMAIL), "https://outlook.office.com/mail/deeplink/compose?to=coereagent@gmail.com&subject=Coere");
  assert.equal(outlookComposeHref(EMAIL, "Hi & thanks"), "https://outlook.office.com/mail/deeplink/compose?to=coereagent@gmail.com&subject=Hi%20%26%20thanks");
});

test("the mailto link keeps the address readable and encodes the subject", () => {
  assert.equal(mailtoHref(EMAIL), "mailto:coereagent@gmail.com?subject=Coere");
  assert.equal(mailtoHref(EMAIL, "Coere demo?"), "mailto:coereagent@gmail.com?subject=Coere%20demo%3F");
});

test("a subject cannot slip another field into a compose link", () => {
  const href = gmailComposeHref(EMAIL, "x&to=someone@else.com");
  assert.equal(new URL(href).searchParams.getAll("to").join(","), EMAIL);
});

test("only mail to the team's address opens the pop up, with its subject", () => {
  assert.deepEqual(readMailto(`mailto:${EMAIL}`, EMAIL), { subject: "Coere" });
  assert.deepEqual(readMailto(`MAILTO:CoereAgent@Gmail.com?subject=Coere%20Solutions%20demo`, EMAIL), { subject: "Coere Solutions demo" });
  assert.deepEqual(readMailto(`mailto:coereagent%40gmail.com?subject=`, EMAIL), { subject: "Coere" });
  assert.equal(readMailto("mailto:someone@else.com", EMAIL), null);
  assert.equal(readMailto("/about", EMAIL), null);
  assert.equal(readMailto("mailto:%E0%A4%A", EMAIL), null);
});

test("the booking page is recognized in the forms people link it", () => {
  assert.ok(isBookingHref(BOOKING_URL));
  assert.ok(isBookingHref(`${BOOKING_URL}/`));
  assert.ok(isBookingHref(`${BOOKING_URL}?month=2026-12`));
  assert.ok(isBookingHref("https://app.cal.com/edison-law-lz5s63/coere-demo"));
  assert.ok(!isBookingHref("https://cal.com/someone-else/coere-demo"));
  assert.ok(!isBookingHref("http://cal.com/edison-law-lz5s63/coere-demo"));
  assert.ok(!isBookingHref("https://cal.com.evil.test/edison-law-lz5s63/coere-demo"));
  assert.ok(!isBookingHref("/pricing"));
});
