---
name: Animal Advocacy Research
description: A cited-research tool set like a natural-history drawer: a cabinet-green bar over grey-green foam, and every line of the brief pinned to a data label that names the page it came from.
colors:
  cabinet: "#25362c"
  cabinet-hover: "#31463a"
  cabinet-ink: "#e3ebdd"
  foam: "#e3e8df"
  sunk: "#d3dace"
  label: "#fbfbf7"
  field: "#fefefc"
  ink: "#1b1f1b"
  ink-2: "#3c443d"
  ink-3: "#566057"
  rule: "#b4beaf"
  red: "#a8302a"
  red-wash: "#f6e1dd"
  source-a: "#1f5fa8"
  source-b: "#8a5d00"
  source-c: "#7a3e8a"
  source-d: "#1d6b63"
  source-e: "#55607a"
  source-f: "#6b5b2e"
typography:
  display:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 650
    lineHeight: 1.55
  data:
    fontFamily: "Atkinson Hyperlegible Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.55
rounded:
  none: "0px"
spacing:
  column: "46rem"
  gutter: "20px"
  drawer: "21rem"
components:
  button:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.label}"
    rounded: "{rounded.none}"
    padding: "0 18px"
    height: "44px"
  toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 12px"
    height: "36px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "12px"
    height: "56px"
  select:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 36px 0 12px"
    height: "44px"
  tab:
    backgroundColor: "{colors.source-a}"
    textColor: "{colors.label}"
    rounded: "{rounded.none}"
    height: "24px"
    width: "24px"
  note:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
  note-error:
    backgroundColor: "{colors.red-wash}"
    textColor: "{colors.red}"
    rounded: "{rounded.none}"
    padding: "14px 16px"
---

# Design System: Animal Advocacy Research

## Overview

**Creative North Star: "The Specimen Drawer"**

In a natural-history collection every pinned specimen carries a small stacked data label: where it was found, when, by whom. Nothing in the drawer is anonymous. Animal Advocacy Research sets its brief the same way. Every line the workflow keeps is followed by a label that names the page it came from: a square letter tab in that page's colour, the host in monospace, and the page's own title. A line with no label is not part of the brief. The three pages the workflow read are three label colours, so a researcher can see at a glance which page each claim hangs from, dim the others, and open the page behind any line.

The world was assigned by the direction roll, confirmed by the project owner, and replaces the earlier dark emerald glass interface completely. It lends type, palette, density and one signature move. The shell, controls and page structure stay the ones any research tool uses: a bar, a question form, a document, a side drawer.

It is a daylight reading tool. A researcher at a desk, with the sources open in other tabs, reads long text and copies it into a report; the page is a light foam ground with ink text, not a dark screen. Everything is flat: ink rules, square corners, no shadow, no blur, no gradient. State is a drawn mark plus a word. The interface says what the system actually did: three pages were read, the region only steers the model, a line's label shows where it came from and not that the page is right.

**Key Characteristics:**
- A cabinet-green bar carries the name and History; the page beneath is grey-green foam and white label cards.
- The **label**: a letter tab (A, B, C) filled in the page's colour, the host in Atkinson Hyperlegible Mono, the page title beneath. Colour never travels without its letter.
- **Pages read**, a key printed once above the lines: each page's full title, host, how many lines cite it, Open, **Only this page** (dims every line that cites another) and an in-place **Excerpt**.
- One reading size on one measure (17px on about 62 characters) in every section, so a line never changes size because of what it says.
- Red is reserved for failure: an unreadable answer or a workflow error. It is never a source colour.
- A non-modal **History** drawer beside the page on a wide screen, above it on a narrow one.
- Every wait and failure is stated in words with a way forward: a counted wait with Stop waiting, a named error with Try again.
- Square corners, flat surfaces, no shadow, no blur, no gradient, no icon tiles.

## Colors

Cabinet green, grey-green foam, white labels, ink, and one colour per page read.

