# Coere — marketing site

Landing page for **Coere**, unified memory for AI. Coere is a Chrome extension
that carries your context across every AI you use, so a new chat in any agent
picks up where the last one left off.

Built with Next.js (App Router) + TypeScript + Tailwind CSS v4 + Motion.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint
```

## Configuration

Copy `.env.example` to `.env.local` and set the canonical site URL — it feeds
canonical tags, Open Graph metadata, `robots.txt`, and `sitemap.xml`.

```
NEXT_PUBLIC_SITE_URL=https://coere.ai
```

Site copy, links, the agent list, the example capsule, the illustrative token
and time costs, and founder details live in [`src/lib/site.ts`](src/lib/site.ts).
One thing to update at launch: `chromeStoreUrl` is empty, so every install
button falls back to an early-access mailto. Set it to the Chrome Web Store
listing and the buttons point at the store instead.

## Structure

```
src/app/layout.tsx        fonts, metadata, OG/Twitter cards
src/app/page.tsx          section composition, JSON-LD structured data
src/app/globals.css       brand tokens (blue scale, navy scale), orbit keyframes
src/lib/site.ts           copy, links, agents, costs, founders
src/lib/format.ts         token and duration formatting
public/*.svg              AI provider logos
public/chrome_webstore.png  install button icon
public/founders/          founder photos
public/banner.png         social share image
```

Sections, in page order:

| Component     | Anchor         | What it shows                                                         |
| ------------- | -------------- | --------------------------------------------------------------------- |
| `what-we-do`  | `#what-we-do`  | Headline, AI logos orbiting the mark                                  |
| `products`    | `#products`    | Coere Connect (Chrome extension) beside Coere Developer (API, MCP, SDK) |
| `who-we-are`  | `#who-we-are`  | Founders (Michelle and Edison), then the executive team (Sarah)       |

The nav in [`src/lib/site.ts`](src/lib/site.ts) has exactly three links, one per
anchor above. Product copy and team details (school, majors and short highlight
bullets, rendered by `team-profile`) live there too; a member without a `photo`
gets an initials avatar.

## The demo film

`/demo` is an unlisted page holding a 60 second product film built entirely in
HTML. Nothing links to it, it is `noindex`, and `robots.txt` disallows it.

- Space bar plays and pauses, `r` restarts, arrow keys jump five seconds, and
  the scrubber can be clicked or dragged.
- `/demo?t=24` starts at that second, which is how you grab a still.
- It plays on a fixed 1280x720 canvas that scales to the window, so it records
  cleanly at any size. For a video, screen record the stage at 1280x720.
- With `prefers-reduced-motion` it waits on the play button instead of
  autoplaying.

The film runs on named beats in
[`src/components/demo/timeline.ts`](src/components/demo/timeline.ts); React
re-renders only when a beat is crossed and every scene animates declaratively
from there. To retime a moment, change one number in `BEATS`. The film runs:

1. `scene-intro` — mark, name, and every model orbiting it.
2. `scene-workspace` — the ChatGPT to Claude transfer. A caption names each beat
   and the window you are not meant to be watching dims, so the focus is never
   ambiguous.
3. The montage: the same two windows cut between eight products, held perfectly
   still, cycling coding, research and writing. The first switch holds a second
   and each one after is a tenth faster until it settles at half a second. Left
   is always the original chat, right is always the capsule.
4. The zoom out. The cadence settles first and runs at half a second for
   several more cycles before the camera moves, then pulls back slowly over
   4.6 seconds. The pair is the middle cell of a 5 by 5 grid scaled up until
   this point, so pulling back reveals 24 more fully built pairs on different
   products, all still switching on the same beat. It holds fully wide for two
   seconds before anything else happens.
5. The wall blurs, `scene-dashboard` pops over it with the totals, then it
   clears and `scene-outro` delivers the line.

Everything shown on screen lives in
[`src/components/demo/data.ts`](src/components/demo/data.ts).

`orbit` sends each logo around a CSS motion path with `offset-rotate: 0deg`, so
the logos travel the ring while staying face up and no two animations can drift
out of sync.
Only `site-nav` and the reveal wrappers are client components; the comparison
and capsule sections are static. All motion respects
`prefers-reduced-motion`, and a `noscript` style reveals the scroll animations
when JavaScript is off.

Spend figures in `costs` are sourced (CloudZero State of AI Costs 2025, PNC
card data reported May 2026, Anthropic's published Claude Code per-developer
range); the Coere savings are estimates derived from the token and time numbers
in `src/lib/site.ts`. See the comment at the top of
[`src/components/costs.tsx`](src/components/costs.tsx).

## Deploying

The site is fully static. `npm run build` prerenders every route, so any host
that runs a Next.js build works (Vercel needs no configuration). Set
`NEXT_PUBLIC_SITE_URL` in the host environment before building.
