"use client";

import { X } from "lucide-react";
import type { ResearchRun } from "@/lib/brief";

interface HistoryProps {
  runs: ResearchRun[];
  currentId: number | null;
  onOpen: (run: ResearchRun) => void;
  onClose: () => void;
}

const when = (t: number) => new Date(t).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** A side drawer, not a modal: the page stays usable beside it. */
export function History({ runs, currentId, onOpen, onClose }: HistoryProps) {
  return (
    <aside className="drawer" aria-labelledby="history-title">
      <div className="drawer-head">
        <h2 id="history-title">Research history</h2>
        <button type="button" className="toggle" onClick={onClose} aria-label="Close research history">
          <X aria-hidden="true" /> Close
        </button>
      </div>
      <p className="drawer-note">Kept in this tab only. Reloading the page clears it.</p>
      {runs.length === 0 ? (
        <p className="drawer-note">Nothing yet. Each brief you run appears here, newest first.</p>
      ) : (
        <ul className="runs">
          {runs.map((run) => (
            <li key={run.id}>
              <button type="button" className="run" aria-current={run.id === currentId} onClick={() => onOpen(run)}>
                <b>{run.query}</b>
                <span>
                  Focus: {run.region} · {when(run.ranAt)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
