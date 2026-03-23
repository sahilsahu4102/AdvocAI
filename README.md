# 🐾 AI Animal Advocacy Research Agent

An AI-powered research tool for animal rights organizations. Enter a query and get structured insights, relevant organizations, trends, and actionable recommendations — powered by web search and LLM analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss)

---

## ✨ Features

- **AI-Powered Research** — Searches the web and analyzes results with an LLM
- **Structured Output** — Key insights, organizations, trends, and actions
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
- [OpenRouter API Key](https://openrouter.ai/) (free models available)

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
| LLM      | OpenRouter (Gemini Flash)    |
| Workflow | n8n (optional orchestration) |
| Deploy   | Vercel (frontend)            |

---

## 📦 Deployment

### Vercel

```bash
npm run build
# Deploy via Vercel CLI or connect your GitHub repo
```

Set `SERPER_API_KEY` and `OPENROUTER_API_KEY` in Vercel environment variables.

---

## 📄 License

MIT
