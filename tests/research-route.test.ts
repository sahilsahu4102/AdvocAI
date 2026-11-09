// The research API route is a thin proxy to an n8n workflow. These tests replace fetch and the
// environment, so no n8n, no network and no API key are needed. Run with: npm test.
import { test, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';

import { POST } from '../src/app/api/research/route';

const WEBHOOK = 'https://n8n.example.com/webhook/secret-path-123';
const original = { fetch: globalThis.fetch, url: process.env.N8N_WEBHOOK_URL };

beforeEach(() => {
  process.env.N8N_WEBHOOK_URL = WEBHOOK;
  mock.method(console, 'error', () => {}); // the route logs failures; keep the test output clean
});
afterEach(() => {
  globalThis.fetch = original.fetch;
  if (original.url === undefined) delete process.env.N8N_WEBHOOK_URL;
  else process.env.N8N_WEBHOOK_URL = original.url;
  mock.restoreAll();
});

const ask = (body: unknown) => POST(new Request('http://localhost/api/research', { method: 'POST', body: JSON.stringify(body) }) as never);
const stubFetch = (impl: (url: string, init: RequestInit) => Promise<Response>) => {
  const calls: { url: string; body: unknown }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url, body: JSON.parse(String(init.body)) });
    return impl(url, init);
  }) as typeof fetch;
  return calls;
};

test('a missing, empty or non-text query is refused with 400 and nothing is forwarded', async () => {
  const calls = stubFetch(async () => Response.json({}));
  for (const body of [{}, { query: '' }, { query: 42 }, { query: null }]) {
    assert.equal((await ask(body)).status, 400, JSON.stringify(body));
  }
  assert.equal(calls.length, 0);
});

test('the query is forwarded to the workflow with the region, defaulting to Global, and its answer is returned', async () => {
  const calls = stubFetch(async () => Response.json({ report: 'ok' }));
  const r = await ask({ query: 'factory farming in Punjab' });
  assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { report: 'ok' });
  assert.deepEqual(calls, [{ url: WEBHOOK, body: { query: 'factory farming in Punjab', region: 'Global' } }]);

  const calls2 = stubFetch(async () => Response.json({}));
  await ask({ query: 'x', region: 'India' });
  assert.equal((calls2[0].body as { region: string }).region, 'India');
});

test('without a webhook configured the route says so (500) and forwards nothing', async () => {
  delete process.env.N8N_WEBHOOK_URL;
  const calls = stubFetch(async () => Response.json({}));
  const r = await ask({ query: 'x' });
  assert.equal(r.status, 500);
  assert.match((await r.json()).error, /N8N_WEBHOOK_URL is not configured/);
  assert.equal(calls.length, 0);
});

test('an error from the workflow is a 502', async () => {
  stubFetch(async () => new Response('boom', { status: 500, statusText: 'Internal Server Error' }));
  const r = await ask({ query: 'x' });
  assert.equal(r.status, 502);
  assert.match((await r.json()).error, /n8n workflow returned an error/);
});

test('when the workflow cannot be reached the caller is told, but never the webhook address', async () => {
  stubFetch(async () => { throw new Error(`connect ECONNREFUSED ${WEBHOOK}`); });
  const r = await ask({ query: 'x' });
  assert.equal(r.status, 500);
  const text = JSON.stringify(await r.json());
  assert.ok(!text.includes('secret-path-123'), 'the webhook URL leaked to the browser');
});
