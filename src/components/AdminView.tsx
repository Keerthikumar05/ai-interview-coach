import React, { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AdminView({ token, onExit }: any) {
  const [summary, setSummary] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/summary", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setSummary(null));
  }, [token]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
      <button onClick={onExit} className="flex items-center gap-1.5 text-[11px] font-black text-zinc-500 hover:text-indigo-500">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to dashboard
      </button>
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
        <ShieldCheck className="w-5 h-5 text-indigo-500" /> Admin console
      </h1>
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Sessions", value: summary?.totalCount ?? 0 },
          { label: "Selected", value: summary?.selectedCount ?? 0 },
          { label: "Waitlisted", value: summary?.waitlistedCount ?? 0 },
        ].map((c) => (
          <div key={c.label} className="p-5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">{c.label}</p>
            <p className="text-3xl font-black font-mono text-indigo-500 mt-1">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
