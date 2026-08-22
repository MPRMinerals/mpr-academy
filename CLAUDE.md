# CLAUDE.md

Guidance for AI assistants working in this repository.

## What this is

**MPR Copper Cathode Academy** — a bilingual (English / French) self-paced training
app for MPR Minerals Group (Dubai · DR. Congo · Zambia). It teaches the copper value
chain in five modules: company/DRC context, ore procurement, the SX-EW process,
Incoterms (FCA bonded warehouse), and trade finance (LC at Sight). Each module ends
with a one-question quiz; finishing all five shows a completion screen and offers to
register the learner's name/email with the training team.

The audience is business/trade staff and partners, not developers. Content accuracy
about mining, Incoterms, and trade finance matters as much as code quality.

## Repository layout

```
index.html               The entire application (~353 KB, 317 lines)
.claude/settings.json    Enables the ui-ux-pro-max plugin from a GitHub marketplace
.mcp.json                21st.dev MCP server (needs TWENTYFIRST_API_KEY in env)
.gitignore               Ignores .claude/settings.local.json and .env files
```

That is the whole repository. There is **no build system, no package.json, no
dependencies, no test suite, and no CI**. Do not introduce any of these unless
explicitly asked — the single-file design is deliberate so the app can be emailed,
dropped on a USB stick, or hosted as a static file with zero setup.

## Running and testing

Open `index.html` directly in a browser (`file://` works). There is no dev server and
no network fetch at load time — every asset, style, and script is inline, so the app
runs fully offline. The only outbound request is the Google Forms POST on completion.

There are no automated tests. Verify changes manually by walking the flow:
language screen → home grid → each of the 5 modules → quiz answer (correct and
incorrect) → Finish → completion screen → registration modal (submit and skip).
Check both `en` and `fr`, and check the ≤500 px layout (the one media query collapses
the module grid and language cards to a single column).

## Architecture of `index.html`

Roughly: lines 7–92 `<style>`, 94–173 markup, 174–315 `<script>`.

Note the file has very long lines — the four base64 logos are ~78 KB each on lines
98/119/135/150, and the lesson `body` strings run 1.5–2.5 KB on a single line. Prefer
`sed -n 'Np'`, `grep`, and targeted edits over reading the file wholesale.

### View switching

Four top-level `<div>`s are toggled with `style.display`, never routed:

| Element id     | Screen                                              |
| -------------- | --------------------------------------------------- |
| `langView`     | Language picker (the only one visible on load)      |
| `homeView`     | Hero, progress bar, 5-module grid                   |
| `lessonView`   | Lesson body + quiz + Home/Next nav                  |
| `completeView` | Congratulations screen with certificate strip       |

Plus `#completionModal`, a fixed overlay shown by adding `.show`.

### State

Four module-scoped globals, declared at line 257:

```js
var lang=null, currentMod=0, completed={}, quizDone=false;
```

State is **in-memory only** — there is no `localStorage`, no backend, no session.
Refreshing the page loses all progress and returns to the language picker. If asked to
persist progress, that is a real feature addition, not a bug fix.

A module is marked complete when the learner answers its quiz (`checkQuiz`) *or*
presses Next (`nextModule`) — answering wrongly still counts as done.

### The `T` content object

All user-facing copy lives in `T` (line 180), keyed `T.en` and `T.fr`. Each language
holds:

- **UI strings** — `heroTitle`, `heroSub`, `switchLang`, `homeLabel`, `nextLabel`,
  `finishLabel`, `quizLabel`, `correctPfx`, `wrongPfx`, `completeTitle`, `completeMsg`,
  `certMsg`, `completeBtn`, `modalTitle`, `modalMsg`, `modalBtn`, `modalSkip`
- **`progressLabel(done, total)`** — a function, not a string
- **`modules[]`** — 5 home-grid cards: `{num, title, sub}`
- **`lessons[]`** — 5 lessons: `{title, subtitle, body, quiz}` where `body` is an HTML
  string and `quiz` is `{q, opts[], ans, expl}` with `ans` a **0-based index** into
  `opts`

**The `en` and `fr` trees must stay structurally identical**: same number of modules
and lessons, same quiz option count, and the same `ans` index (the options are
translated in the same order). `renderHome`, `renderLesson`, and `nextModule` all read
`t.modules.length` and index `t.lessons[currentMod]` interchangeably, so a mismatch
silently breaks navigation or shows the wrong answer as correct.

Adding a module means editing five places: `T.en.modules`, `T.en.lessons`,
`T.fr.modules`, `T.fr.lessons`, and the `completeMsg` copy in both languages (it says
"all 5 modules" / "les 5 modules"). Everything else derives from array length.

### Rendering functions

`setLang` · `switchLang` · `countDone` · `renderHome` · `openModule` · `renderLesson`
· `checkQuiz` · `nextModule` · `goHome` · `submitCompletion` · `skipModal`

All are plain globals called from inline `onclick=` attributes in the markup and in
generated HTML strings. Rendering is string concatenation into `innerHTML`. There is
no framework, no event delegation, and no module system — keep it that way.

