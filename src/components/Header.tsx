/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Moon, Sun, LogOut, Clock, Building2, ShieldCheck } from "lucide-react";

interface HeaderProps {
  user: any;
  currentRound?: string;
  timeLeft?: number;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onLogout: () => void;
  setView: (view: string) => void;
  companyName?: string;
}

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function Header({
  user,
  currentRound,
  timeLeft,
  theme,
  onToggleTheme,
  language,
  onLanguageChange,
  onLogout,
  setView,
  companyName,
}: HeaderProps) {
  const isLowTime = typeof timeLeft === "number" && timeLeft <= 60;

  return (
    <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => {
            setView("dashboard");
            window.history.pushState({}, "", "/");
          }}
          className="flex items-center gap-2.5 group"
        >
          <span className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-sm shadow-md group-hover:scale-105 transition-transform">
            IQ
          </span>
          <span className="text-left hidden sm:block">
            <span className="block text-sm font-black tracking-tight text-zinc-900 dark:text-zinc-50">
              InterviewIQ
            </span>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-zinc-400">
              AI Mock Interview Suite
            </span>
          </span>
        </button>

        <div className="flex items-center gap-2.5">
          {companyName && (
            <span className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-500">
              <Building2 className="w-3.5 h-3.5" />
              {companyName}
            </span>
          )}

          {currentRound && (
            <span className="hidden md:inline-flex px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 text-[11px] font-black border border-indigo-100 dark:border-indigo-900">
              {currentRound}
            </span>
          )}

          {typeof timeLeft === "number" && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black font-mono border ${
                isLowTime
                  ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-900 animate-pulse"
                  : "bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timeLeft)}
            </span>
          )}

          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            aria-label="Interview language"
            className="px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold text-zinc-600 dark:text-zinc-300"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {user?.role === "ADMIN" && (
            <button
              onClick={() => setView("admin")}
              className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 transition-colors"
              aria-label="Admin console"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 pl-2.5 border-l border-zinc-200 dark:border-zinc-800">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white flex items-center justify-center text-xs font-black">
              {(user?.name || "C").charAt(0).toUpperCase()}
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-black text-zinc-800 dark:text-zinc-100 max-w-[120px] truncate">
                {user?.name || "Candidate"}
              </span>
              <span className="block text-[10px] text-zinc-400 max-w-[120px] truncate">
                {user?.targetRole || "Software Engineer"}
              </span>
            </span>
          </div>

          <button
            onClick={onLogout}
            aria-label="Log out"
            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
