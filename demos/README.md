# Live demos

Every demo on the site plays live in the page: Coere's real code from the
coere-v2 source (its content script on the replica chat sites, the
dashboard, onboarding, the popup, the UI kit), driven by a script that
moves the pointer, types key by key, clicks and waits, the way coere-v2's
`tools/demo-video` scripts drive a browser to make the films. Nothing is a
recording.

```
COERE_V2=/path/to/coere-v2 node demos/build.mjs [film...]
```

The coere-v2 checkout needs `pnpm install`. Output goes to
`public/preview/live/`: `lib/` holds the shared bundles (one per Coere
version and edition, for the chat sites and each extension page) and each
film gets `<film>/index.html`. `DEMO_SKIP_LIB=1` skips `lib/` when only a
film changed.

## How a film works

- `demos/films/<film>/film.ts` calls `play(meta, film, setup)`.
  `setup(world)` fills the World with what the extension answers (every
  `chrome.runtime` message and engine call the real code makes), and
  `film(stage)` is the script.
- `sites.mjs` lists the replica chat pages to write, from coere-v2's own
  fake site builder, with the chats in their sidebars and data APIs.
- `config.json`: `title`, `version` (1, 2 or 3), `edition` (`solution` for
  Coere for Teams), and `bundles` for any page of the film's own.
- A tab opens a page with `stage.open(name, src, site?)`. Chat sites come
  from `sites.mjs`; extension pages are `/preview/live/lib/<page>-v<n>.html`
  (`console`, `onboarding`, `popup`; add `-solution` for Teams), with
  `?tab=` as the dashboard reads it.

The page plays the whole film and loops. `?from=<chapter>&to=<chapter>`
plays one part (it skips ahead unseen, so a short showcase starts in the
right state), `?controls=1` adds pause and chapter buttons, and
`?captions=1` shows the caption line.

## What differs from the extension

Only what a web page needs: `chrome.*` is the demo's own (shared by every
tab through the top page), a page's host name is the website's so Coere is
told which site a tab stands for, and the scripted hand's events are
untrusted, which Coere ignores by design, so those checks read true in
these bundles. All three are in `build.mjs` and `stage/tab/`.
