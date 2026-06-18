import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useRef, useEffect } from "react";
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { parseFile } from "@/lib/parseFile";
import { useDataStore } from "@/store/dataStore";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function LoginGate() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/upload`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-card border border-border shadow-sm rounded-xl w-full max-w-sm p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-1">Login to Continue</h1>
        <p className="text-sm text-muted-foreground mb-8">Sign in to upload and analyze your data</p>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}

function UploadPage() {
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { report, setData } = useDataStore();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      setBusy(true);
      setError(null);
      try {
        const { columns, rows, report } = await parseFile(file);
        setData(columns, rows, report);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to parse file");
      } finally {
        setBusy(false);
      }
    },
    [setData],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) void handleFile(f);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginGate />;
  }

  return (
    <div className="mx-auto max-w-3xl py-12">
      <h1 className="text-4xl font-bold">Upload <span className="text-primary">data</span></h1>
      <p className="mt-2 text-muted-foreground">CSV or Excel — we'll clean it automatically.</p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`bg-card border border-border shadow-sm rounded-xl mt-8 cursor-pointer p-12 text-center transition-all ${dragging ? "border-primary/60 bg-primary/5 scale-[1.01]" : "hover:border-white/20"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }}
        />
        <div className="bg-primary text-primary-foreground mx-auto flex h-16 w-16 items-center justify-center rounded-2xl shadow-[var(--shadow-glow)]">
          <UploadIcon className="h-8 w-8 text-primary-foreground" />
        </div>
        <h3 className="mt-6 text-lg font-semibold">{busy ? "Processing..." : "Drop your file here"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse — .csv, .xlsx, .xls</p>
      </div>

      {error && (
        <div className="bg-card border border-border shadow-sm rounded-xl mt-6 flex items-start gap-3 border-destructive/40 p-4 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
          <span>{error}</span>
        </div>
      )}

      {report && !busy && (
        <div className="bg-card border border-border shadow-sm rounded-xl mt-6 p-6 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Data Quality Report</h2>
          </div>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" /> {report.fileName}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Original rows" value={report.originalRows} />
            <Stat label="Cleaned rows" value={report.cleanedRows} highlight />
            <Stat label="Columns" value={report.columns} />
            <Stat label="Issues fixed" value={report.emptyRowsRemoved + report.duplicatesRemoved} />
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              Empty rows removed: <span className="font-mono text-foreground">{report.emptyRowsRemoved}</span>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2">
              Duplicates removed: <span className="font-mono text-foreground">{report.duplicatesRemoved}</span>
            </div>
          </div>

          <button
            onClick={() => navigate({ to: "/tables" })}
            className="bg-primary text-primary-foreground mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            View data <ArrowRight className="h-4 w-4" />
          </button>
          <Link to="/dashboard" className="ml-2 inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium hover:bg-white/5">
            Open dashboard
          </Link>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border border-white/10 p-4 ${highlight ? "bg-primary/10" : "bg-white/5"}`}>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${highlight ? "text-primary" : ""}`}>{value.toLocaleString()}</div>
    </div>
  );
}
