import React, { useState } from "react";
import { UserCog, Save } from "lucide-react";

export default function ProfileSettingsView({ user, setUser, experienceLevel, setExperienceLevel, targetRole, setTargetRole, techStack, setTechStack, setView }: any) {
  const [name, setName] = useState(user?.name || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const updated = {
      ...(user || {}),
      name,
      targetRole,
      experienceLevel,
      techStack: techStack.split(",").map((s: string) => s.trim()).filter(Boolean),
    };
    setUser(updated);
    localStorage.setItem("iq_user", JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-8 space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-black text-zinc-900 dark:text-zinc-50">
        <UserCog className="w-5 h-5 text-indigo-500" /> Candidate profile
      </h1>

      <section className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4">
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Full name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold" />
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target role</span>
          <input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold" />
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Experience level</span>
          <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold">
            <option value="Junior">Junior (0-2 Yrs)</option>
            <option value="Mid">Mid (2-5 Yrs)</option>
            <option value="Senior">Senior (5+ Yrs)</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Key technologies</span>
          <input value={techStack} onChange={(e) => setTechStack(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold" />
        </label>

        <div className="flex gap-2">
          <button onClick={save} className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {saved ? "Profile saved" : "Save profile"}
          </button>
          <button onClick={() => setView("dashboard")} className="px-4 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 text-xs font-black">Done</button>
        </div>
      </section>
    </div>
  );
}
