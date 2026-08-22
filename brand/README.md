# brand

Source artwork. Nothing here is loaded at runtime: `index.html` carries the logo and the
Kuba strip inline as base64, so the page works from a USB stick with no network. Keep
these files so the embedded copies can be regenerated.

| File | What it is |
|---|---|
| `logo-source.jpg` | the complete logo as supplied, full resolution |
| `logo.webp` | the complete logo at 640 px wide, the copy embedded in the page |
| `kuba-strip.png` | the Kuba border lifted from the logo, dark background keyed out |
| `kuba-strip.webp` | the same strip, the copy embedded in the page |
| `favicon.png` | the emblem alone, 64 px, embedded as the tab icon |

The strip was cut from the logo border between two natural gaps in the motif, then
mirrored, so it repeats without a seam at any width. The complete logo is always used
whole on the page, never cropped.
