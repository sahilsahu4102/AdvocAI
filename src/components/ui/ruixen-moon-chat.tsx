"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  Paperclip,
  Leaf,
  PawPrint,
  Shield,
  TrendingUp,
  Users,
  Search,
  Globe,
  Heart,
  Copy,
  Check,
  Loader2,
  Lightbulb,
  Building2,
  ArrowRight,
  RotateCcw,
  Clock,
  X,
  MapPin,
} from "lucide-react";

/* ─── Auto-resize textarea hook ─── */
interface AutoResizeProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({ minHeight, maxHeight }: AutoResizeProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Infinity)
      );
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    if (textareaRef.current)
      textareaRef.current.style.height = `${minHeight}px`;
  }, [minHeight]);

  return { textareaRef, adjustHeight };
}

// Each item links to the page it came from; a plain string (an older workflow, or the
// parse-failure message) is shown without a link
type Item = string | { text: string; url?: string };
const asSourced = (item: Item) => (typeof item === "string" ? { text: item, url: undefined } : item);
const hostname = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
};

interface ResearchResult {
  query?: string;
  insights: Item[];
  organizations: Item[];
  trends: Item[];
  actions: Item[];
  evidence?: { title: string; explanation: string; url: string }[];
  followUps?: string[];
  sources: { title: string; link: string; snippet: string }[];
}

interface HistoryEntry {
  query: string;
  region: string;
  result: ResearchResult;
  timestamp: string;
}

