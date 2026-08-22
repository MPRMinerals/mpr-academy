# MPR Minerals Group — website

Static, dependency-free corporate website for **MPR Minerals Group** — vertically integrated producer
and direct seller of LME Grade A copper cathode. Trilingual: **English / Français / Español**.

```
index.html            the website (single page)
academy.html          the MPR Copper Cathode Academy app (unchanged, EN/FR)
assets/site.css       design system + layout
assets/site.js        language switching, navigation, reveal animations, contact form
assets/i18n.js        all copy in the three languages — this is the file to edit for text
assets/mpr-logo.jpg   the full logo (footer, social preview)
assets/mpr-mark.webp  the lion mark, background removed (header, hero watermark)
assets/mpr-lockup.webp
                      mark + wordmark + tagline, background removed (Academy panel)
robots.txt, sitemap.xml
```

No build step, no framework. Open `index.html` in a browser, or serve the folder from any static host
(GitHub Pages, Netlify, Vercel, S3, nginx).

## Sections

Hero · facts strip · The Group (produce / deliver / sell direct) · SX-EW process · Product
specification · Trade terms (FCA Ndola, LC at sight, shipment flow, LC documents) · Operations
(Likasi, Kolwezi, Ndola, Dubai) · Academy · Contact · Footer.

## Design system

Defined once as CSS custom properties at the top of `assets/site.css`.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#0A0A0A` | page ground |
| `--carbon` | `#141312` | alternating sections |
| `--panel` | `#1A1817` | cards, inputs |
| `--copper` | `#C17A5A` | accent, labels, rules |
| `--copper-lt` | `#E3A98C` | highlights, hover |
| `--copper-dk` | `#8E5439` | gradient end |
| `--white` | `#F5F2EE` | text |
| `--stone` | `#8A8078` | secondary text |

Typefaces: **Cormorant Garamond** (display), **Barlow** (body), **IBM Plex Mono** (labels, data,
specification keys). The geometric band between sections is an SVG motif taken from the pattern in
the logo's border.

## Languages

* Switch with the EN / FR / ES control in the header or footer.
* The choice is remembered in `localStorage`; `?lang=fr` / `?lang=es` force a language, which is
  useful for links in emails or campaigns.
* Otherwise the browser language is used, falling back to English.
* All text lives in `assets/i18n.js` as `key: "value"` pairs. To change wording, edit the value in
  each of the three dictionaries — **every key must exist in `en`, `fr` and `es`** (165 keys).
* Markup is tagged with `data-i18n="key"`. `data-i18n-attr="placeholder"` (or `content`,
  `aria-label`) translates an attribute instead of the element's text.

Key parity check:

```bash
node -e "global.window={};require('./assets/i18n.js');
const d=window.MPR_I18N,k=Object.keys(d.en);
for(const l of ['fr','es'])console.log(l,'missing:',k.filter(x=>!(x in d[l])));"
```

## Before going live

| Where | Current value | Action |
|---|---|---|
| `assets/site.js` → `CONTACT_EMAIL` | `info@mpr-minerals.com` | the real address (also used by the footer and contact block) |
| `index.html` → `mailto:` links | `info@mpr-minerals.com` | same address |
| `index.html` → canonical, `hreflang`, `og:url`, JSON-LD | `https://www.mpr-minerals.com/` | the real domain |
| `sitemap.xml`, `robots.txt` | same domain | the real domain |

The contact form has no backend: it composes a `mailto:` message from the fields. To collect
submissions server-side, point the form at Formspree, Netlify Forms or your own endpoint and remove
the `submit` handler in `assets/site.js`.

## Notes

* Fonts load from Google Fonts with system fallbacks — the page still holds together if the request
  is blocked.
* Respects `prefers-reduced-motion`; responsive from 360 px up; no horizontal scrolling.
