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
src/app/preview/      routes: home, products, industries, resources, blog,
                      about, careers, and a 404 inside the new layout
src/site/content/     everything the pages say: products, features, films and
                      their cues, industries, posts, roles, navbar tabs
src/site/nav/         the navbar, its hover menus and the mobile menu
src/site/player/      the video player: chapters, captions, speed, full screen
                      and keyboard shortcuts
src/site/home/        the home page sections
src/site/about/       the scroll story and the team
src/site/products/, blog/, careers/, industries/, resources/
                      each page's own sections
src/site/ui/          shared pieces: container, buttons, icons, reveal,
                      lazy films and the framed player
public/preview/       product artwork, and the films with posters and stills
```

The films come from `docs/demo` in the coere-v2 repo, with their chapter and
caption cues. The blog posts, industries and roles are placeholder content for
now; each content file says so at the top.
