# Coere — marketing site

Landing page for **Coere**, unified memory for AI. Coere is a Chrome extension
that carries your context across every AI you use, so a new chat in any agent
picks up where the last one left off.

Built with Next.js (App Router) + TypeScript + Tailwind CSS v4 + Motion, with
the hero and the Products picture rendered in 3D by three.js.

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

The canonical site URL defaults to `https://www.coere.ai`, the host the apex
`coere.ai` redirects to. It feeds the canonical link, Open Graph metadata,
structured data, `robots.txt` and `sitemap.xml`, so it must be the host that
actually serves the page. Override it only for another deployment:

```
NEXT_PUBLIC_SITE_URL=https://www.coere.ai
```

Optional search-engine verification tokens, emitted as meta tags when set:

```
GOOGLE_SITE_VERIFICATION=...   # Google Search Console, HTML tag method
BING_SITE_VERIFICATION=...     # Bing Webmaster Tools, msvalidate.01
```

Site copy, the search title and description, the profiles listed for search
engines, the agent list and founder details live in
[`src/lib/site.ts`](src/lib/site.ts).

## Structure

```
src/app/layout.tsx        fonts, site-wide metadata
src/app/page.tsx          section composition, canonical link, JSON-LD
src/app/*-image.png       the 1200x630 share image (Open Graph and X)
src/app/favicon.ico, icon.svg, icon1.png, apple-icon.png   icons
src/app/robots.ts, sitemap.ts, manifest.ts                 crawler and app files
src/app/globals.css       brand tokens (blue scale, navy scale, mist), keyframes
src/lib/site.ts           copy, links, agents, founders
src/components/three/     the 3D scenes (see below)
public/*.svg              AI provider logos, also extruded into 3D at runtime
public/chrome_webstore.png  install button icon
public/founders/          founder photos
public/coere-logo.png     the mark, used as the logo in structured data
public/llms.txt           a plain summary of Coere for AI search crawlers
```

Sections, in page order:

| Component     | Anchor         | What it shows                                                         |
| ------------- | -------------- | --------------------------------------------------------------------- |
| `what-we-do`  | `#what-we-do`  | Headline over the 3D wave, one screen tall                            |
| `products`    | `#products`    | 3D picture of the AIs' app icons feeding Coere and the devices, apps and code reading from it, then Coere Connect (Chrome extension) beside Coere Developer (API, MCP, SDK) |
| `who-we-are`  | `#who-we-are`  | Founders (Michelle and Edison), then the executive team (Sarah)       |

The nav in [`src/lib/site.ts`](src/lib/site.ts) has exactly three links, one per
anchor above. Product copy and team details (school, majors and short highlight
bullets, rendered by `team-profile`) live there too; a member without a `photo`
gets an initials avatar.

## The 3D scenes

Both scenes are plain three.js, built imperatively in
[`src/components/three/`](src/components/three) and loaded with a dynamic
`import()` from the section that hosts them, so three.js never weighs on the
first paint. If WebGL is missing, the hero falls back to the flat `orbit` and
Products shows just the cards.

| File                | What it holds                                                                 |
| ------------------- | ----------------------------------------------------------------------------- |
| `core.ts`           | `Stage` (renderer, frame loop, resize, pause offscreen, adaptive pixel ratio), easing, environment |
| `logos.ts`          | Extrudes each SVG in `/public` into a beveled solid; the original SVG is rasterized once and every face samples it, so gradients survive. Also the Coere mark |
| `database.ts`       | The hero's smooth cube on a long shaft, and the porcelain shader the field shares |
| `dust.ts`           | The specks drifting in the hero's air                                          |
| `hero-scene.ts`     | The wave of cubes, Coere above its crest, and the agents floating around it   |
| `glyphs.ts`         | The rounded app icon tile, white or brand blue, and the extruded white symbols for the reading side |
| `products-scene.ts` | An icon per AI, Coere, then an icon for each thing that reads from it          |

**Hero.** A field of smooth cubes, nearly touching so their tops read as one
surface, rolls in a single long swell with Coere glowing above the crest and
the agents spaced evenly around it, riding it. The crest meanders and low
swells roll in from the back, so the whole field keeps flowing. The section
is one screen tall and scrolls away like any other: toward its foot the
cubes pale and dissolve into the white of the page, so there is no edge.
Coere faces out with a slow sway and only spins when spun. The scene itself
never turns: a drag anywhere spins the Coere mark and nothing else, a click
on a logo flips it, and a click anywhere else sends Coere round. The cube lattice sits at an angle to the camera so no row of gaps
lines up with a line of sight. The camera frames the wave below the headline,
however it wraps, so on short screens nothing rises into it.

**Products.** One centered picture, like two pages of app icons either side
of Coere. On the left, a 3x3 grid of white icons, one per AI with its logo. In
the middle, Coere, floating on its own. On the right, a matching grid of
brand blue icons for what reads from it: a laptop, a phone and a watch; a
browser, a chat and a terminal; code, an SDK and a database. There are no
connecting lines and nothing pulses: the picture and its camera hold still,
the mouse never moves them. On phones the grids stack above and below Coere.
The icons pop in from the middle out the first time it scrolls into view.
Nothing casts a shadow; everything floats. Hover an icon to lift it, click
one to flip it. A drag anywhere spins Coere, and only Coere. Hovering a card
brings its side of the picture forward, and hovering a side lights its card.

**Performance.** Each scene renders only while on screen and the tab is
visible. If frames run long the pixel ratio steps down, and then shadows go.
Phones and low-power machines start with a sparser field. A software WebGL
renderer, or a GPU that drops the context for good, gets the flat page. With
`prefers-reduced-motion`, ambient motion stops; dragging and clicking still
work.

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
The hero and Products are client components because they host the 3D scenes;
the team section is static. All motion respects
`prefers-reduced-motion`, and a `noscript` style reveals the scroll animations
when JavaScript is off.

## Deploying

The site is fully static. `npm run build` prerenders every route, so any host
that runs a Next.js build works (Vercel needs no configuration). If
`NEXT_PUBLIC_SITE_URL` is set in the host environment, it must be
`https://www.coere.ai`.

## Search

What the site tells search engines, so "Coere" and "Coere AI" find it:

- The title is "Coere AI | The memory layer for every AI you use", and the
  description names Coere Connect, Coere Developer and the AIs they work with.
- One canonical host, `https://www.coere.ai`, in the canonical link, Open
  Graph URL, structured data, sitemap and robots file.
- JSON-LD on the home page: a `WebSite` named "Coere" (also "Coere AI" and
  "coere.ai"), which is what Google uses for the site name in results, and an
  `Organization` with the same names, the logo, the founders and the profiles
  in `siteConfig.profiles`. Add every official profile there (X, Crunchbase,
  the Chrome Web Store listing) as it goes live.
- The Coere mark as favicon (ico, svg and png) and apple-touch icon, a web
  manifest, and a 1200x630 share image.
- `public/llms.txt`, which says plainly that Coere is not Cohere.

Search engines often correct "Coere" to "Cohere", so the rest happens off the
site: verify the domain in Google Search Console and Bing Webmaster Tools,
submit `https://www.coere.ai/sitemap.xml`, and get profiles and mentions that
spell "Coere" exactly and link to `https://www.coere.ai/`.