export default function AnimalAdvocacyChat() {
  const [message, setMessage] = useState("");
  const [region, setRegion] = useState("Global");
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 48,
    maxHeight: 150,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setIsRegionOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (query?: string) => {
    const q = query || message.trim();
    if (!q || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, region }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${res.status})`);
      }

      const data: ResearchResult = await res.json();
      setResult(data);
      setHistory((prev) => [
        {
          query: q,
          region,
          result: data,
          timestamp: new Date().toLocaleString(),
        },
        ...prev,
      ]);
      setMessage("");
      adjustHeight(true);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copySection = async (section: string, content: Item[]) => {
    const lines = content.map(asSourced).map((i) => (i.url ? `${i.text} (${i.url})` : i.text));
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0a0f0d] via-[#0d1a14] to-[#0a1510] flex flex-col items-center overflow-x-hidden">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 right-20 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute bottom-40 left-1/3 w-80 h-80 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Header */}
      <header className="w-full z-10 border-b border-emerald-900/30 bg-black/20 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <PawPrint className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-emerald-100 text-sm">
              Animal Advocacy AI
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 gap-2"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">History</span>
            {history.length > 0 && (
              <span className="bg-emerald-600/50 text-emerald-200 text-xs px-1.5 rounded-full">
                {history.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowHistory(false)}
          />
          <div className="relative ml-auto w-full max-w-sm bg-[#0d1a14]/95 backdrop-blur-xl border-l border-emerald-900/40 h-full overflow-y-auto animate-slide-in">
            <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between sticky top-0 bg-[#0d1a14]/95 backdrop-blur-xl z-10">
              <h2 className="text-emerald-100 font-semibold text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                Research History
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(false)}
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/30 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {history.length === 0 ? (
              <p className="text-emerald-600 text-sm p-4 text-center">
                No research history yet
              </p>
            ) : (
              <div className="p-2">
                {history.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setResult(entry.result);
                      setShowHistory(false);
                      setMessage("");
                    }}
                    className="w-full text-left p-3 rounded-lg hover:bg-emerald-900/20 transition-colors group mb-1"
                  >
                    <div className="flex justify-between items-center w-full">
                      <p className="text-emerald-200 text-sm font-medium truncate group-hover:text-emerald-100 pr-2">
                        {entry.query}
                      </p>
                      <span className="text-[10px] bg-emerald-900/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-800/30 whitespace-nowrap">
                        {entry.region}
                      </span>
                    </div>
                    <p className="text-emerald-600 text-xs mt-1">
                      {entry.timestamp}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div
        className={cn(
          "flex-1 w-full flex flex-col items-center justify-center z-10 transition-all duration-500",
          result ? "pt-8 pb-4 flex-none" : "py-16"
        )}
      >
        <div className="text-center px-4">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300 text-xs font-medium">
              AI-Powered Research Agent
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300 bg-clip-text text-transparent drop-shadow-sm">
            Animal Advocacy Research
          </h1>
          <p className="mt-3 text-emerald-400/70 max-w-lg mx-auto text-sm">
            Research campaigns, trends, and organizations fighting for animal
            rights. Powered by AI to deliver structured, actionable insights.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="w-full max-w-3xl px-4 z-10 mb-6">
        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-emerald-900/40 shadow-2xl shadow-emerald-950/30">
          <Textarea
            id="research-query-input"
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Latest campaigns against animal testing in cosmetics..."
            className={cn(
              "w-full px-4 py-3.5 resize-none border-none",
              "bg-transparent text-emerald-100 text-sm",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-emerald-700 min-h-[48px]"
            )}
            style={{ overflow: "hidden" }}
            disabled={loading}
          />

          <div className="flex items-center justify-between p-3 pt-0">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/30 h-8 w-8"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <div className="relative" ref={regionRef}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRegionOpen(!isRegionOpen)}
                  className="text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 h-8 gap-1.5 font-medium px-2.5"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-xs">{region}</span>
                </Button>
                {/* Custom dropdown since we don't have shadcn Select imported */}
                {isRegionOpen && (
                  <div className="absolute left-0 bottom-full mb-1 w-32 bg-[#0d1a14]/95 backdrop-blur-xl border border-emerald-900/40 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
                    {["Global", "India", "US"].map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setRegion(r);
                          setIsRegionOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 text-xs font-medium transition-colors",
                          region === r
                            ? "bg-emerald-900/40 text-emerald-300"
                            : "text-emerald-600 hover:bg-emerald-900/20 hover:text-emerald-400"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {result && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  className="text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/30 text-xs gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </Button>
              )}
              <Button
                id="research-submit-btn"
                onClick={() => handleSubmit()}
                disabled={!message.trim() || loading}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all",
                  message.trim() && !loading
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-900/40"
                    : "bg-emerald-900/30 text-emerald-700 cursor-not-allowed"
                )}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowUpIcon className="w-4 h-4" />
                )}
                <span className="text-xs font-medium">
                  {loading ? "Researching..." : "Research"}
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {!result && !loading && (
          <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
            <QuickAction
              icon={<Shield className="w-3.5 h-3.5" />}
              label="Animal Testing Campaigns"
              onClick={() => {
                setMessage("Latest campaigns against animal testing");
                handleSubmit("Latest campaigns against animal testing");
              }}
            />
            <QuickAction
              icon={<TrendingUp className="w-3.5 h-3.5" />}
              label="Factory Farming Trends"
              onClick={() => {
                setMessage("Factory farming industry trends and activism");
                handleSubmit("Factory farming industry trends and activism");
              }}
            />
            <QuickAction
              icon={<Globe className="w-3.5 h-3.5" />}
              label="Wildlife Protection"
              onClick={() => {
                setMessage("Wildlife protection laws and enforcement");
                handleSubmit("Wildlife protection laws and enforcement");
              }}
            />
            <QuickAction
              icon={<Heart className="w-3.5 h-3.5" />}
              label="Vegan Movement"
              onClick={() => {
                setMessage("Growth of vegan movement worldwide");
                handleSubmit("Growth of vegan movement worldwide");
              }}
            />
            <QuickAction
              icon={<Users className="w-3.5 h-3.5" />}
              label="Key Organizations"
              onClick={() => {
                setMessage(
                  "Top animal rights organizations and their impact"
                );
                handleSubmit(
                  "Top animal rights organizations and their impact"
                );
              }}
            />
            <QuickAction
              icon={<Search className="w-3.5 h-3.5" />}
              label="Marine Life"
              onClick={() => {
                setMessage("Ocean conservation and marine animal protection");
                handleSubmit(
                  "Ocean conservation and marine animal protection"
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="w-full max-w-3xl px-4 z-10 mb-6">
          <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
            <p className="text-red-600 text-xs mt-1">
              Make sure your API keys are set in .env.local
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="w-full max-w-3xl px-4 z-10 mb-6">
          <div className="bg-black/30 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-8">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <PawPrint className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <p className="text-emerald-300 text-sm font-medium">
                  Researching...
                </p>
                <p className="text-emerald-600 text-xs mt-1">
                  Searching the web and analyzing results with AI
                </p>
              </div>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div
          ref={resultsRef}
          className="w-full max-w-3xl px-4 z-10 pb-12 space-y-4 animate-fade-in"
        >
          {/* Query Header */}
          {result.query && (
            <div className="bg-emerald-900/20 border border-emerald-900/30 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <Search className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-emerald-500/80 text-xs font-medium uppercase tracking-wider mb-0.5">Research Subject</p>
                  <p className="text-emerald-100 text-sm font-medium">{result.query}</p>
                </div>
              </div>
              <div className="bg-emerald-950/50 border border-emerald-900/30 px-2.5 py-1 rounded flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span className="text-emerald-400 text-xs font-medium">Region: {region}</span>
              </div>
            </div>
          )}

          {/* Top Evidence (NEW) */}
          {result.evidence && result.evidence.length > 0 && (
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-2xl p-5 mb-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Globe className="w-4 h-4" />
                </div>
                <h3 className="text-emerald-100 font-semibold text-sm tracking-wide">Top Evidence</h3>
              </div>
              <ul className="space-y-3 relative z-10">
                {result.evidence.map((item, i) => (
                  <li key={i} className="flex flex-col gap-1 border-b border-emerald-900/20 last:border-0 pb-3 last:pb-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 font-medium text-sm hover:text-emerald-200 hover:underline transition-all flex items-center gap-1">
                      {item.title}
                      <ArrowRight className="w-3 h-3 opacity-50" />
                    </a>
                    <span className="text-emerald-600/90 text-xs leading-relaxed">
                      {item.explanation}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Insights */}
          <ResultCard
            icon={<Lightbulb className="w-4 h-4" />}
            title="Key Insights"
            items={result.insights}
            color="emerald"
            copiedSection={copiedSection}
            onCopy={() => copySection("insights", result.insights)}
            sectionId="insights"
          />

          {/* Organizations */}
          <ResultCard
            icon={<Building2 className="w-4 h-4" />}
            title="Organizations Involved"
            items={result.organizations}
            color="teal"
            copiedSection={copiedSection}
            onCopy={() =>
              copySection("organizations", result.organizations)
            }
            sectionId="organizations"
          />

          {/* Trends */}
          <ResultCard
            icon={<TrendingUp className="w-4 h-4" />}
            title="Trends"
            items={result.trends}
            color="cyan"
            copiedSection={copiedSection}
            onCopy={() => copySection("trends", result.trends)}
            sectionId="trends"
          />

          {/* Actions */}
          <ResultCard
            icon={<ArrowRight className="w-4 h-4" />}
            title="Actionable Recommendations"
            items={result.actions}
            color="green"
            copiedSection={copiedSection}
            onCopy={() => copySection("actions", result.actions)}
            sectionId="actions"
          />

          {/* Explore More (Follow-ups) */}
          {result.followUps && result.followUps.length > 0 && (
            <div className="bg-black/30 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/40 flex items-center justify-center text-emerald-400">
                  <Search className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-emerald-200 font-semibold text-sm">Explore More</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.followUps.map((query, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    onClick={() => {
                      setMessage(query);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                      setTimeout(() => handleSubmit(query), 300);
                    }}
                    className="flex items-center gap-1.5 rounded-full border-emerald-800/50 bg-emerald-950/30 text-emerald-300 hover:text-emerald-100 hover:bg-emerald-800/40 hover:border-emerald-500/50 backdrop-blur-sm transition-all text-xs px-3.5 py-1.5 h-auto group"
                  >
                    <Search className="w-3 h-3 text-emerald-600 group-hover:text-emerald-400" />
                    <span>{query}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div className="bg-black/30 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-emerald-900/40 flex items-center justify-center">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <h3 className="text-emerald-200 font-semibold text-sm">
                  Sources
                </h3>
              </div>
              <div className="space-y-2">
                {result.sources.slice(0, 6).map((source, i) => (
                  <a
                    key={i}
                    href={source.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/20 hover:border-emerald-800/30 transition-all group"
                  >
                    <p className="text-emerald-300 text-sm font-medium group-hover:text-emerald-200 truncate">
                      {source.title}
                    </p>
                    <p className="text-emerald-600 text-xs mt-1 line-clamp-2">
                      {source.snippet}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-emerald-900/20 bg-black/20 backdrop-blur-sm z-10 mt-auto">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-center">
          <p className="text-emerald-800 text-xs">
            AI Animal Advocacy Research Agent • Powered by Serper & Gemini
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Result Card Component ─── */
interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  items: Item[];
  color: string;
  copiedSection: string | null;
  onCopy: () => void;
  sectionId: string;
}

function ResultCard({
  icon,
  title,
  items,
  copiedSection,
  onCopy,
  sectionId,
}: ResultCardProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-black/30 backdrop-blur-xl border border-emerald-900/30 rounded-2xl p-5 hover:border-emerald-800/40 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-900/40 flex items-center justify-center text-emerald-400">
            {icon}
          </div>
          <h3 className="text-emerald-200 font-semibold text-sm">{title}</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
          className="text-emerald-600 hover:text-emerald-400 hover:bg-emerald-900/30 h-7 px-2 gap-1"
        >
          {copiedSection === sectionId ? (
            <>
              <Check className="w-3 h-3" />
              <span className="text-xs">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="text-xs">Copy</span>
            </>
          )}
        </Button>
      </div>
      <ul className="space-y-2">
        {items.map(asSourced).map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/60 mt-2 flex-shrink-0" />
            <span className="text-emerald-300/80 text-sm leading-relaxed">
              {item.text}
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-xs text-emerald-500 hover:text-emerald-300 hover:underline whitespace-nowrap"
                >
                  {hostname(item.url)}
                </a>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Quick Action Component ─── */
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon, label, onClick }: QuickActionProps) {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full border-emerald-900/40 bg-black/30 text-emerald-500 hover:text-emerald-300 hover:bg-emerald-900/20 hover:border-emerald-700/40 backdrop-blur-sm transition-all text-xs px-3.5 py-1.5 h-auto"
    >
      {icon}
      <span>{label}</span>
    </Button>
  );
}
