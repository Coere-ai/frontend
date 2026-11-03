# Coere

The Coere website, built with Next.js, TypeScript, Tailwind CSS and Motion.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run lint
```

`NEXT_PUBLIC_SITE_URL` sets the site's canonical address and defaults to
`https://www.coere.ai`. It should match the host that serves the site.

## Search and sharing

Every page is public and indexed. `src/lib/seo.ts` holds the shared keywords
and `pageMetadata`, which gives a page its title, description, keywords,
canonical link and share card in one call; the words for each page are in
`src/site/content/seo.ts`. What Coere is, in one line, lives in
`siteConfig.description` (with a longer `summary` and the `notCohere` line);
keep the meta, structured data, `public/llms.txt` and page copy in step with
it. The home page carries the WebSite and Organization structured data, each
product page a SoftwareApplication, and every page with a visible FAQ
(`FaqSection`) the same words as FAQPage (`src/site/seo/json-ld.tsx`).

The guide pages (`/portable-ai-memory`, `/chatgpt-to-claude-memory`,
`/ai-agent-memory`) are listed in `src/site/content/guides.ts`, which the
sitemap and footer read. `src/app/sitemap.ts` lists every page the menus and
footer link to, with dates that change only when the words do.
`src/app/robots.ts` names the search and AI crawlers one by one and keeps all
of them out of the live demos' own pages, `/statistics` and `/api/`; it says
how to stop model training without leaving AI search. `docs/seo-report.md`
has the research and the remaining manual steps.

The blog and careers pages are hidden from the menus for now. They still
answer at their addresses but are `noindex` and left out of the sitemap.

## Where things live

```
src/app/(site)/       routes: home, products, industries and each industry,
                      resources (the developer docs), blog, about, careers,
                      and a 404 inside the site's layout
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
