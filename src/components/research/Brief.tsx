"use client";

import { forwardRef, useState } from "react";
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, Search } from "lucide-react";
import {
  SECTIONS,
  absentSections,
  copyText,
  countByPage,
  findings,
  listPhrase,
  pageFor,
  pagesOf,
  parseFailure,
  type Line,
  type Page,
  type ResearchRun,
} from "@/lib/brief";
import { FailMark } from "./Marks";

interface BriefProps {
  run: ResearchRun;
  opened: Set<string>;
  onOpen: (url: string) => void;
  onFollowUp: (query: string) => void;
}

const when = (t: number) =>
  new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

/** The label under a line, like a specimen's data label: the page's letter in its colour, then its host and its title. */
function Cite({ url, pages, onOpen, opened }: { url?: string; pages: Page[]; onOpen: (url: string) => void; opened: Set<string> }) {
  if (!url) return <p className="cite cite-none">No source link</p>;
  const page = pageFor(pages, url);
  const host = page?.host ?? safeHost(url);
  const title = page?.source.title;
  const isOpened = opened.has(page?.source.link ?? url);
  return (
    <div className="cite" data-src={page?.letter}>
      <a
        className="cite-link"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => onOpen(page?.source.link ?? url)}
      >
        <span className="tab">{page?.letter ?? "?"}</span>
        <span className="cite-host">{host}</span>
        {title && <span className="cite-title">{title}</span>}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      {isOpened && (
        <span className="opened">
          <Check aria-hidden="true" /> opened
        </span>
      )}
    </div>
  );
}

