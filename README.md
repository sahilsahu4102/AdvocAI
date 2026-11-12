# 🐾 AI Animal Advocacy Research Agent

An AI-powered research tool for animal rights organizations. Enter a query and get structured insights, relevant organizations, trends, and actionable recommendations — powered by web search and LLM analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ✨ Features

- **AI-Powered Research** — Searches the web and analyzes results with an LLM
- **Structured Output** — Key insights, organizations, trends, and actions, each linked to the page it came from
- **Quick Actions** — Pre-built prompts for common research topics
- **Copy to Clipboard** — Copy any section with one click
- **Research History** — Sidebar with previous queries
- **n8n Workflow** — Ready-to-import workflow for automation
- **Dark Theme** — Nature-inspired emerald design

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- [n8n](https://n8n.io/) installed locally (`npx n8n`) or hosted
- [Serper API Key](https://serper.dev/) (free tier available)
- [Gemini API key](https://aistudio.google.com/apikey) (free tier)

### Quick Start

1. **Set up the n8n Backend**
   Please see the detailed [n8n Setup Guide](./n8n_setup_guide.md) to import the workflow (`n8n-workflow.json`), configure your API keys, and get your webhook URL.

2. **Set up the Frontend**
   ```bash
   # Clone the repo
   git clone <your-repo-url>
   cd app

   # Install dependencies
   npm install

   # Set up environment variables
   cp .env.example .env.local
   ```

3. **Configure Environment**
   Edit `.env.local` and add your n8n webhook URL:
   ```env
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/animal-research
   ```

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
app/
├── src/
│   ├── app/
│   │   ├── api/research/route.ts   # Backend research API
│   │   ├── globals.css              # Theme & animations
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Main page
│   ├── components/ui/
│   │   ├── button.tsx               # shadcn Button
│   │   ├── textarea.tsx             # shadcn Textarea
│   │   └── ruixen-moon-chat.tsx     # Main chat UI
│   └── lib/
│       └── utils.ts                 # cn() utility
├── n8n-workflow.json                # n8n workflow
├── .env.example                     # Env template
└── package.json
```

---

## 🛠️ Tech Stack

| Layer    | Tech                         |
| -------- | ---------------------------- |
| Frontend | Next.js 15, Tailwind CSS 4   |
| Language | TypeScript                   |
| Search   | Serper API (Google Search)   |
| LLM      | Gemini API (Gemini 3.5 Flash-Lite) |
| Workflow | n8n (optional orchestration) |
| Deploy   | Vercel (frontend)            |

---

## 🧪 Tests

```bash
npm test      # 9 tests, no network, no n8n, no API key
```

The Next.js route `src/app/api/research/route.ts` forwards each query to an n8n workflow, so the tests replace `fetch` and the environment and check the route's own behaviour: an empty or non-text query is refused with 400 and nothing is forwarded, a valid query goes to the webhook with the region (default `Global`) and the answer comes back, a missing `N8N_WEBHOOK_URL` is a clear 500, a workflow error is a 502, and an unreachable workflow is a 500. The last one found a real bug, now fixed: the response used to include the private webhook URL.

`tests/workflow.test.ts` runs the workflow's own Code nodes from `n8n-workflow.json` with stubbed inputs: every insight, organization, trend and action must cite one of the pages the workflow read (an item citing any other page, or none, is dropped), and a page that fails to load contributes only its search snippet, not the error text. The search, page fetch and model calls are n8n HTTP nodes and are not covered. GitHub Actions runs the tests and a type check on every push.

---

## 📦 Deployment

### Vercel

```bash
npm run build
# Deploy via Vercel CLI or connect your GitHub repo
```

The web app needs only `N8N_WEBHOOK_URL`. The workflow reads `SERPER_API_KEY`, `SCRAPINGDOG_API_KEY` and `GEMINI_API_KEY` from n8n's environment; start n8n with `N8N_BLOCK_ENV_ACCESS_IN_NODE=false` so it can read them.

---

## 📄 License

MIT
