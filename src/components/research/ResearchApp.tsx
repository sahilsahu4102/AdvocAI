"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Clock, Search, X } from "lucide-react";
import type { ResearchResult, ResearchRun } from "@/lib/brief";
import { Brief } from "./Brief";
import { History } from "./History";
import { FailMark, LogoMark, WaitMark } from "./Marks";

const REGIONS = ["Global", "India", "US"] as const;

// The same six starting points the page has always offered; each runs as written.
const STARTERS = [
  "Latest campaigns against animal testing",
  "Factory farming industry trends and activism",
  "Wildlife protection laws and enforcement",
  "Growth of vegan movement worldwide",
  "Top animal rights organizations and their impact",
  "Ocean conservation and marine animal protection",
];

interface Failure {
  message: string;
  query: string;
}

export default function ResearchApp() {
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState<string>("Global");
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [current, setCurrent] = useState<ResearchRun | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [stopped, setStopped] = useState(false);
  const [history, setHistory] = useState<ResearchRun[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [opened, setOpened] = useState<Set<string>>(new Set());

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const briefRef = useRef<HTMLElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const runId = useRef(0);

  // Grow the box with its text, to about eight lines.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [message]);

  // The wait is real, so the page counts it.
  useEffect(() => {
    if (!loading) return;
    setElapsed(0);
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  // Bring the brief into view and give it keyboard focus when it arrives.
  useEffect(() => {
    if (!current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    briefRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    briefRef.current?.focus({ preventScroll: true });
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!showHistory) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShowHistory(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showHistory]);

  const submit = useCallback(
    async (override?: string) => {
      const q = (override ?? message).trim();
      if (!q || loading) return;

      setLoading(true);
      setAsked(q);
      setFailure(null);
      setStopped(false);
      setCurrent(null);
      if (override) setMessage(q);

      const controller = new AbortController();
      abortRef.current = controller;
      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q, region }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        const result: ResearchResult = await res.json();
        const run: ResearchRun = { id: ++runId.current, query: q, region, ranAt: Date.now(), result };
        setCurrent(run);
        setHistory((prev) => [run, ...prev]);
        setMessage("");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") setStopped(true);
        else setFailure({ message: err instanceof Error ? err.message : "Something went wrong", query: q });
      } finally {
        abortRef.current = null;
        setLoading(false);
      }
    },
    [message, region, loading],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const markOpened = (url: string) => setOpened((prev) => new Set(prev).add(url));
  const clear = () => {
    setCurrent(null);
    setFailure(null);
    setStopped(false);
  };
  const showStarters = !current && !loading;

  return (
    <>
      <a href="#main" className="skip">Skip to the question</a>
      <header className="bar">
        <div className="bar-inner">
          <h1 className="brand">
            <LogoMark />
            <span>Animal Advocacy Research</span>
          </h1>
          <button
            type="button"
            className="bar-btn"
            aria-expanded={showHistory}
            aria-controls="history-drawer"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock aria-hidden="true" />
            History{history.length > 0 ? ` (${history.length})` : ""}
          </button>
        </div>
      </header>

      <div className={`frame${showHistory ? " has-drawer" : ""}`}>
        {showHistory && (
          <div id="history-drawer" className="drawer-slot">
            <History
              runs={history}
              currentId={current?.id ?? null}
              onOpen={(run) => {
                setCurrent(run);
                setFailure(null);
                setStopped(false);
                // beside the page on a wide screen, above it on a narrow one: close it only when it is in the way
                if (!window.matchMedia("(min-width: 1100px)").matches) setShowHistory(false);
              }}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
        <main id="main" className="col">
          <form
            className="ask"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label htmlFor="query" className="ask-lead">
              What do you want to research?
            </label>
            <textarea
              id="query"
              ref={textareaRef}
              className="input"
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="For example: laws on cage-free eggs, or who campaigns against animal testing in cosmetics"
              disabled={loading}
              aria-describedby="query-help"
            />
            <p id="query-help" className="ask-help">
              Enter to research, Shift+Enter for a new line.
            </p>
            <div className="ask-row">
              <div className="field">
                <label className="lab" htmlFor="region">
                  Focus region
                </label>
                <select id="region" className="select" value={region} onChange={(e) => setRegion(e.target.value)} disabled={loading}>
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <span className="hint">Steers how the answer is written. The web search is not filtered by region.</span>
              </div>
              <div className="actions">
                {(current || failure || stopped) && !loading && (
                  <button type="button" className="btn" onClick={clear}>
                    <X aria-hidden="true" /> Clear
                  </button>
                )}
                <button type="submit" className="btn btn-primary" disabled={!message.trim() || loading}>
                  <Search aria-hidden="true" /> {loading ? "Researching" : "Research"}
                </button>
              </div>
            </div>
          </form>

          <div aria-live="polite">
            {loading && (
              <div className="note" role="status">
                <WaitMark />
                <div>
                  <b>Researching “{asked}”</b>
                  <p>
                    Searching the web, reading three pages and writing the brief. This usually takes under half a minute.{" "}
                    <span className="mono nowrap" aria-hidden="true">{elapsed} s so far</span>
                  </p>
                </div>
                <div className="note-actions">
                  <button type="button" className="btn btn-sm" onClick={() => abortRef.current?.abort()}>
                    Stop waiting
                  </button>
                </div>
              </div>
            )}

            {stopped && (
              <div className="note" role="status">
                <WaitMark />
                <div>
                  <b>Stopped waiting</b>
                  <p>The workflow may still finish on its own, but its answer will not be shown here. Ask again to start a new run.</p>
                </div>
              </div>
            )}

            {failure && (
              <div className="note is-error" role="alert">
                <FailMark />
                <div>
                  <b>The research did not finish</b>
                  <p>{failure.message}</p>
                  <p>Check that the n8n workflow is running and active, then try again.</p>
                </div>
                <div className="note-actions">
                  <button type="button" className="btn btn-sm" onClick={() => submit(failure.query)}>
                    Try again
                  </button>
                </div>
              </div>
            )}
          </div>

          {showStarters && (
            <>
              <section className="starters" aria-labelledby="starters-title">
                <h2 id="starters-title">Starting points</h2>
                <ul>
                  {STARTERS.map((q) => (
                    <li key={q}>
                      <button type="button" className="btn btn-text" style={{ width: "100%" }} onClick={() => submit(q)}>
                        {q}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="how" aria-labelledby="how-title">
                <h2 id="how-title" style={{ fontSize: "1rem" }}>How to read a line</h2>
                <p style={{ marginTop: 6 }}>
                  The workflow searches the web, reads the top three pages and asks Gemini for findings. A finding is kept only if it links to one of
                  those three pages, and every kept line ends in a label that says which.
                </p>
                <div className="anatomy">
                  <div className="cite" data-src="A">
                    <span className="cite-link" aria-hidden="true">
                      <span className="tab">A</span>
                      <span className="cite-host">example.org</span>
                      <span className="cite-title">Title of the page</span>
                    </span>
                  </div>
                  <dl>
                    <dt>A</dt>
                    <dd>which of the pages read, in the colour of its entry in the key above the lines</dd>
                    <dt>Host</dt>
                    <dd>the site the line came from; select the label to open the page</dd>
                    <dt>Title</dt>
                    <dd>what the page calls itself</dd>
                  </dl>
                  <p className="anatomy-cap">An example label, not a result.</p>
                </div>
              </section>
            </>
          )}

          {current && (
            <Brief
              key={current.id}
              ref={briefRef}
              run={current}
              opened={opened}
              onOpen={markOpened}
              onFollowUp={(q) => {
                window.scrollTo({ top: 0 });
                submit(q);
              }}
            />
          )}
        </main>

      </div>
    </>
  );
}
