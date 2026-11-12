// Runs the Code nodes of n8n-workflow.json with stubbed inputs (the search, page fetch and
// LLM calls are n8n HTTP nodes, so no network or keys are needed). Run with: npm test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

type Json = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const workflow = JSON.parse(readFileSync('n8n-workflow.json', 'utf8'));

function run(nodeName: string, input: Json[], nodes: Record<string, Json[]> = {}): Json[] {
  const code = workflow.nodes.find((n: Json) => n.name === nodeName).parameters.jsCode;
  const items = (list: Json[]) => ({ first: () => list[0], all: () => list });
  return new Function('$input', '$', code)(items(input), (name: string) => items(nodes[name] ?? []));
}

const webhook = [{ json: { body: { query: 'cage-free egg laws', region: 'EU' } } }];
const pages = ['https://example.org/a', 'https://example.org/b/', 'https://example.org/c'];
const searchResults = pages.map((url, i) => ({ json: { url, title: `Page ${i}`, snippet: `snippet ${i}` } }));
const fetched = [
  { json: { data: '<p>Page a text</p>' } },
  { json: { data: '<script>x()</script><p>Page b text</p>' } },
  { json: { error: { message: '403 - credits exhausted' } } }, // continueOnFail output
];
const aggregate = run('Aggregate and Clean', fetched, { 'Split URLs': searchResults, 'Webhook Trigger': webhook })[0].json;
const request = run('Build LLM Request', [{ json: aggregate }], { 'Webhook Trigger': webhook })[0].json;
const format = (reply: string) =>
  run('Format Response', [{ json: { choices: [{ message: { content: reply } }] } }], {
    'Build LLM Request': [{ json: request }],
    'Webhook Trigger': webhook,
  })[0].json;

test('the prompt asks for the url of the page behind every insight, organization, trend and action', () => {
  for (const key of ['insights', 'organizations', 'trends', 'actions']) {
    assert.ok(request.systemMsg.includes(`"${key}": [{ "text": string, "url": string }]`), key);
  }
});

test('items keep a link to a page the workflow read; items citing any other page are dropped', () => {
  const reply = '<think>reasoning</think>\n```json\n' + JSON.stringify({
    insights: [
      { text: 'Cited', url: 'https://example.org/a' },
      { text: 'Invented source', url: 'https://elsewhere.com/x' },
      'No source at all',
    ],
    organizations: [{ text: 'Org', url: 'https://example.org/b' }],
    trends: [],
    actions: [{ text: 'Act', url: ' https://example.org/c/ ' }],
    evidence: [
      { title: 'kept', explanation: 'x', url: 'https://example.org/a' },
      { title: 'dropped', explanation: 'y', url: 'https://nope.com' },
    ],
    followUps: ['next question'],
  }) + '\n```';

  const out = format(reply);

  assert.deepEqual(out.insights, [{ text: 'Cited', url: 'https://example.org/a' }]);
  assert.deepEqual(out.organizations, [{ text: 'Org', url: 'https://example.org/b/' }]); // the page's own link
  assert.deepEqual(out.actions, [{ text: 'Act', url: 'https://example.org/c' }]);
  assert.deepEqual(out.evidence.map((e: Json) => e.title), ['kept']);
  assert.equal(out.sources.length, 3);
});

test("the AI step calls Google's Gemini API with the key from n8n's settings, and its answer is read", () => {
  const llm = workflow.nodes.find((n: Json) => n.name === 'Gemini LLM');
  assert.match(llm.parameters.url, /^https:\/\/generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-[\w.-]+:generateContent$/);
  assert.ok(JSON.stringify(llm.parameters).includes('$env.GEMINI_API_KEY'), 'the key must come from settings, never the file');
  const answer = { insights: [{ text: 'Cited', url: 'https://example.org/a' }] };
  const gemini = { candidates: [{ content: { parts: [{ text: 'hidden reasoning', thought: true }, { text: JSON.stringify(answer) }] } }] };
  const out = run('Format Response', [{ json: gemini }], { 'Build LLM Request': [{ json: request }], 'Webhook Trigger': webhook })[0].json;
  assert.deepEqual(out.insights, [{ text: 'Cited', url: 'https://example.org/a' }]);
});

test('a page that failed to load adds only its search snippet, never the error text', () => {
  assert.ok(!aggregate.combinedContext.includes('credits exhausted'));
  assert.ok(aggregate.combinedContext.includes('snippet 2'));
  assert.ok(!aggregate.combinedContext.includes('x()')); // scripts are stripped from fetched pages
});

test('an answer with a label before its JSON is still read (Gemini wrote "@json" on 13 Nov)', () => {
  const reply = '<think>\n</think>@json\n' + JSON.stringify({ insights: [{ text: 'Cited', url: 'https://example.org/a' }] });
  assert.deepEqual(format(reply).insights, [{ text: 'Cited', url: 'https://example.org/a' }]);
});

test('an answer that is not JSON still returns a message rather than an empty brief', () => {
  assert.match(format('sorry, no JSON here').insights[0], /Failed to parse strict JSON/);
});
