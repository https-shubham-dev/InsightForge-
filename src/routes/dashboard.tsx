import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Sparkles, Play, AlertCircle, Lightbulb, ListChecks, FileText, Download } from "lucide-react";
import { useDataStore, useSettingsStore } from "@/store/dataStore";
import { MissingKeysBanner } from "@/components/MissingKeysBanner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

interface Sections {
  summary: string;
  insights: string;
  anomalies: string;
  recommendations: string;
}

function cleanText(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/\*/g, "");
}

function renderBody(body: string) {
  if (!body) return <span className="text-muted-foreground">—</span>;
  const lines = body.split("\n").filter(l => l.trim() !== "");
  return (
    <ul className="space-y-2">
      {lines.map((line, i) => {
        const isBullet = /^\s*[\*\-•]\s+/.test(line);
        const clean = line
          .replace(/^\s*[\*\-•]\s+/, "")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1");
        return (
          <li key={i} className="flex gap-2.5 text-sm text-muted-foreground leading-relaxed">
            {isBullet && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary/50 mt-[7px]" />}
            <span className={isBullet ? "" : "list-none"}>{clean}</span>
          </li>
        );
      })}
    </ul>
  );
}

function parseSections(text: string): Sections {
  const grab = (label: string, next: string[]) => {
    const re = new RegExp(`(?:\\*\\*\\s*)?${label}\\s*(?:\\*\\*)?\\s*:?\\s*\\n+([\\s\\S]*?)(?=\\n\\s*(?:\\*\\*\\s*)?(?:${next.join("|")})\\s*(?:\\*\\*)?\\s*:?|$)`, "i");
    const m = text.match(re);
    return m?.[1]?.trim() ?? "";
  };
  return {
    summary: grab("Summary", ["Key Insights", "Insights", "Anomalies", "Recommendations"]) || text.slice(0, 400),
    insights: grab("Key Insights", ["Anomalies", "Recommendations"]) || grab("Insights", ["Anomalies", "Recommendations"]),
    anomalies: grab("Anomalies", ["Recommendations"]),
    recommendations: grab("Recommendations", ["$"]),
  };
}

function DashboardPage() {
  const { columns, rows, report } = useDataStore();
  const { groqKey } = useSettingsStore();
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<Sections | null>(null);
  const [error, setError] = useState<string | null>(null);

  const missing = !groqKey ? ["Groq"] : [];
  const hasData = columns.length > 0 && rows.length > 0;

  const run = async () => {
    if (!groqKey) { setError("Add your Groq API key in Settings."); return; }
    if (!hasData) { setError("Upload a dataset first."); return; }
    setError(null); setLoading(true); setSections(null);

    const sample = rows.slice(0, 10);
    const colStats = columns.map(col => {
      const vals = rows.map(r => r[col]).filter(v => v !== null && v !== "" && v !== undefined);
      const numeric = vals.filter(v => !isNaN(Number(v))).map(Number);
      const unique = [...new Set(vals)].slice(0, 5);
      return {
        name: col,
        type: numeric.length > vals.length * 0.7 ? "numeric" : "categorical",
        uniqueSample: unique,
        ...(numeric.length > 0 ? {
          min: Math.min(...numeric), max: Math.max(...numeric),
          avg: Math.round((numeric.reduce((a, b) => a + b, 0) / numeric.length) * 100) / 100
        } : {})
      };
    });

    const prompt = `You are a senior data analyst writing a professional report. Analyze this dataset and respond in EXACTLY this format — no asterisks, no markdown, no bold:

Summary:
Write 2-3 clear professional sentences summarizing the dataset.

Key Insights:
- First key finding
- Second key finding
- Third key finding
- Fourth key finding

Anomalies:
- First anomaly or data quality issue
- Second anomaly

Recommendations:
- First actionable recommendation
- Second actionable recommendation
- Third actionable recommendation

Dataset info: ${rows.length} rows, ${columns.length} columns
Column statistics: ${JSON.stringify(colStats)}
Sample rows (10): ${JSON.stringify(sample)}`;

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500
        }),
      });
      if (!res.ok) { const t = await res.text(); throw new Error(`Groq error ${res.status}: ${t.slice(0, 200)}`); }
      const data = await res.json();
      const text: string = data.choices?.[0]?.message?.content ?? "";
      if (!text) throw new Error("Empty response from Groq.");
      setSections(parseSections(text));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════
// REPLACE the entire downloadPDF function in dashboard.tsx
// ══════════════════════════════════════════════════

const downloadPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const PW = 210;
  const PH = 297;

  const MARGIN = 16;
  const WIDTH = PW - MARGIN * 2;

  let y = 20;

  // COLORS
  const DARK = [15, 23, 42];
  const ACCENT = [99, 102, 241];
  const TEXT = [55, 65, 81];
  const LIGHT = [148, 163, 184];

  // ── HEADER ─────────────────────────────
  doc.setFillColor(...DARK);
  doc.rect(0, 0, PW, 35, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("AutoInsight AI", MARGIN, 18);

  doc.setFontSize(9);
  doc.setTextColor(...LIGHT);
  doc.text("DATA ANALYSIS REPORT", MARGIN, 25);

  y = 45;

  // ── TEXT BLOCK ─────────────────────────
  const writeText = (text: string) => {
    const lines = doc.splitTextToSize(text.replace(/\n/g, " "), WIDTH);

    for (const line of lines) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(...TEXT);
      doc.setFontSize(10);
      doc.text(line, MARGIN, y);
      y += 6;
    }
  };

  // ── BULLETS ────────────────────────────
  const writeBullets = (text: string) => {
    const lines = text.split("\n").filter(Boolean);

    lines.forEach((line) => {
      const clean = line.replace(/^[-•]\s*/, "");
      const wrapped = doc.splitTextToSize(clean, WIDTH - 8);

      wrapped.forEach((w, i) => {
        if (y > 280) {
          doc.addPage();
          y = 20;
        }

        if (i === 0) {
          doc.setFillColor(...ACCENT);
          doc.circle(MARGIN, y - 1.5, 1, "F");
        }

        doc.setTextColor(...TEXT);
        doc.text(w, MARGIN + 5, y);
        y += 6;
      });

      y += 2;
    });
  };

  // ── SECTION ────────────────────────────
  const section = (title: string, body: string, bullets = false) => {
    if (y > 260) {
      doc.addPage();
      y = 20;
    }

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...DARK);
    doc.text(title.toUpperCase(), MARGIN, y);

    // ✅ FIXED UNDERLINE (dynamic width)
    const titleWidth = doc.getTextWidth(title.toUpperCase());

    doc.setDrawColor(...ACCENT);
    doc.setLineWidth(0.6);
    doc.line(MARGIN, y + 2, MARGIN + titleWidth + 4, y + 2);

    // ✅ optional premium accent bar (uncomment if you want better look)
    // doc.setFillColor(...ACCENT);
    // doc.rect(MARGIN - 5, y - 4, 2, 10, "F");

    y += 8;

    // Body
    if (bullets) writeBullets(body);
    else writeText(body);

    y += 6;
  };

  // ── CONTENT ────────────────────────────
  if (sections) {
    section("Executive Summary", sections.summary);
    section("Key Insights", sections.insights, true);
    section("Anomalies", sections.anomalies, true);
    section("Recommendations", sections.recommendations, true);
  }

  // ── FOOTER ─────────────────────────────
  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setFontSize(8);
    doc.setTextColor(...LIGHT);
    doc.text(
      `Confidential • AutoInsight AI • Page ${i} of ${totalPages}`,
      PW / 2,
      PH - 10,
      { align: "center" }
    );
  }

  doc.save(`AutoInsight_Report_${Date.now()}.pdf`);
};
    const cards = sections ? [
    { title: "Summary",         icon: FileText,    body: sections.summary },
    { title: "Key Insights",    icon: Lightbulb,   body: sections.insights },
    { title: "Anomalies",       icon: AlertCircle, body: sections.anomalies },
    { title: "Recommendations", icon: ListChecks,  body: sections.recommendations },
  ] : [];

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">AI-powered analysis of your dataset.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={run} disabled={loading || !hasData} className="bg-primary text-primary-foreground">
            <Play className="h-4 w-4" /> {loading ? "Analyzing..." : "Run Analysis"}
          </Button>
          {sections && (
            <Button onClick={downloadPDF} variant="outline">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <MissingKeysBanner missing={missing} />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {!hasData && !loading && !sections && (
        <div className="bg-card border border-border shadow-sm rounded-xl mt-4 flex flex-col items-center justify-center p-16 text-center">
          <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h2 className="mt-6 text-xl font-semibold">Upload data to begin</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Once you upload a file, click Run Analysis to get AI-generated insights.
          </p>
        </div>
      )}

      {hasData && !sections && !loading && (
        <div className="bg-card border border-border shadow-sm rounded-xl mt-4 p-6 text-sm text-muted-foreground">
          {report?.cleanedRows.toLocaleString()} rows · {columns.length} columns ready.
          <span className="ml-1 inline-flex items-center gap-1 text-primary">
            <Sparkles className="h-3 w-3" /> Click Run Analysis to start.
          </span>
        </div>
      )}

      {loading && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="bg-card border border-border shadow-sm rounded-xl p-6">
              <Skeleton className="h-5 w-32" />
              <div className="mt-4 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
                <Skeleton className="h-3 w-3/6" />
              </div>
            </div>
          ))}
        </div>
      )}

      {sections && (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {cards.map(({ title, icon: Icon, body }) => (
            <div key={title} className="bg-card border border-border shadow-sm rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg shrink-0">
                  <Icon className="h-4 w-4 text-primary-foreground" />
                </div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h3>
              </div>
              {renderBody(body)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