function CopyButton({ lines }: { lines: Line[] }) {
  const [state, setState] = useState<"idle" | "done" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText(lines));
      setState("done");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2000);
  };
  return (
    <button type="button" className="toggle" onClick={copy}>
      {state === "done" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {state === "done" ? "Copied" : state === "failed" ? "Could not copy" : "Copy with links"}
    </button>
  );
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export const Brief = forwardRef<HTMLElement, BriefProps>(function Brief({ run, opened, onOpen, onFollowUp }, ref) {
  const { result } = run;
  const pages = pagesOf(result);
  const counts = countByPage(result, pages);
  const [only, setOnly] = useState<string | null>(null);
  const [excerpt, setExcerpt] = useState<string | null>(null);
  const failure = parseFailure(result);
  const absent = absentSections(result);
  const evidence = result.evidence ?? [];
  const dim = (url?: string) => only !== null && pageFor(pages, url)?.letter !== only;

  return (
    <article className="brief" ref={ref} tabIndex={-1} aria-labelledby={`brief-${run.id}`}>
      <header className="brief-head">
        <h2 id={`brief-${run.id}`}>{result.query || run.query}</h2>
        <p className="meta">
          <span>Focus: {run.region}</span>
          <span>Ran {when(run.ranAt)}</span>
          <span>
            {pages.length} {pages.length === 1 ? "page" : "pages"} read
          </span>
        </p>
        {failure ? (
          <div className="note is-error" role="alert" style={{ marginTop: 8 }}>
            <FailMark />
            <div>
              <b>The answer could not be read</b>
              <p>
                The workflow got a reply from the model but it was not valid JSON, so there are no cited lines this time. The pages it read are
                listed below, and you can run the question again.
              </p>
              <details style={{ marginTop: 8 }}>
                <summary style={{ cursor: "pointer", fontWeight: 650 }}>Show what the workflow reported</summary>
                <p className="mono" style={{ marginTop: 6, overflowWrap: "anywhere" }}>{failure}</p>
              </details>
            </div>
          </div>
        ) : (
          absent.length > 0 && (
            <p className="absent">
              No cited {listPhrase(absent)} this time. A section with no cited line is not shown.
            </p>
          )
        )}
      </header>

      {pages.length > 0 && (
        <section className="block" aria-labelledby={`pages-${run.id}`}>
          <div className="block-head">
            <h3 id={`pages-${run.id}`}>Pages read</h3>
            {only && (
              <button type="button" className="toggle" onClick={() => setOnly(null)}>
                Show all lines
              </button>
            )}
          </div>
          {!failure && <p className="block-note">Every line below cites one of these pages. Choose “Only this page” to dim the lines that cite the others.</p>}
          <ul className="pages">
            {pages.map((p) => (
              <li className="page-row" key={p.letter} data-src={p.letter}>
                <span className="tab">{p.letter}</span>
                <div>
                  <p className="page-title">
                    <a
                      href={p.source.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onOpen(p.source.link)}
                    >
                      {p.source.title}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </p>
                  <p className="page-meta">
                    <span className="mono">{p.host}</span>
                    {!failure && (
                      <span>
                        {counts[p.letter] === 1 ? "1 line cites it" : `${counts[p.letter]} lines cite it`}
                      </span>
                    )}
                    {opened.has(p.source.link) && (
                      <span className="opened">
                        <Check aria-hidden="true" /> opened
                      </span>
                    )}
                  </p>
                </div>
                <div className="page-side">
                  <a
                    className="toggle"
                    href={p.source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onOpen(p.source.link)}
                    style={{ textDecoration: "none" }}
                  >
                    <ExternalLink aria-hidden="true" /> Open
                    <span className="sr-only"> {p.source.title} in a new tab</span>
                  </a>
                  {!failure && counts[p.letter] > 0 && (
                    <button
                      type="button"
                      className="toggle"
                      aria-pressed={only === p.letter}
                      onClick={() => setOnly(only === p.letter ? null : p.letter)}
                    >
                      Only this page
                    </button>
                  )}
                  {p.source.snippet && (
                    <button
                      type="button"
                      className="toggle"
                      aria-expanded={excerpt === p.letter}
                      onClick={() => setExcerpt(excerpt === p.letter ? null : p.letter)}
                    >
                      {excerpt === p.letter ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                      Excerpt
                    </button>
                  )}
                </div>
                {excerpt === p.letter && (
                  <div className="excerpt-wrap">
                    <p className="excerpt">
                      <b>Search excerpt from this page:</b> {p.source.snippet}
                    </p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {evidence.length > 0 && (
        <section className="block" aria-labelledby={`evidence-${run.id}`}>
          <div className="block-head">
            <h3 id={`evidence-${run.id}`}>Key evidence</h3>
            <CopyButton lines={evidence.map((e) => ({ text: `${e.title}: ${e.explanation}`, url: e.url }))} />
          </div>
          <ul className="lines">
            {evidence.map((e, i) => (
              <li className="finding" key={i} data-dim={dim(e.url)}>
                <p className="finding-text">
                  <span className="finding-title">{e.title}.</span> {e.explanation}
                </p>
                <Cite url={e.url} pages={pages} onOpen={onOpen} opened={opened} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {SECTIONS.map((s) => {
        const lines = findings(result[s.id]);
        if (lines.length === 0) return null;
        return (
          <section className="block" key={s.id} aria-labelledby={`${s.id}-${run.id}`}>
            <div className="block-head">
              <h3 id={`${s.id}-${run.id}`}>{s.title}</h3>
              <CopyButton lines={lines} />
            </div>
            <ul className="lines">
              {lines.map((l, i) => (
                <li className="finding" key={i} data-dim={dim(l.url)}>
                  <p className="finding-text">{l.text}</p>
                  <Cite url={l.url} pages={pages} onOpen={onOpen} opened={opened} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      {(result.followUps ?? []).length > 0 && (
        <section className="block" aria-labelledby={`follow-${run.id}`}>
          <div className="block-head">
            <h3 id={`follow-${run.id}`}>Explore further</h3>
          </div>
          <p className="block-note">Each of these runs as a new question.</p>
          <ul className="followups">
            {(result.followUps ?? []).map((q, i) => (
              <li key={i}>
                <button type="button" className="btn btn-text" style={{ width: "100%" }} onClick={() => onFollowUp(q)}>
                  <Search aria-hidden="true" />
                  <span>{q}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="foot">
        Search by Serper, pages read through ScrapingDog, answer written by Gemini. A line is kept only when it links to one of the pages read; that
        shows where a line came from, not that the page is right.
      </p>
    </article>
  );
});