### Completion registration

`submitCompletion` (line 307) posts name, email, language, and ISO date to a Google
Form via `fetch(url, {method:'POST', mode:'no-cors'})`. Because of `no-cors` the
response is opaque: **failures are invisible**, the `.catch` is empty, and the user is
thanked unconditionally. The form URL and the four `entry.*` field IDs are constants at
lines 175–179; they must match the live Google Form or submissions vanish silently.

## Conventions

**JavaScript** — ES5 only: `var`, `function`, string concatenation, classic `for`
loops. No arrow functions, `let`/`const`, template literals, or optional chaining. This
keeps the file usable on old browsers and phones in the field. Match the existing dense
style (minimal spaces around operators, statements packed onto one line).

**CSS** — one inline `<style>` block, single-line rules, no preprocessor. Class names
are lowercase-hyphenated and scoped by screen (`lang-*`, `mod-*`, `lesson-*`, `quiz-*`,
`nav-*`, `modal-*`).

**Brand palette** — reuse these rather than inventing colors:

| Token           | Hex       | Used for                                  |
| --------------- | --------- | ----------------------------------------- |
| Copper (brand)  | `#B87333` | Primary buttons, accents, hover borders   |
| Green (success) | `#1D9E75` | Completed state, correct answers          |
| Blue (info)     | `#378ADD` / `#1a73e8` | Key facts, "Start" badges     |
| Red (error)     | `#d93025` | Wrong answers                             |
| Page bg         | `#f5f5f0` | Body background                           |
| Surface bg      | `#faf9f7` | Cards, bars, panels                       |
| Border          | `#ede9e3` | Dividers and card borders                 |

The app is a fixed 700 px centered card (`.app`), styled mobile-first for phone use.

### Lesson body markup

Lesson `body` strings compose a fixed vocabulary of pre-styled components. Reuse these
instead of adding inline styles or new classes:

- `<div class="lesson-body">` — required wrapper for every lesson body
- `<h3>` — small uppercase section heading
- `<div class="info-row"><div class="info-pill"><div class="dot" style="background:#B87333"></div>Label</div></div>` — fact chips; the `dot` color is the one sanctioned inline style
- `<div class="flow-row"><div class="flow-box">Step</div><span class="flow-arrow">→</span>…</div>` — process chains; `flow-box` also takes `.green` and `.blue`
- `<div class="key-fact">💡 …</div>` — blue callout
- `<ul class="step-list"><li><div class="step-num">1</div>…</li></ul>` — numbered steps; the `step-num` badge also takes a short symbol (e.g. `%`) instead of a digit
- `<div class="glossary-row"><div class="gterm">Term</div><div class="gdef">Definition</div></div>` — term/definition pairs

**Escaping** — `body` strings are single-quoted JS, so apostrophes are backslash-escaped
(`world\'s`, `l’usine`). Non-ASCII characters are written as `\uXXXX` escapes
throughout the script (`—` em dash, `é` é, emoji as surrogate pairs), and as
HTML entities (`&middot;`, `&ccedil;`) in the static markup. Follow whichever the
surrounding context uses; the file itself is UTF-8 with `<meta charset="UTF-8">`.

### The logo

The MPR logo is a base64 data URI embedded **four times** (lines 98, 119, 135, 150) —
byte-identical copies of the same ~78 KB image, about 88% of the file. Note it is
declared `data:image/png` but the payload is actually JPEG (`/9j/` prefix); browsers
sniff it correctly, so leave it unless you are reworking the asset.

If asked to shrink the file, the fix is to hoist the data URI into one JS constant (or
a hidden `<img>` cloned into place) and assign `src` at render time — that alone cuts
roughly 233 KB. Do this only when asked; it is a real change to load behavior.

## Editing guidance

- Preserve the single-file, zero-dependency, offline-capable design.
- Change EN and FR together. A change to one language without the other is a bug.
- Prefer surgical edits to exact strings over rewriting long lines. Never reflow or
  reformat the base64 image lines.
- Don't add build tooling, frameworks, or external CDN assets — a CDN link breaks
  offline use, which is the point of the file.
- This is a **public repository**. Never commit API keys, tokens, or `.env` files. The
  Google Form endpoint is already public by design (form IDs are not secrets), but
  treat anything new as sensitive by default.

## Tooling

`.claude/settings.json` enables the `ui-ux-pro-max` plugin from the
`nextlevelbuilder/ui-ux-pro-max-skill` GitHub marketplace — available for design work
on the app's UI.

`.mcp.json` configures the 21st.dev MCP server for UI component generation. It reads
`TWENTYFIRST_API_KEY` from the environment and requires an interactive OAuth
authorization; it is unavailable in non-interactive sessions.

## Git workflow

Default branch is `main`. Work happens on feature branches (e.g.
`claude/<topic>-<id>`) and is pushed with `git push -u origin <branch>`. Commit
messages are short imperative sentences ("Rename index.html", "Enable ui-ux-pro-max
plugin for this repo"). Do not open a pull request unless asked.
