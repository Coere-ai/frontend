/**
 * The film page each demo plays in. It is the coere-v2 demo page cut down
 * to the player alone, so a film looks exactly as it does there: the
 * browser's own video element, drawn at the film's real resolution, with
 * the same caption style and the same fallback for tracks that fail.
 *
 * Two ways to open it:
 *   <slug>.html                 the full player, with controls and captions
 *   <slug>.html?preview&start=3 a silent loop past the title card, which
 *                               plays only while it is on screen
 *   ...&end=38                  loops only the part between start and end
 */

const STYLE = `@font-face{font-family:"Coere Geist";src:url("fonts/Geist-Variable.woff2") format("woff2");font-weight:100 900;font-display:swap}
html,body{margin:0;height:100%;overflow:hidden;background:#000}
video{display:block;width:100%;height:100%;object-fit:contain;background:#000}
html.preview video{object-fit:cover}
video::cue{font-family:"Coere Geist",ui-sans-serif,system-ui,sans-serif;font-size:max(12px,2.1vw);background:rgba(8,14,36,.82);color:#fff}`;

// Runs in the page. A preview loops from `start` and pauses off screen; the
// full player gets controls, and any track that fails to load is rebuilt
// from the cues written into the page, as the original page does.
const SCRIPT = `(function () {
  var params = new URLSearchParams(location.search);
  var video = document.querySelector('video');
  var data = JSON.parse(document.getElementById('cues').textContent);
  if (params.has('preview')) {
    document.documentElement.className = 'preview';
    var start = Number(params.get('start')) || 0;
    var end = Number(params.get('end')) || 0;
    var still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    video.poster = video.dataset.still;
    video.muted = true;
    Array.prototype.forEach.call(document.querySelectorAll('track'), function (t) { t.remove(); });
    video.addEventListener('loadedmetadata', function () { video.currentTime = start; });
    video.addEventListener('ended', function () { video.currentTime = start; video.play().catch(function () {}); });
    if (end > start) video.addEventListener('timeupdate', function () { if (video.currentTime >= end) video.currentTime = start; });
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) { video.pause(); return; }
      video.preload = 'auto';
      if (!still) video.play().catch(function () {});
    }).observe(video);
    return;
  }
  video.controls = true;
  Array.prototype.forEach.call(document.querySelectorAll('track'), function (el) {
    var done = false;
    function fallback() {
      if (done) return;
      done = true;
      var kind = el.kind, cues = kind === 'chapters' ? data.chapters : data.captions;
      el.remove();
      var track = video.addTextTrack(kind, el.label, el.srclang);
      cues.forEach(function (c) { track.addCue(new VTTCue(c.start, c.end, c.text)); });
      track.mode = kind === 'captions' ? 'showing' : 'hidden';
    }
    if (el.readyState === 3) fallback();
    el.addEventListener('error', fallback);
    if (el.kind === 'chapters') el.track.mode = 'hidden';
  });
})();`;

/** Escapes text for an HTML attribute or element. */
const escape = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

/** The page for one film, given its slug, title and the cue JSON from its source page. */
export function filmPage(slug, title, cues) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${escape(title)}</title>
<style>
${STYLE}
</style>
</head>
<body>
<video playsinline preload="metadata" poster="${slug}-poster.jpg" data-still="${slug}-still.jpg" aria-label="${escape(title)}">
<source src="${slug}.mp4" type="video/mp4">
<track kind="captions" src="${slug}-captions.vtt" srclang="en" label="English" default>
<track kind="chapters" src="${slug}-chapters.vtt" srclang="en" label="Chapters">
</video>
<script type="application/json" id="cues">${cues}</script>
<script>
${SCRIPT}
</script>
</body>
</html>
`;
}
