# MPR Minerals Group

Single page corporate website for MPR Minerals Group, a vertically integrated copper cathode
producer and direct seller. English, French and Spanish, switched in place with no reload.

`index.html` is self contained. Everything the page needs is inside it: the stylesheet, the
translations, the motion libraries, the complete logo and the Kuba strip. It opens correctly
from a USB stick with no network. The only outbound request is Google Fonts, and that request
cannot block first paint, so the page renders and reads normally offline.

```
index.html      the delivered site, self contained
media/          video and poster files, see media/README.md
brand/          source artwork, build time only, see brand/README.md
build/          the parts index.html is assembled from
academy.html    the earlier Copper Cathode Academy training app, unchanged
```

## Editing

`index.html` is generated. Edit the parts in `build/`, then reassemble:

```bash
python3 build/assemble.py
```

| File | What it holds |
|---|---|
| `build/head.html` | document head, meta, font link |
| `build/body.html` | all markup, and the English copy, which is the base dictionary |
| `build/style.css` | the design system and every rule |
| `build/i18n.js` | the French and Spanish dictionaries |
| `build/site.js` | language switching, motion, video, form |

English lives in the markup and is captured on load, so English is edited in `build/body.html`
and French and Spanish in `build/i18n.js`. Every key must exist in both dictionaries. To add a
string, tag the element with `data-i18n="your.key"`, or `data-i18n-html` if the copy carries
markup, or `data-i18n-attr="placeholder"` to translate an attribute, then add the key to `fr`
and `es`.

Check key parity after editing:

```bash
node -e "eval(require('fs').readFileSync('build/i18n.js','utf8'));
const dom=[...new Set([...require('fs').readFileSync('build/body.html','utf8')
  .matchAll(/data-i18n=\"([^\"]+)\"/g)].map(m=>m[1]))].concat(['meta.title','meta.desc']);
for(const l of ['fr','es']) console.log(l,'missing:',dom.filter(k=>!(k in MPR_T[l])));"
```

## Video

Both slots are off until the files exist, which keeps the console clean on a fresh checkout.
Drop the files into `media/` as named in `media/README.md`, then turn the slot on near the top
of `build/site.js`:

```js
var MEDIA = { hero: true, band: true };
```

If a file is then missing or fails, the coded animation takes over on its own.

## Settings to change before launch

| Where | Value | Change to |
|---|---|---|
| `build/site.js`, `CONTACT_EMAIL` | `info@mpr-minerals.com` | the real address |
| `build/body.html`, the mailto link | `info@mpr-minerals.com` | the same address |

The enquiry form has no backend. It composes a prefilled email. To post to a server instead,
point the form at your endpoint and remove the submit handler in `build/site.js`.

## What the site will not say

These are enforced, and a check script is included below. The bonded warehouse operator is
never named. Current production capacity is never published: the only tonnages on the site are
the Kambove build targets, labelled as such. No prices, premiums or the advance payment
percentage. No licence or registry numbers. No bank names, account numbers or SWIFT details,
only the fact that banking exists in the United Arab Emirates and the United States. No
individual names or photographs. No em dashes or en dashes, in any language, including code
comments.

## Verifying a change

Serve the folder and run the three checks. The content check is in the commit history under
`build/`; the runtime and contrast checks need a browser.

```bash
python3 -m http.server 8000        # then open http://localhost:8000
```

The delivered file was verified at: mobile Lighthouse performance 94, accessibility 100, best
practices 100, SEO 100; every rendered text style at or above WCAG AA contrast; language
switching in all six directions including headlines; complete and readable with JavaScript
disabled and with the media folder empty; no horizontal scroll at 390 px or 1920 px.

## Motion

GSAP with ScrollTrigger and SplitText, plus Lenis, all bundled inline under the GSAP standard
license with their headers intact. The hero opening runs in CSS rather than script so first
paint never waits on the bundle; GSAP drives the section headline reveals, the parallax, the
chain rail, the counters and the pointer effects. `prefers-reduced-motion` disables all of it,
including the animated cell.
