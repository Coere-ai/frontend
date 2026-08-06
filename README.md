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

| Component            | Anchor          | What it shows                                            |
| -------------------- | --------------- | -------------------------------------------------------- |
| `hero` + `orbit`     | `#top`          | Headline, install button, AI logos orbiting the mark      |
| `comparison`         | `#how-it-works` | Two Chrome windows: pasted context vs a Coere capsule     |
| `capsule-flow`       |                 | Four past chats becoming one capsule, plus what it saves  |
| `how-it-works`       | `#why`          | Three steps, then fewer tokens / less time / nothing lost |
| `costs`              | `#costs`        | Consumer and enterprise AI spend against Coere savings    |
| `founders-section`   | `#team`         | Michelle and Edison                                       |
| `closing-cta`        |                 | Final install prompt                                      |

The nav in [`src/lib/site.ts`](src/lib/site.ts) has exactly four links, one per
anchor above.

`orbit` rotates with a CSS keyframe animation (compositor friendly, one
direction) and each logo counter-rotates at the same rate to stay upright.
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
