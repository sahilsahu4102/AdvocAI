// The shape of a research answer and the pure helpers the page reads it with. Nothing here touches the DOM.

/** A line is a plain string (an older workflow, or the parse-failure message) or text plus the page it cites. */
export type Item = string | { text: string; url?: string };

export interface Source {
  title: string;
  link: string;
  snippet: string;
}

export interface Evidence {
  title: string;
  explanation: string;
  url: string;
}

export interface ResearchResult {
  query?: string;
  insights: Item[];
  organizations: Item[];
  trends: Item[];
  actions: Item[];
  evidence?: Evidence[];
  followUps?: string[];
  sources: Source[];
}

export interface ResearchRun {
  id: number;
  query: string;
  region: string;
  ranAt: number;
  result: ResearchResult;
}

export interface Line {
  text: string;
  url?: string;
}

export type SectionId = "insights" | "organizations" | "trends" | "actions";

export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "insights", title: "Key insights" },
  { id: "organizations", title: "Organizations involved" },
  { id: "trends", title: "Trends" },
  { id: "actions", title: "Recommended actions" },
];

/** One letter per page the workflow read. The workflow reads three; the page shows up to six. */
export const LETTERS = ["A", "B", "C", "D", "E", "F"] as const;

export interface Page {
  letter: string;
  source: Source;
  host: string;
}

// The workflow compares URLs this way when it decides whether a line cites a page it read.
export const normUrl = (url: string) => url.trim().replace(/\/+$/, "");

export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

export function pagesOf(result: ResearchResult): Page[] {
  return (result.sources ?? []).slice(0, LETTERS.length).map((source, i) => ({
    letter: LETTERS[i],
    source,
    host: hostOf(source.link),
  }));
}

export function pageFor(pages: Page[], url?: string): Page | undefined {
  if (!url) return undefined;
  const wanted = normUrl(url);
  return pages.find((p) => normUrl(p.source.link) === wanted);
}

export const asLine = (item: Item): Line =>
  typeof item === "string" ? { text: item } : { text: item.text, url: item.url };

/** The workflow's message when the model's answer was not valid JSON. It is not a finding. */
export const isParseFailure = (item: Item): item is string =>
  typeof item === "string" && item.startsWith("Failed to parse");

/** What the workflow said it could not read, or null when the answer parsed. */
export function parseFailure(result: ResearchResult): string | null {
  for (const s of SECTIONS) {
    const hit = (result[s.id] ?? []).find(isParseFailure);
    if (hit) return hit;
  }
  return null;
}

/** The lines of a section that are real findings (the parse-failure message is not one). */
export const findings = (items: Item[] | undefined): Line[] =>
  (items ?? []).filter((i) => !isParseFailure(i)).map(asLine);

export const copyText = (lines: Line[]): string =>
  lines.map((l) => (l.url ? `${l.text} (${l.url})` : l.text)).join("\n");

/** Sections with nothing cited in them: the page tells the reader instead of showing an empty box. */
export function absentSections(result: ResearchResult): string[] {
  return SECTIONS.filter((s) => findings(result[s.id]).length === 0).map((s) => s.title.toLowerCase());
}

/** How many lines (sections and evidence) cite each page, by letter. */
export function countByPage(result: ResearchResult, pages: Page[]): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(pages.map((p) => [p.letter, 0]));
  const urls: (string | undefined)[] = [
    ...SECTIONS.flatMap((s) => findings(result[s.id]).map((l) => l.url)),
    ...(result.evidence ?? []).map((e) => e.url),
  ];
  for (const url of urls) {
    const page = pageFor(pages, url);
    if (page) counts[page.letter] += 1;
  }
  return counts;
}

/** English list: "a", "a and b", "a, b and c". */
export function listPhrase(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}
