/**
 * The Coere Forge walkthrough. Every screen is the real dashboard or
 * terminal saved as HTML while coere-v2's v3 demo script ran: the live
 * page's own markup, styles and fonts, so the browser draws it sharp at
 * any size. The context screen is what Coere answered for "Help me prepare
 * for this interview". `focus` is the part to light, in CSS pixels of the
 * 1440 by 900 window the screens were saved in.
 */
export type WalkStep = {
  key: string;
  title: string;
  text: string;
  screen: string;
  alt: string;
  focus: { x: number; y: number; w: number; h: number };
};

const at = (name: string) => `/preview/screens/forge/${name}.html`;

export const walkSteps: WalkStep[] = [
  {
    key: "apps",
    title: "Apps on the dashboard",
    text: "Every app that can read memory is listed here, with what it may do and when it was last used. Add an app makes a token.",
    screen: at("apps"),
    alt: "The Apps page of the Coere dashboard with Apps with a token and its Add an app button",
    focus: { x: 258, y: 314, w: 892, h: 130 },
  },
  {
    key: "add",
    title: "Choose what it may do",
    text: "Name the app, tick what it may read, pick its sections and when it expires, then Make token. The token shows once.",
    screen: at("add-app"),
    alt: "The Add an app dialog with a name, what the app may do, its sections and when its token expires",
    focus: { x: 473, y: 268, w: 494, h: 214 },
  },
  {
    key: "connect",
    title: "Or ask from your app's code",
    text: "An app can ask for access itself. It prints a code, and the person checks the same code in Coere.",
    screen: at("connect"),
    alt: "A terminal running the event planner with --connect, which prints a code to check in Coere",
    focus: { x: 142, y: 115, w: 500, h: 58 },
  },
  {
    key: "allow",
    title: "The person allows it",
    text: "The Apps page shows the request with the same code. They can untick anything, then Allow hands the app its token once.",
    screen: at("allow"),
    alt: "The Apps page asking Allow planner to access Coere memory, with its code, what it may do, and Deny and Allow",
    focus: { x: 258, y: 69, w: 892, h: 345 },
  },
  {
    key: "context",
    title: "Context for what the user typed",
    text: "The app sends what the user typed and gets back the memories Coere would add in front of it, each with the chat it came from and why it goes.",
    screen: at("context"),
    alt: "A terminal running context.py for Help me prepare for this interview, printing the context Coere added and why each part goes",
    focus: { x: 142, y: 115, w: 1070, h: 470 },
  },
  {
    key: "sent",
    title: "Everything it was sent, on record",
    text: "Each app's row shows what it was sent, chat by chat, and Revoke stops it at once.",
    screen: at("sent"),
    alt: "The planner's row on the Apps page, open on What it was sent, chat by chat",
    focus: { x: 317, y: 465, w: 804, h: 429 },
  },
];
