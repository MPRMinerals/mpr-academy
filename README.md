# MPR Minerals Group — website

Static, dependency-free corporate website for **MPR Minerals Group** (Dubai · DR Congo · Zambia),
built around the new group logo. Trilingual: **English / Français / Español**.

```
index.html            the website (single page, all sections)
academy.html          the existing MPR Copper Cathode Academy app (unchanged, EN/FR)
assets/site.css       design system + layout
assets/site.js        language switching, navigation, reveal animations, contact form
assets/i18n.js        all copy, in the three languages — this is the file to edit for text
assets/mpr-logo.jpg   the full logo (footer, social preview)
assets/mpr-mark.webp  the lion mark, background removed (header, hero watermark, favicon source)
assets/mpr-lockup.webp
                      mark + wordmark + tagline, background removed (Academy panel)
robots.txt, sitemap.xml
```

No build step and no framework. Open `index.html` in a browser, or serve the folder with any static
host (GitHub Pages, Netlify, Vercel, S3, nginx).

## Sections

Hero · trust strip · The Group · Value chain (7 steps) · SX-EW process · Products (cathode +
ore/concentrate specs) · Trade terms (FCA bonded warehouse, LC at sight, shipment flow, LC documents) ·
Footprint (Dubai / DR Congo / Zambia) · Responsibility · Academy · Contact · Footer.

Content is drawn from MPR's own Copper Cathode Academy material, so the technical and commercial
statements match the internal training programme.

## Languages

* Switch with the EN / FR / ES control in the header or footer.
* The choice is remembered in `localStorage`, and `?lang=fr` / `?lang=es` force a language
  (useful for links in emails or campaigns).
* Otherwise the browser language is used, falling back to English.
* All text lives in `assets/i18n.js` as `key: "value"` pairs. To change wording, edit the value in
  each of the three dictionaries — **every key must exist in `en`, `fr` and `es`**.
* Markup is tagged with `data-i18n="key"`. `data-i18n-attr="placeholder"` (or `content`,
  `aria-label`) translates an attribute instead of the element text.

Key parity check:

```bash
node -e "global.window={};require('./assets/i18n.js');
const d=window.MPR_I18N,k=Object.keys(d.en);
for(const l of ['fr','es'])console.log(l,'missing:',k.filter(x=>!(x in d[l])));"
```

## Before going live — placeholders to replace

| Where | Current value | Action |
|---|---|---|
| `assets/site.js` → `CONTACT_EMAIL` | `info@mpr-minerals.com` | put the real address (also used by the footer + contact block) |
| `index.html` → `mailto:` links | `info@mpr-minerals.com` | same address |
| `index.html` → `<link rel="canonical">`, `hreflang`, `og:url`, JSON-LD | `https://www.mpr-minerals.com/` | the real domain |
| `sitemap.xml`, `robots.txt` | same domain | the real domain |
| Contact block | Dubai, UAE · DR Congo · Zambia | add street addresses / phone numbers if they should be public |

The contact form has no backend: it composes a `mailto:` message from the fields. To collect
submissions server-side instead, point the form at Formspree, Netlify Forms or your own endpoint and
remove the `submit` handler in `assets/site.js`.

## Notes

* Fonts are Playfair Display + Inter from Google Fonts, with system fallbacks — the page still looks
  right if the font request is blocked.
* Colours are derived from the logo's rose-gold gradient (`#F7DFD1 → #C98E76 → #8E5544`) on charcoal.
  They are defined once as CSS custom properties at the top of `assets/site.css`.
* The geometric band between sections is an SVG motif inspired by the pattern in the logo's border.
* Respects `prefers-reduced-motion`; responsive from 360 px up; no horizontal scrolling.
