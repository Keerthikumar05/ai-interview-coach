import React from "react";
import { Map } from "lucide-react";

const DEFAULT_ROADMAP = [
  { week: "Week 1", task: "Solve 3 arrays/strings problems daily and log complexity." },
  { week: "Week 2", task: "Record answers and cut filler words below two per minute." },
  { week: "Week 3", task: "Review OOP and SOLID principles; explain them aloud." },
  { week: "Week 4", task: "Run two full mock interviews and review the scorecards." },
];

export default function PlacementRoadmap({ session, user, setView }: any) {
  const roadmap = session?.finalReport?.roadmap?.length ? session.finalReport.roadmap : DEFAULT_ROADMAP;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
        <Map className="w-5 h-5 text-indigo-500" /> Placement roadmap
      </h1>
      <p className="text-xs text-zinc-500">
        A four-week plan tailored for {user?.name || "you"} targeting {user?.targetRole || "Software Engineer"} roles.
      </p>
      <ol className="space-y-3">
        {roadmap.map((step: any, i: number) => (
          <li key={i} className="flex gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center">{i + 1}</span>
            <div>
              <p className="text-xs font-black text-zinc-900 dark:text-zinc-50">{step.week}</p>
              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">{step.task}</p>
            </div>
          </li>
        ))}
      </ol>
      <button onClick={() => setView("dashboard")} className="text-[11px] font-black text-zinc-500 hover:text-indigo-500">Back to dashboard</button>
    </div>
  );
}
