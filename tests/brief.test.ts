// The page's pure helpers, run on shapes that real workflow executions returned (n8n execution history,
// 2026-11-12 and 2026-11-13): a full answer, a sparse one, and the parse-failure message.
import test from "node:test";
import assert from "node:assert/strict";
import {
  absentSections,
  asLine,
  copyText,
  countByPage,
  findings,
  hostOf,
  isParseFailure,
  listPhrase,
  pageFor,
  pagesOf,
  parseFailure,
  type ResearchResult,
} from "../src/lib/brief";

const A = "https://www.humaneworld.org/en/issue/animal-testing-research";
const B = "https://www.crueltyfreeinternational.org/";
const C = "https://www.peta.org/issues/animals-used-for-experimentation";

const sources = [
  { title: "Animal testing and research", link: A, snippet: "We are leading efforts worldwide" },
  { title: "Cruelty Free International", link: B, snippet: "Our award-winning campaigns" },
  { title: "Animal Testing: Animals Used in Experiments", link: `${C}/`, snippet: "Conducting groundbreaking" },
];

const full: ResearchResult = {
  query: "Latest campaigns against animal testing",
  insights: [
    { text: "Humane World leads efforts.", url: A },
    { text: "Cruelty Free International runs campaigns.", url: B },
  ],
  organizations: [{ text: "PETA investigates.", url: C }],
  trends: [{ text: "Shift to non-animal methods.", url: A }],
  actions: [],
  evidence: [{ title: "Humane World", explanation: "Leads efforts.", url: A }],
  followUps: ["What alternatives exist?"],
  sources,
};

test("hostOf drops www and survives a bad URL", () => {
  assert.equal(hostOf(A), "humaneworld.org");
  assert.equal(hostOf("not a url"), "source");
});

test("pages get letters in the order the workflow read them", () => {
  const pages = pagesOf(full);
  assert.deepEqual(pages.map((p) => p.letter), ["A", "B", "C"]);
  assert.equal(pages[2].host, "peta.org");
});

test("a cited URL matches its page even with a trailing slash difference", () => {
  const pages = pagesOf(full);
  assert.equal(pageFor(pages, C)?.letter, "C"); // the source link ends in "/", the citation does not
  assert.equal(pageFor(pages, "https://example.org/other"), undefined);
  assert.equal(pageFor(pages, undefined), undefined);
});

test("plain strings still render as lines without a link", () => {
  assert.deepEqual(asLine("an older workflow's line"), { text: "an older workflow's line" });
  assert.deepEqual(asLine({ text: "x", url: A }), { text: "x", url: A });
});

test("the parse-failure message is detected and is not a finding", () => {
  const failed: ResearchResult = {
    insights: ["Failed to parse strict JSON. Raw output: <think>\n</think>@json\n{\n  \"insights\": [..."],
    organizations: [],
    trends: [],
    actions: [],
    evidence: [],
    followUps: [],
    sources,
  };
  assert.ok(isParseFailure(failed.insights[0]));
  assert.match(parseFailure(failed) ?? "", /^Failed to parse/);
  assert.deepEqual(findings(failed.insights), []);
  assert.equal(parseFailure(full), null);
});

test("an older workflow's plain-string line is a finding, not a failure", () => {
  const old: ResearchResult = { ...full, insights: ["A plain insight."] };
  assert.equal(parseFailure(old), null);
  assert.deepEqual(findings(old.insights), [{ text: "A plain insight." }]);
});

test("copy writes text and link per line", () => {
  assert.equal(
    copyText(findings(full.insights)),
    `Humane World leads efforts. (${A})\nCruelty Free International runs campaigns. (${B})`,
  );
  assert.equal(copyText([{ text: "no link" }]), "no link");
});

test("sections with nothing cited are named, so the page can say so", () => {
  assert.deepEqual(absentSections(full), ["recommended actions"]);
  const sparse: ResearchResult = { ...full, organizations: [], trends: [], actions: [] };
  assert.deepEqual(absentSections(sparse), ["organizations involved", "trends", "recommended actions"]);
});

test("each page knows how many lines cite it", () => {
  assert.deepEqual(countByPage(full, pagesOf(full)), { A: 3, B: 1, C: 1 });
});

test("listPhrase reads as English", () => {
  assert.equal(listPhrase([]), "");
  assert.equal(listPhrase(["trends"]), "trends");
  assert.equal(listPhrase(["trends", "actions"]), "trends and actions");
  assert.equal(listPhrase(["a", "b", "c"]), "a, b and c");
});
