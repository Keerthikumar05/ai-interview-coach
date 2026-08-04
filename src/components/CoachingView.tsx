import React from "react";
import { GraduationCap, RefreshCw, ArrowLeft } from "lucide-react";

const DRILLS: Record<number, string[]> = {
  1: ["Practise 10 time-and-work problems daily", "Drill percentage and ratio shortcuts", "Time-box each question to 60 seconds"],
  2: ["Record a 90-second self-introduction and cut filler words", "Practise STAR answers out loud", "Read technical articles aloud for fluency"],
  3: ["Solve 3 array/string problems daily", "State time and space complexity for every solution", "Explain your approach before you code"],
  4: ["Prepare 3 STAR stories: conflict, failure, achievement", "Research the company's values", "Prepare 2 questions to ask the interviewer"],
};

export default function CoachingView({ roundNumber, roundName, score, onRetake, onExit }: any) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[11px] font-black text-zinc-500 hover:text-indigo-500">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </button>

      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 space-y-4">
        <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
          <GraduationCap className="w-5 h-5 text-indigo-500" /> Coaching: {roundName}
        </h1>
        <p className="text-xs text-zinc-500">
          You scored <strong className="text-indigo-500">{score}%</strong> in round {roundNumber}. Work through these targeted drills before retaking.
        </p>
        <ul className="space-y-2">
          {(DRILLS[roundNumber] || DRILLS[1]).map((d) => (
            <li key={d} className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-300">{d}</li>
          ))}
        </ul>
        <button onClick={onRetake} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4" /> Retake this interview
        </button>
      </section>
    </div>
  );
}
