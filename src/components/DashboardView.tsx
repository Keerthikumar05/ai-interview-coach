import React, { useState } from "react";
import { Rocket, Loader2, AlertTriangle } from "lucide-react";

export default function DashboardView({ user, onStartSession, setView, token, isThinking, sessionError, setSessionError }: any) {
  const [company, setCompany] = useState("TCS");
  const [role, setRole] = useState(user?.targetRole || "Software Engineer");
  const [difficulty, setDifficulty] = useState("medium");
  const [jdText, setJdText] = useState("");
  const [startRound, setStartRound] = useState(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
          Welcome back, {user?.name || "Candidate"}
        </h1>
        <p className="text-xs text-zinc-500 mt-1">Configure a mock interview and get scored like the real thing.</p>
      </div>

      {sessionError && (
        <div className="flex items-start gap-2 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-xs text-red-600">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="flex-1">{sessionError}</span>
          <button onClick={() => setSessionError(null)} className="font-black">Dismiss</button>
        </div>
      )}

      <section id="configure-interview-panel" className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
        <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-50">Configure your mock interview</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target company</span>
            <select value={company} onChange={(e) => setCompany(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
              {["TCS", "Infosys", "Wipro", "Google", "Microsoft", "Amazon"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target role</span>
            <input value={role} onChange={(e) => setRole(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold" />
          </label>
          <label className="block">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
              {["easy", "medium", "hard", "adaptive"].map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Job description (optional)</span>
          <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={4} placeholder="Paste the job description to tailor questions…" className="w-full mt-1 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs" />
        </label>

        <div className="flex flex-wrap gap-2">
          {["Aptitude Assessment", "Communication Assessment", "Technical Coding Round", "HR fit Round"].map((r, i) => (
            <button key={r} onClick={() => setStartRound(i + 1)} className={`px-3 py-2 rounded-xl text-[11px] font-bold border ${startRound === i + 1 ? "bg-indigo-600 border-indigo-600 text-white" : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500"}`}>
              Start at: {r}
            </button>
          ))}
        </div>

        <button
          onClick={() => onStartSession({ company, targetRole: role, difficulty, jdText, language: "en", startRound })}
          disabled={isThinking}
          className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs flex items-center justify-center gap-2"
        >
          {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
          Start mock interview
        </button>
      </section>

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Reports", desc: "Review past scorecards", view: "reports" },
          { label: "Academy", desc: "Targeted coaching drills", view: "academy" },
          { label: "Roadmap", desc: "Your 4-week placement plan", view: "roadmap" },
        ].map((c) => (
          <button key={c.view} onClick={() => setView(c.view)} className="text-left p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 transition-colors">
            <p className="text-sm font-black text-zinc-900 dark:text-zinc-50">{c.label}</p>
            <p className="text-[11px] text-zinc-500 mt-1">{c.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
