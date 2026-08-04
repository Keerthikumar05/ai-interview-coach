/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { X, StickyNote } from "lucide-react";

interface RecruiterNotesProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Array<{ roundNumber: number; noteText: string; generatedAt: string }>;
  roundsList: string[];
}

export default function RecruiterNotes({ isOpen, onClose, notes, roundsList }: RecruiterNotesProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative w-full max-w-md h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="flex items-center gap-2 text-sm font-black text-zinc-900 dark:text-zinc-50">
            <StickyNote className="w-4 h-4 text-indigo-500" />
            Internal Recruiter Notes
          </h3>
          <button
            onClick={onClose}
            aria-label="Close recruiter notes"
            className="p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {notes.length === 0 ? (
          <p className="text-xs text-zinc-400 leading-relaxed">
            No notes recorded yet. Notes are generated automatically after each evaluated answer.
          </p>
        ) : (
          <ul className="space-y-3">
            {notes.map((note, i) => (
              <li
                key={i}
                className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-black">
                    {roundsList[note.roundNumber - 1] || `Round ${note.roundNumber}`}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(note.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{note.noteText}</p>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
