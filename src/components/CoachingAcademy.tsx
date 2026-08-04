import React from "react";
import { GraduationCap, RefreshCw } from "lucide-react";

const TRACKS = [
  { title: "Aptitude Mastery", items: ["Percentages & ratios", "Time, speed, distance", "Logical sequences"] },
  { title: "Communication Lab", items: ["STAR storytelling", "Filler-word elimination", "Pace and pausing"] },
  { title: "DSA Bootcamp", items: ["Arrays & strings", "Hash maps", "Complexity analysis"] },
  { title: "HR Readiness", items: ["Culture fit answers", "Salary negotiation", "Questions to ask back"] },
];

export default function CoachingAcademy({ session, onExit, setView, onStartRetest }: any) {
  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
          <GraduationCap className="w-5 h-5 text-indigo-500" /> InterviewIQ Academy
        </h1>
        <button onClick={() => onStartRetest({})} className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" /> Practise now
        </button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {TRACKS.map((t) => (
          <section key={t.title} className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-xs font-black text-zinc-900 dark:text-zinc-50">{t.title}</h2>
            <ul className="mt-3 space-y-1.5">
              {t.items.map((i) => (
                <li key={i} className="text-[11px] text-zinc-500 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {i}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <button onClick={onExit} className="text-[11px] font-black text-zinc-500 hover:text-indigo-500">Back to dashboard</button>
    </div>
  );
}
