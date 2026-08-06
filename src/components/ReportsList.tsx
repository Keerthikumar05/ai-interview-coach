import React, { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

export default function ReportsList({ setView, setReportSession, token }: any) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/summary", { headers: { Authorization: `Bearer ${token}` } })
      .then(readJson)
      .then((d) => setSessions(d.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p className="text-xs text-zinc-400 flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading reports…</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
        <FileText className="w-5 h-5 text-indigo-500" /> Your reports
      </h1>
      {sessions.length === 0 ? (
        <p className="text-xs text-zinc-500">No completed interviews yet. Finish a mock interview to generate a scorecard.</p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => { setReportSession(s); setView(`session-report-${s.id}`); }}
                className="w-full text-left p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 flex items-center justify-between gap-4"
              >
                <span>
                  <span className="block text-xs font-black text-zinc-900 dark:text-zinc-50">{s.company} — {s.targetRole}</span>
                  <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{new Date(s.startedAt).toLocaleString()}</span>
                </span>
                <span className="text-xl font-black font-mono text-indigo-500">{s.overallScore ?? 0}%</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