### Primary
- **Cabinet** (#25362c): the top bar and the pressed state of the primary button. Text on it is Cabinet Ink (10.5:1).

### Secondary
- **Margin Red** (#a8302a): an unreadable answer or a failed run, nothing else. 5.4:1 on foam, 5.4:1 on its wash.

### Neutral
- **Foam** (#e3e8df): the page ground.
- **Label** (#fbfbf7): the question card, the History drawer, excerpts.
- **Field** (#fefefc): typing fields and the region select.
- **Sunk** (#d3dace): notes and disabled controls.
- **Ink** (#1b1f1b): text, rules, the primary button (13.4:1 on foam).
- **Ink 2** (#3c443d): supporting text (8.1:1).
- **Ink 3** (#566057): hints, placeholders and dimmed lines (5.3:1 on foam, 4.6:1 on sunk).
- **Rule** (#b4beaf): hairlines between rows; decorative only, never the sole carrier of meaning.
- **Cabinet Ink** (#e3ebdd) and **Cabinet Hover** (#31463a): text and hover fill on the bar.

### Source colours
- **Source A** (#1f5fa8), **B** (#8a5d00), **C** (#7a3e8a): the three pages the workflow reads. **D** (#1d6b63), **E** (#55607a), **F** (#6b5b2e) stand ready for up to six. All carry the letter in Label colour at 5.8:1 or better, and none is a red.

### Named Rules
**The Colour-Never-Travels-Alone Rule.** A source colour always appears with its letter, so identity survives greyscale and colour-blindness.

**The Failure-Only Red Rule.** Red marks failure and nothing else; a source is never red and an emphasis is never red.

## Typography

**Face:** Atkinson Hyperlegible Next (self-hosted through `next/font/google`), drawn for legibility and chosen for a tool read in long sittings.
**Data face:** Atkinson Hyperlegible Mono, for hosts, timers and raw reports: values the system recorded.

### Hierarchy
- **Display** (700, `clamp(1.5rem, 3.4vw, 2rem)`): the query as the brief's title.
- **Headline** (700, 1.125rem): section headings (Pages read, Key evidence, Key insights and the rest).
- **Body** (400, 1.0625rem, 1.55): the lines themselves, capped at 62ch.
- **Label** (650, 0.875rem): field labels, toggles, button text.
- **Data** (mono 600, 0.8125rem): hosts, the elapsed seconds, the unreadable-answer report.

### Named Rules
**The One-Measure Rule.** Lines are one size on one measure in every section; hierarchy comes from scale and weight of headings, then from colour.

**The Mono-Means-Recorded Rule.** Monospace is for values the system recorded (hosts, seconds, raw output), never for headings or decoration.

## Layout

A centred column of 46rem on foam, 20px gutters (16px on a phone). With History open on a screen of 1100px or wider the column moves left and a 21rem drawer sits beside it; below that the drawer opens above the question card. Rhythm comes from a heavy 3px rule that opens the brief, a 1.5px rule above each section, and 1px hairlines between lines.

## Elevation & Depth

There is none. No shadows, no blur, no gradients. Depth is three things only: the 3px rule above the brief, the label ground that lifts a card a step off the foam, and a 1.5px ink border on controls.

### Named Rules
**The Flat Rule.** If something needs to stand out, change its rule weight, its ground, or its mark. Never add a shadow.

## Shapes

Square corners everywhere (`border-radius: 0`). Borders are 1.5px ink on controls and the question card; a dashed border always means waiting or unavailable (the counted wait, a disabled control). There is no coloured border-left; the letter tab, a filled square, carries the page colour.

## Components

- **Button.** Outline by default, ink-filled for the one primary action (Research). Hover fills ink; pressing darkens to cabinet and moves down 1px; disabled is a dashed sunk box.
- **Toggle.** A compact outline button for Open, Only this page, Excerpt, Copy with links and Close; pressed is an ink block with `aria-pressed`.
- **Field and select.** Field ground, 1.5px ink border, a real label above, a hint below; disabled is dashed.
- **Letter tab.** A 24px filled square in the page colour with the letter in Label colour.
- **Label (cite).** Tab beside two lines: host in mono, then the page title; the whole label opens the page in a new tab and marks it "opened".
- **Pages read row.** Tab, page title as a link, host, "N lines cite it", then the toggles; the excerpt unfolds under the row.
- **Note.** A sunk box with a drawn mark and a word: dashed ring while waiting, struck square in a red-bordered wash for a failure; actions sit inside it.
- **History drawer.** A label-ground panel, non-modal, closing with Escape; a run reopens with its own region.

## Do's and Don'ts

- **Do** show a label under every line, and print each page's full detail once, in the key.
- **Do** pair every source colour with its letter.
- **Do** say what the system did: three pages read, region steers the model, a label shows origin and not truth.
- **Do** keep red for failure only, and give every failure a named problem and a next step.
- **Do** keep dimmed text at AA contrast: dim by switching to Ink 3, not by lowering opacity.
- **Do** respect reduced motion; the one entrance (the key pins in, then the lines settle) disappears entirely.
- **Don't** add shadows, blur, gradients, glow or rounded corners.
- **Don't** use a coloured border-left, an eyebrow label above a heading, or a modal for History.
- **Don't** add controls that do nothing (the old paperclip), badges that claim more than the data supports (the old "Verified"), or counts the data does not give.
- **Don't** imply that the region filters the search, or that a cited page proves a claim.
- **Don't** let pins, cork, handwriting or aged-paper texture turn the drawer into a museum prop.
