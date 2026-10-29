/**
 * The Coere Forge demo, step by step. The pictures are coere-v2's own v3
 * screenshots (docs/screenshots/v3), the code is sdk/python/examples/
 * context.py, and the terminal lines are what it printed in context.png.
 */
export type ForgeStep = { key: string; label: string; title: string; text: string };

export const forgeSteps: ForgeStep[] = [
  { key: "key", label: "Make a key", title: "Add an app on the dashboard", text: "Name it, tick what it may do, pick its sections and when it expires, and press Make token. The token shows once." },
  { key: "allow", label: "Or ask from code", title: "Your app asks, the person allows", text: "Coere.connect asks from your app's own code. The Apps page shows the same code, and Allow hands the token over once." },
  { key: "context", label: "Ask for context", title: "Context for what your user typed", text: "Send a draft and get back the memories Coere would add in front of it, and why each one goes." },
  { key: "sent", label: "See what it was sent", title: "Every send, on record", text: "Each app's row shows what it was sent, chat by chat, and Revoke stops it at once." },
];

export const forgeShots = {
  key: { src: "/preview/images/forge/add-app.webp", width: 1040, height: 1192, alt: "The Add an app dialog with a name, what the app may do, its sections and when its token expires" },
  allow: { src: "/preview/images/forge/allow-app.webp", width: 1856, height: 678, alt: "The Apps page asking Allow planner to access Coere memory, with the code the app shows and Deny and Allow" },
  sent: { src: "/preview/images/forge/apps-sent.webp", width: 1856, height: 1500, alt: "The planner's row open on What it was sent, with each chat and the memories it got by their place" },
  apps: { src: "/preview/images/forge/apps.webp", width: 1856, height: 600, alt: "Apps with a token, with event-planner, what it may do and when it was last used" },
} as const;

/** sdk/python/examples/context.py, without its docstring. */
export const contextPy = `import sys

from coere import coere


def main(draft: str) -> None:
    ctx = coere.context.for_draft(draft)
    print(ctx.block, end="")
    print(f"From {ctx.from_chats} {'chat' if ctx.from_chats == 1 else 'chats'}")
    for item in ctx.items:
        print(f"  {' / '.join(item.path)}: {item.why}")`;

export const contextCommand = `uv run context.py "dinner with Elena Lindqvist and Silas Haddad on Friday"`;

export const contextOutput = `[Context from Coere, my saved memory. Use it if it helps.]
About me
- You work at Kestrel Analytics as a lead research assistant.
- Your name is Maya Collins.
- Your employer is Kestrel Analytics.
- Working on Sparrowhawk.
People / Elena Lindqvist
- Elena Lindqvist works at Northwind Clinic. (ChatGPT, Aug 3, 2026)
- Elena Lindqvist is your cousin. (Claude, Jul 13, 2026)
People / Silas Haddad
- Silas Haddad works at Sunfield Bakery. (Claude, Aug 12, 2026)
Plans and deadlines / Coffee with Elena Lindqvist
- Coffee with Elena Lindqvist is on Aug 26 at 12:30pm. (Gemini, Aug 17, 2026)
[End of context from Coere]

From 8 chats
  About me: Goes with the first message of every chat
  People / Elena Lindqvist: The draft names it
  People / Silas Haddad: The draft names it
  Plans and deadlines / Coffee with Elena Lindqvist: The draft names it`;
