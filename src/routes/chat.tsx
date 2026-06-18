import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { Send, MessageSquare, Sparkles } from "lucide-react";
import { useDataStore, useSettingsStore } from "@/store/dataStore";
import { MissingKeysBanner } from "@/components/MissingKeysBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/chat")({
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    const formatted = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`(.+?)`/g, "<code class='bg-white/10 px-1 rounded text-xs'>$1</code>");
    return (
      <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} className="block" />
    );
  });
}

function ChatPage() {
  const { columns, rows } = useDataStore();
  const { groqKey } = useSettingsStore();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const missing = !groqKey ? ["Groq"] : [];
  const hasData = columns.length > 0 && rows.length > 0;

  const send = async () => {
    if (!input.trim() || loading) return;
    if (!groqKey) { setError("Add your Groq API key in Settings."); return; }
    if (!hasData) { setError("Please upload a dataset first"); return; }
    setError(null);
    const userMsg: Msg = { role: "user", content: input.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    const sample = rows.slice(0, 20);
    const system = `You are a helpful data analyst. The user has uploaded a dataset with these columns: ${JSON.stringify(columns)}.
Here are the first 20 rows as JSON:
${JSON.stringify(sample)}
Answer questions about this data clearly and concisely. Use plain text formatting only — no markdown asterisks or symbols.`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "system", content: system }, ...next.map((m) => ({ role: m.role, content: m.content }))],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Groq error ${res.status}: ${t.slice(0, 200)}`);
      }
      const data = await res.json();
      const reply: string = data.choices?.[0]?.message?.content ?? "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col py-8">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-sm text-muted-foreground">Ask questions about your data in plain English.</p>
      </div>

      <div className="mt-6">
        <MissingKeysBanner missing={missing} />
      </div>

      <div className="bg-card border border-border shadow-sm rounded-xl mt-2 flex flex-1 flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
          {messages.length === 0 && !loading && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="bg-primary text-primary-foreground flex h-14 w-14 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]">
                <MessageSquare className="h-7 w-7 text-primary-foreground" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">
                {hasData ? "Ask anything about your dataset" : "Please upload a dataset first"}
              </h2>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {hasData
                  ? `${rows.length.toLocaleString()} rows · ${columns.length} columns ready to analyze.`
                  : "Head to Upload to add a CSV or Excel file."}
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Sparkles className="h-3 w-3" /> Powered by Groq
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground text-primary-foreground"
                    : "border border-white/10 bg-white/5 text-foreground"
                }`}
              >
                {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
              </div>
            </div>
          )}
        </div>

        {error && <div className="border-t border-destructive/30 bg-destructive/10 px-6 py-2 text-xs text-destructive">{error}</div>}

        <div className="flex gap-2 border-t border-white/10 p-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={hasData ? "Ask about your data..." : "Upload a dataset to start chatting"}
            disabled={loading}
          />
          <Button onClick={send} disabled={loading || !input.trim()} className="bg-primary text-primary-foreground">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
