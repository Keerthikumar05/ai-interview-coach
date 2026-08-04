import React from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function ReportView({ session, onExit, setView, onStartRetest }: any) {
  const rounds = session?.roundScores || [];
  const overall = session?.overallScore ?? 0;
  const status = session?.selectionStatus || "PENDING";
  const report = session?.finalReport || {};

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[11px] font-black text-zinc-500 hover:text-indigo-500">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </button>

      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
        <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Overall job readiness</p>
        <p className="text-6xl font-black font-mono text-indigo-500 mt-2">{overall}%</p>
        <span className={`inline-block mt-3 px-4 py-1.5 rounded-xl text-[11px] font-black ${status === "SELECTED" ? "bg-emerald-50 text-emerald-600" : status === "WAITLISTED" ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600"}`}>
          {status}
        </span>
        <p className="text-xs text-zinc-500 mt-4 max-w-2xl mx-auto leading-relaxed">
          {report.executiveSummary || "Your session summary will appear here once all rounds are evaluated."}
        </p>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        {rounds.map((r: any) => (
          <div key={r.roundNumber} className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-zinc-800 dark:text-zinc-100">{r.roundName}</p>
              <span className={`text-lg font-black font-mono ${r.passed ? "text-emerald-500" : "text-red-500"}`}>{r.score}%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">{r.feedbackJson?.feedback || "No feedback recorded."}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onStartRetest({})} className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Retake interview
        </button>
        <button onClick={() => setView("academy")} className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-[11px] font-black">
          Open coaching academy
        </button>
      </div>
    </div>
  );
}
