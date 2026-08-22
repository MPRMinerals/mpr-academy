---
name: site
description: Work on the MPR Copper Cathode Academy site — the single-file index.html training app. Use when adding or editing modules, lessons or quizzes, changing copy in either language, adjusting styling, or touching the completion/Google Form flow.
---

# MPR Copper Cathode Academy site

The whole site is one self-contained file: `index.html` (~317 lines, ~350 KB).
There is no build step, no dependencies, no framework. Open the file in a
browser to run it. Everything below lives in that one file.

## Layout of index.html

| Lines (approx.) | What |
| --- | --- |
| `<style>` block | All CSS. Minified-ish: one rule per line, no spaces after `:` or `;`. |
| `<body>` | Four view containers plus a modal, all static markup with empty text nodes. |
| `<script>` | Google Form constants, the `T` content object, then the render functions. |

### Views

Views are plain `<div>`s toggled with `style.display`. Only one is visible at a time.

- `#langView` — language picker, the only view visible on load
- `#homeView` — hero, progress bar, `#moduleGrid` (rendered by `renderHome()`)
- `#lessonView` — `#lessonContent` (rendered by `renderLesson()`) plus the nav row
- `#completeView` — certificate strip, shown after the last module
- `#completionModal` — name/email capture, opens 900 ms after `#completeView`

There is no router and no history handling. Navigation is: `setLang()` →
`renderHome()` → `openModule(i)` → `renderLesson()` → `checkQuiz(i)` →
`nextModule()` → (repeat, or `#completeView` on the last module).

### State

Four module-scoped globals, reset on page load — nothing is persisted:

```js
var lang=null, currentMod=0, completed={}, quizDone=false;
```

`completed` is an index-keyed map (`{0:true, 2:true}`), counted by `countDone()`.
Reloading the page loses all progress. If you are asked to make progress stick,
that means adding `localStorage` — it does not exist today.

## Content lives in `T`

`T` has exactly two keys, `en` and `fr`, with identical shapes. Every user-facing
string is in there; nothing user-facing is hardcoded in the HTML.

Each language object holds:

- UI chrome: `heroTitle`, `heroSub`, `switchLang`, `homeLabel`, `nextLabel`,
  `finishLabel`, `quizLabel`, `correctPfx`, `wrongPfx`, `completeTitle`,
  `completeMsg`, `certMsg`, `completeBtn`, `modal*`
- `progressLabel(done, total)` — a function, not a string
- `modules[]` — home-grid cards: `{num, title, sub}`
- `lessons[]` — `{title, subtitle, body, quiz}` where `quiz` is
  `{q, opts[], ans, expl}` and `ans` is the **0-based index** of the correct option

`modules[i]` and `lessons[i]` are matched by position. The five current modules are
MPR & the DRC, Copper Ore Procurement, SX-EW Process, Incoterms (FCA Bonded), and
Trade Finance (LC at Sight).

### Adding or editing a module

1. Append to `T.en.modules` **and** `T.fr.modules`.
2. Append the matching entry to `T.en.lessons` **and** `T.fr.lessons`, at the same index.
3. Nothing else. Module count, progress bar, the "last module" check
   (`currentMod===t.modules.length-1`) and the grid all derive from array length.

`completeMsg` hardcodes "all 5 modules" in both languages — update that string if
the count changes.

Never add a module to one language only. The language switcher re-renders the
current view against the other locale, so a length mismatch breaks navigation.

## Writing lesson bodies

`body` is an HTML string inside a single-quoted JS string, so **escape apostrophes**
(`world\'s`). Accented and emoji characters are written as `\uXXXX` escapes
throughout — follow that convention rather than pasting literal accents.

Wrap the whole body in `<div class="lesson-body">` and build it from the existing
components:

| Class | Use |
| --- | --- |
| `<h3>` | Small uppercase section label |
| `.info-row` > `.info-pill` > `.dot` | Row of fact pills with a colored dot |
| `.flow-row` > `.flow-box` + `.flow-arrow` | Process chain; `.flow-box.green` / `.flow-box.blue` for emphasis |
| `.key-fact` | Blue call-out box for the one thing to remember |
| `.step-list` > `.step-num` | Numbered procedure |
| `.glossary-row` > `.gterm` + `.gdef` | Term/definition pairs |

Reuse these instead of inventing new classes — they are the site's whole design
vocabulary and they already work in both languages.

## Styling

Brand palette, used consistently:

- copper `#B87333` — accents, links, active borders
- green `#1D9E75` / `#137333` — completion states
- page `#f5f5f0`, panels `#faf9f7`, borders `#ede9e3`, text `#1a1a1a`

The app is a fixed `max-width:700px` centered card — it reads as a phone-sized
app even on desktop. Keep new UI inside that column.

The MPR logo is inlined four times as a base64 JPEG data URI (that is what makes
the file 350 KB). If you change the logo, change all four occurrences. Do not
reformat or re-wrap those lines — a diff of the base64 blobs is unreviewable.

## Completion flow and the Google Form

`submitCompletion()` fires a `no-cors` POST to a Google Forms `formResponse`
endpoint. The four constants at the top of the script map to form fields:

```js
GOOGLE_FORM_URL, FIELD_NAME, FIELD_EMAIL, FIELD_LANG, FIELD_DATE
```

Because the request is `mode:'no-cors'` the response is opaque and the `.catch()`
is empty — **the UI reports success whether or not the submission landed**. Do not
add error handling that claims to detect failure; it cannot. To verify a change
here, submit and check the linked Google Form's responses.

Name and email are collected in the modal and sent to that form. Treat them as
personal data: do not log them, and do not send them anywhere else.

## Conventions

- ES5 only: `var`, `function`, string concatenation. No `let`/`const`, arrow
  functions, or template literals anywhere in the file. Match it.
- Handlers are inline `onclick` attributes. There are no `addEventListener` calls.
- Rendering is string concatenation into `innerHTML`. Anything interpolated into
  a lesson body is authored content, not user input — but never interpolate the
  modal's name/email into `innerHTML`.
- Keep the CSS block's dense one-rule-per-line style; do not run a formatter over
  the file.

## Checking your work

There are no tests and no linter. After editing:

1. Open `index.html` in a browser.
2. Walk both languages end to end — pick a language, open every module, answer a
   quiz right and wrong, reach the certificate, and use "Switch language"
   mid-lesson.
3. Confirm the progress bar reaches 100% and the module count in `completeMsg`
   matches reality.
