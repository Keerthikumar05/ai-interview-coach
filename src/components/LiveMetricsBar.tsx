/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Eye, Gauge, MessageSquareWarning, Activity } from "lucide-react";

interface LiveMetricsBarProps {
  metrics: {
    eyeContact: number;
    wpm: number;
    fillerCount: number;
    confidence: number;
    emotions: Record<string, number>;
  };
}

function Meter({
  icon,
  label,
  value,
  suffix,
  percent,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix?: string;
  percent: number;
  tone: string;
}) {
  return (
    <div className="flex-1 min-w-[150px]">
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
          {icon}
          {label}
        </span>
        <span className="text-xs font-black font-mono text-zinc-700 dark:text-zinc-200">
          {value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${tone}`}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
    </div>
  );
}

export default function LiveMetricsBar({ metrics }: LiveMetricsBarProps) {
  const emotions = metrics?.emotions || {};
  const dominant =
    Object.entries(emotions).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || "neutral";

  return (
    <section
      aria-label="Live behavioural diagnostics"
      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-500">
          <Activity className="w-3.5 h-3.5 text-indigo-500" />
          Live Behavioural Diagnostics
        </h4>
        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border border-zinc-200 dark:border-zinc-800">
          Dominant: {dominant}
        </span>
      </div>

      <div className="flex flex-wrap gap-5">
        <Meter
          icon={<Eye className="w-3 h-3" />}
          label="Eye contact"
          value={metrics?.eyeContact ?? 0}
          suffix="%"
          percent={metrics?.eyeContact ?? 0}
          tone="bg-sky-500"
        />
        <Meter
          icon={<Gauge className="w-3 h-3" />}
          label="Speaking pace"
          value={metrics?.wpm ?? 0}
          suffix=" wpm"
          percent={((metrics?.wpm ?? 0) / 200) * 100}
          tone="bg-indigo-500"
        />
        <Meter
          icon={<MessageSquareWarning className="w-3 h-3" />}
          label="Filler words"
          value={metrics?.fillerCount ?? 0}
          percent={100 - Math.min(100, (metrics?.fillerCount ?? 0) * 10)}
          tone="bg-amber-500"
        />
        <Meter
          icon={<Activity className="w-3 h-3" />}
          label="Confidence"
          value={metrics?.confidence ?? 0}
          suffix="%"
          percent={metrics?.confidence ?? 0}
          tone="bg-emerald-500"
        />
      </div>
    </section>
  );
}
