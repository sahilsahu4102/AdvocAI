# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

An advocacy researcher: a campaigner, analyst or communications person at an animal-advocacy organisation who needs a sourced brief on a topic (a campaign, a law, an industry trend, who else is working on it) and has to be able to defend each line of it. They are reading on a laptop at a desk, usually with the sources open in other tabs, and they will paste parts of the brief into a report, an email or a campaign plan. They check claims against the page a claim came from, so being able to see and open that page matters more to them than polish or speed.

(Confirmed by the owner on 2026-11-14. Recruiters and hiring managers will also see it through a screen recording, but the page is written for the researcher, not for them.)

## Product Purpose

Animal Advocacy Research turns one question into a structured, cited brief: key insights, the organisations involved, trends, and recommended actions, each tied to the web page it came from, plus the three pages the answer was built from and a few follow-up questions.

How it works, as built: the Next.js route `POST /api/research` forwards `{ query, region }` to an n8n workflow. The workflow runs a Serper web search, reads the top three result pages through ScrapingDog, and asks Gemini (`gemini-3.5-flash-lite` through Google's API) for JSON. A "Format Response" step keeps an item only if its URL is one of the pages the workflow read; anything uncited is dropped. A live query takes about 20 seconds. The n8n workflow is required: without `N8N_WEBHOOK_URL` the route answers 500.

Success means the researcher can trust that nothing on screen is uncited, copy a section with its links, and open the source of any line in one click.

## Positioning

Most "AI research" tools hand back fluent prose you have to take on trust. This one drops any statement that cannot name the page it came from, and shows the host beside every line. The mechanism a neighbouring chatbot could not truthfully copy is the citation filter in the workflow.

## Operating Context

- Runs locally with n8n started separately (`GEMINI_API_KEY`, `SERPER_API_KEY` and `SCRAPINGDOG_API_KEY` live in n8n's environment, not in the web app). The web app needs only `N8N_WEBHOOK_URL`.
- The owner will record a screen video of it from their laptop; there is no hosted n8n yet, so there is no live demo link to design for.
- Research history is kept in the page's memory for the session only (it is lost on reload).
- Region (Global, India, US) is sent to the model as a focus instruction. It does not filter the web search, and the interface must not suggest that it does.
- Tests: 11, in `tests/` (route behaviour and the workflow's Code nodes). CI runs them and a type check.

## Capabilities and Constraints

- One query box with a region choice; six starter topics; Enter submits, Shift+Enter adds a line.
- A result has: the query, `evidence` (title, explanation, URL), `insights`, `organizations`, `trends`, `actions` (each `{ text, url }`), `followUps` (strings) and `sources` (title, link, snippet; the workflow reads three).
- Copy-to-clipboard per section, writing `text (url)` per line.
- Follow-up questions re-run the search; a history list reopens earlier results from this session.
- A plain string item (older workflow, or the parse-failure message) must still render without a link.
- Constraints: `npm test` and `npm run build` must stay green; the route and the n8n workflow are not part of the redesign; never put the n8n webhook URL or any key in the browser.
- Not built, so not to be implied by the interface: file attachment, accounts, saved research across sessions, exporting to PDF, per-region web search.

## Brand Commitments

- The page is named **Animal Advocacy Research** (the owner's choice, 2026-11-14). The repo is called AdvocAI; the interface does not use that name.
- The sources shown beside each line are the product. Nothing may look more certain than it is: no "Verified" badge (the workflow checks that a URL was one of the pages read, not that the claim is true).

## Evidence on Hand

- Live runs on 2026-11-13 ("cage-free egg laws"): about 22 s end to end, three pages read, every insight, organisation, trend and action linked to a page read, also through the Next.js page. Real response shapes are in `tests/workflow.test.ts`.
- No testimonials, customer logos, usage numbers or benchmarks exist, and none may be invented.
- No screenshots of the old interface were committed.

## Product Principles

1. **Cite or drop.** Every line on screen names its source; what cannot is not shown, and the interface says what it kept and from where.
2. **Say what the system actually did.** Region steers the model, three pages were read, the answer is the model's reading of them. Waiting, errors and empty states are stated in plain words, with what to do next.
3. **A brief, not a chat.** The result is a document a researcher can scan, copy and carry into their own work.
4. **No decoration that implies capability.** No buttons that do nothing, no badges, no counts the data does not support.
5. **The sources are one click away.** Opening the page behind a line is the main interaction after reading.

## Accessibility & Inclusion

WCAG 2.2 AA. Keyboard-operable end to end (the region choice and the history list included), visible focus, no meaning carried by colour alone, reduced-motion respected, readable at phone width.
