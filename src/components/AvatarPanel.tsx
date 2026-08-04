/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from "react";
import { Volume2, Loader2, Ear, Sparkles } from "lucide-react";

interface AvatarPanelProps {
  roundNumber: number;
  interviewerName: string;
  isSpeaking: boolean;
  isThinking: boolean;
  isListening: boolean;
  textToSpeak: string;
  onSpeechEnd: () => void;
  lastAnswerScore: number | null;
}

const INTERVIEWER_META: Record<string, { role: string; accent: string; emoji: string }> = {
  Meera: { role: "Aptitude Panelist", accent: "from-sky-500 to-indigo-500", emoji: "🧮" },
  Priya: { role: "Communication Lead", accent: "from-fuchsia-500 to-indigo-500", emoji: "🗣️" },
  Aanya: { role: "Senior Engineer", accent: "from-emerald-500 to-teal-500", emoji: "💻" },
  Neha: { role: "HR Business Partner", accent: "from-amber-500 to-orange-500", emoji: "🤝" },
};

export default function AvatarPanel({
  roundNumber,
  interviewerName,
  isSpeaking,
  isThinking,
  isListening,
  textToSpeak,
  onSpeechEnd,
  lastAnswerScore,
}: AvatarPanelProps) {
  const lastSpokenRef = useRef<string>("");
  const meta = INTERVIEWER_META[interviewerName] || INTERVIEWER_META.Meera;

  // Speak whatever the parent puts in `textToSpeak` exactly once.
  useEffect(() => {
    if (!textToSpeak || textToSpeak === lastSpokenRef.current) return;
    lastSpokenRef.current = textToSpeak;

    if (typeof window === "undefined" || !window.speechSynthesis) {
      // No TTS support: keep the interview state machine moving.
      const t = setTimeout(onSpeechEnd, 900);
      return () => clearTimeout(t);
    }

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onSpeechEnd();
    };

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.98;
      utterance.pitch = 1.05;
      utterance.lang = "en-IN";

      const voices = window.speechSynthesis.getVoices();
      const preferred =
        voices.find((v) => /female/i.test(v.name)) ||
        voices.find((v) => v.lang === "en-IN") ||
        voices.find((v) => v.lang.startsWith("en"));
      if (preferred) utterance.voice = preferred;

      utterance.onend = finish;
      utterance.onerror = finish;
      window.speechSynthesis.speak(utterance);

      // Safety net: some browsers silently drop long utterances.
      const fallback = setTimeout(finish, Math.min(30000, 2500 + textToSpeak.length * 65));
      return () => clearTimeout(fallback);
    } catch {
      finish();
      return;
    }
  }, [textToSpeak, onSpeechEnd]);

  const status = isThinking
    ? { label: "Thinking", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, tone: "text-amber-500" }
    : isSpeaking
      ? { label: "Speaking", icon: <Volume2 className="w-3.5 h-3.5 animate-pulse" />, tone: "text-indigo-500" }
      : isListening
        ? { label: "Listening", icon: <Ear className="w-3.5 h-3.5 animate-pulse" />, tone: "text-emerald-500" }
        : { label: "Standing by", icon: <Sparkles className="w-3.5 h-3.5" />, tone: "text-zinc-400" };

  return (
    <aside className="w-full md:w-80 shrink-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col items-center gap-4">
      <div className="relative">
        <div
          className={`w-32 h-32 rounded-full bg-gradient-to-br ${meta.accent} flex items-center justify-center text-5xl shadow-xl transition-transform duration-300 ${
            isSpeaking ? "scale-105" : "scale-100"
          }`}
        >
          {meta.emoji}
        </div>
        {(isSpeaking || isListening) && (
          <span
            className={`absolute inset-0 rounded-full border-4 animate-ping ${
              isSpeaking ? "border-indigo-400/60" : "border-emerald-400/60"
            }`}
          />
        )}
      </div>

      <div className="text-center">
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{interviewerName}</h3>
        <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">{meta.role}</p>
        <p className="text-[11px] font-bold text-indigo-500 mt-0.5">Round {roundNumber}</p>
      </div>

      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-black ${status.tone}`}
      >
        {status.icon}
        {status.label}
      </div>

      {textToSpeak && (
        <p className="text-[11px] leading-relaxed text-center text-zinc-500 dark:text-zinc-400">
          “{textToSpeak}”
        </p>
      )}

      {lastAnswerScore !== null && (
        <div className="w-full mt-auto pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Last answer</p>
          <p
            className={`text-3xl font-black font-mono ${
              lastAnswerScore >= 75
                ? "text-emerald-500"
                : lastAnswerScore >= 55
                  ? "text-amber-500"
                  : "text-red-500"
            }`}
          >
            {lastAnswerScore}%
          </p>
        </div>
      )}
    </aside>
  );
}
