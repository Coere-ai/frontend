# Coere

The Coere website, built with Next.js, TypeScript, Tailwind CSS, Motion and
three.js.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

`NEXT_PUBLIC_SITE_URL` sets the site's canonical address and defaults to
`https://www.coere.ai`. It should match the host that serves the site.

## The private new site

The redesigned site is private. Everyone sees the current site at coere.ai
until they sign in at `/access`. A sign in lasts one hour, and for that hour
coere.ai itself shows the new site at its real addresses (`/`, `/blog`,
`/products/forge` and so on). Without a pass, none of it answers.

Set two variables in the deploy's environment:

```
USER=...
PASSWORD=...
```

With either one missing, nobody can sign in. Changing either one signs
everyone out.

Shells set `USER` to your login name, and Next does not let a `.env` file
override a variable the shell already set. To try it locally, start the dev
server with both on the command line:

```bash
USER=me PASSWORD=secret npm run dev
```

How it works:

- `/access` posts to `/access/verify`, which compares the credentials as
  digests and sets an httpOnly cookie for one hour. A wrong guess waits 800 ms.
  `/access/leave` signs out early.
- The cookie holds only when the pass ends and an HMAC over that, keyed by the
  two variables (`src/lib/access`).
- `src/proxy.ts` rewrites page requests from pass holders to the routes under
  `src/app/preview`, so the address bar never changes. Anything under
  `/preview`, including the films and images in `public/preview`, is a 404
  without a pass.
- The preview layout checks the pass again on the server, so a mistake in the
  proxy can't leak a page. Private pages are `noindex` and `no-store`, and
  private files are `private` so no shared cache keeps them.

## Where the new site lives

```
src/app/preview/      routes: home, products, industries and each industry,
                      resources (the developer docs), blog, about, careers,
                      and a 404 inside the new layout
src/site/content/     everything the pages say: products, features, films and
                      their cues, industries and their stories, page copy,
                      code samples, backgrounds, posts, roles, navbar tabs
src/site/content/docs the developer docs as Markdown, one file per page
src/site/blocks/      layouts the pages share: the accordion showcase, feature
                      grid, use case tabs, slanted card, photo hero, code tabs
src/site/nav/         the navbar, its hover menus and the mobile menu
src/site/home/        the home page: one part per product
src/site/products/    one page design per product
src/site/industries/  the industries page and each industry's page
src/site/docs/        the docs layout and the Markdown renderer
src/site/about/, blog/, careers/
                      each page's own sections
src/site/ui/          shared pieces: container, buttons, icons, film frames,
                      slanted tiles, photos saved at several widths
public/preview/       artwork, backgrounds, industry photos, and the films
scripts/films/        builds each film's HTML page from coere-v2
```

## Films

Every film plays in its own HTML page under `public/preview/films`, made
from the coere-v2 demo pages by

```
node scripts/films/build-pages.mjs ../coere-v2/docs/demo
```

So a film looks exactly as it does on those pages: the browser's player at the
film's full 1440 by 900. `<slug>.html?preview&start=3` is the silent loop the
site uses beside features.

## Photos and docs

Industry photos and backgrounds are from Unsplash, free to use under the
Unsplash License, each saved at 960, 1920 and 3840 wide. They load through
`SizedPhoto` instead of the image optimizer, which fetches without the
visitor's pass and would be turned away by the gate.

The developer docs in `src/site/content/docs` were built from the coere-v2
source. Endpoint and schema tables come from `packages/api/openapi.json`, and
every fact keeps a `<!-- src: path:line -->` comment, stripped when the page is
drawn, so it can be checked again when the API changes.

The blog posts and roles are placeholder content for now; each content file
says so at the top. The industry stories illustrate what each product does;
they are not customers.
