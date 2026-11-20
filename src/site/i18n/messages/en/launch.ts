import { launchCopy } from "@/site/content/launch";

/** The two coming soon pages, /install and /try-teams, with their countdown and sign up. */
const page = (product: keyof typeof launchCopy, metaTitle: string, metaDescription: string) => {
  const { title, here, line, hereLine } = launchCopy[product];
  return { title, here, line, hereLine, metaTitle, metaDescription };
};

export const launch = {
  connect: page("connect", "Install Coere", "Coere is coming soon to the Chrome Web Store."),
  teams: page("teams", "Try Coere for Teams", "Coere for Teams is coming soon, with a free week to try it."),
  opens: "Opens {moment}",
  at: "{date} at {time}",
  units: { days: "days", hours: "hours", minutes: "minutes", seconds: "seconds" },
  timer: "{days} days, {hours} hours, {minutes} minutes and {seconds} seconds left",
  counting: "Counting down",
  interested: "I'm interested",
  emailMe: "Email me when {name} opens",
  saving: "Saving",
  countMeIn: "Count me in",
  oneEmail: "One email when it opens. Nothing else.",
  thanks: "Thanks, you're in.",
  willEmail: "We'll email {email} when {name} opens.",
  addToChrome: "Add to Chrome",
};
