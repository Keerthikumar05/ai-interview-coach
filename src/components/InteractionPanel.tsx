/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Play, Loader2, CheckCircle2, ArrowRight, Terminal } from "lucide-react";

interface InteractionPanelProps {
  roundNumber: number;
  roundName: string;
  questionText: string;
  isThinking: boolean;
  onAnswerSubmit: (answer: string) => void;
  onNextQuestion: () => void;
  onCompleteRound: (score: number) => void;
  sessionId: string;
  language: string;
  avatarSpeak: (text: string | string[]) => void;
  onRecordMetric: (metrics: any) => void;
  onAnswerEvaluated: (score: number) => void;
  isListening: boolean;
  isSpeaking: boolean;
  setIsListening: (v: boolean) => void;
  setIsSpeaking: (v: boolean) => void;
}

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

const FILLERS = ["um", "uh", "like", "you know", "basically", "actually", "so yeah"];

function analyseDelivery(text: string, elapsedSeconds: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lower = ` ${text.toLowerCase()} `;
  const fillerCount = FILLERS.reduce(
    (acc, f) => acc + (lower.split(` ${f} `).length - 1),
    0,
  );
  const minutes = Math.max(elapsedSeconds, 1) / 60;
  const wpm = Math.round(words.length / minutes) || 0;
  const confidence = Math.max(
    20,
    Math.min(98, 70 + (words.length > 60 ? 15 : -10) - fillerCount * 4),
  );
  return {
    eyeContact: Math.max(45, Math.min(98, 88 - fillerCount * 3)),
    wpm: Math.min(220, wpm),
    fillerCount,
    confidence,
    emotions: {
      happy: 12,
      neutral: 60,
      nervous: Math.min(60, fillerCount * 6),
      confused: 5,
      confident: confidence,
    },
  };
}

export default function InteractionPanel({
  roundNumber,
  roundName,
  questionText,
  isThinking,
  onAnswerSubmit,
  onNextQuestion,
  onCompleteRound,
  sessionId,
  language,
  avatarSpeak,
  onRecordMetric,
  onAnswerEvaluated,
  isListening,
  isSpeaking,
  setIsListening,
  setIsSpeaking,
}: InteractionPanelProps) {
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  // MCQ round state
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqResult, setMcqResult] = useState<{ score: number; correct: number } | null>(null);

  // Coding round state
  const [code, setCode] = useState(
    "// Write your solution here\nfunction solve(input) {\n  // your code\n  return input;\n}\n\nconsole.log(solve('example'));",
  );
  const [codeLanguage, setCodeLanguage] = useState("javascript");
  const [codeOutput, setCodeOutput] = useState("");
  const [running, setRunning] = useState(false);

  const recognitionRef = useRef<any>(null);
  const startedAtRef = useRef<number>(Date.now());
  const [speechSupported, setSpeechSupported] = useState(true);

  const isMcqRound = roundNumber === 1;
  const isCodingRound = roundNumber === 3;

  // ---------------------------------------------------------------------
  // Load MCQs for the aptitude round
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!isMcqRound || !sessionId) return;
    let cancelled = false;
    setMcqLoading(true);
    fetch(`/api/interview/${sessionId}/mcqs`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setMcqs(Array.isArray(data) ? data : []);
      })
      .catch(() => setMcqs([]))
      .finally(() => !cancelled && setMcqLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isMcqRound, sessionId]);

  // Reset per-question state whenever the question changes
  useEffect(() => {
    setAnswer("");
    setEvaluation(null);
    startedAtRef.current = Date.now();
  }, [questionText]);

  // ---------------------------------------------------------------------
  // Speech recognition (browser Web Speech API, optional)
  // ---------------------------------------------------------------------
  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* already stopped */
    }
    recognitionRef.current = null;
    setIsListening(false);
  }, [setIsListening]);

  const startRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let finalText = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript + " ";
      }
      if (finalText) setAnswer((prev) => (prev + " " + finalText).trim());
    };
    recognition.onerror = () => stopRecognition();
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      startedAtRef.current = Date.now();
    } catch {
      setIsListening(false);
    }
  }, [language, setIsListening, stopRecognition]);

  useEffect(() => () => stopRecognition(), [stopRecognition]);

  // ---------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------
  const submitAnswer = async (text: string, explicitScore?: number) => {
    if (submitting) return;
    setSubmitting(true);
    stopRecognition();

    const elapsed = (Date.now() - startedAtRef.current) / 1000;
    const metrics = analyseDelivery(text, elapsed);
    onRecordMetric(metrics);

    try {
      const res = await fetch(`/api/interview/${sessionId}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roundNumber,
          roundName,
          question: questionText,
          answer: text,
          metrics,
          ...(explicitScore !== undefined ? { score: explicitScore } : {}),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setEvaluation({ feedback: data.error || "Evaluation failed. Please try again.", score: 0 });
        return;
      }

      setEvaluation(data.evaluation);
      onAnswerEvaluated(data.score);
      onAnswerSubmit(text);
      if (data.evaluation?.feedback) avatarSpeak(data.evaluation.feedback);
    } catch (e: any) {
      setEvaluation({ feedback: "Network error: " + e.message, score: 0 });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMcqSubmit = async () => {
    if (mcqs.length === 0) return;
    const correct = mcqs.filter((q) => {
      const given = mcqAnswers[q.id];
      if (!given) return false;
      return given.trim().charAt(0).toUpperCase() === String(q.correctAnswer).trim().charAt(0).toUpperCase();
    }).length;
    const score = Math.round((correct / mcqs.length) * 100);
    setMcqResult({ score, correct });

    const transcript = mcqs
      .map((q, i) => `Q${i + 1}: ${q.question} | Answer: ${mcqAnswers[q.id] || "skipped"}`)
      .join("\n");

    await submitAnswer(transcript, score);
    onAnswerEvaluated(score);
  };

  const runCode = async () => {
    setRunning(true);
    setCodeOutput("");
    try {
      const res = await fetch("/api/interview/code-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language: codeLanguage }),
      });
      const data = await res.json();
      setCodeOutput(data.output || data.error || "No output.");
    } catch (e: any) {
      setCodeOutput("Execution failed: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  const currentScore = mcqResult?.score ?? evaluation?.score ?? 0;

  return (
    <section className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-indigo-500 font-black">
            Round {roundNumber} · {roundName}
          </p>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-1 leading-relaxed">
            {isThinking && !questionText ? "Preparing your question…" : questionText}
          </h2>
        </div>
        {isThinking && <Loader2 className="w-4 h-4 animate-spin text-indigo-500 shrink-0 mt-1" />}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* ROUND 1 — MCQ WORKSPACE                                           */}
      {/* ---------------------------------------------------------------- */}
      {isMcqRound && (
        <div className="space-y-4">
          {mcqLoading && (
            <p className="text-xs text-zinc-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading aptitude questions…
            </p>
          )}

          {mcqs.map((q, index) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
            >
              <p className="text-xs font-black text-zinc-800 dark:text-zinc-100 mb-3">
                {index + 1}. {q.question}
              </p>
              <div className="grid sm:grid-cols-2 gap-2">
                {q.options.map((opt) => {
                  const selected = mcqAnswers[q.id] === opt;
                  return (
                    <button
                      key={opt}
                      disabled={!!mcqResult}
                      onClick={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                      className={`text-left px-3 py-2.5 rounded-xl text-[11px] font-bold border transition-colors ${
                        selected
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:border-indigo-400"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {mcqResult && (
                <p className="mt-3 text-[11px] text-zinc-500 leading-relaxed">
                  <strong className="text-emerald-500">Correct: {q.correctAnswer}</strong> — {q.explanation}
                </p>
              )}
            </div>
          ))}

          {!mcqResult ? (
            <button
              onClick={handleMcqSubmit}
              disabled={submitting || mcqs.length === 0}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Submit Aptitude Answers
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-center space-y-3">
              <p className="text-xs font-black text-indigo-700 dark:text-indigo-300">
                You answered {mcqResult.correct}/{mcqs.length} correctly — {mcqResult.score}%
              </p>
              <button
                onClick={() => onCompleteRound(mcqResult.score)}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2"
              >
                Continue to next round <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ROUND 3 — CODE WORKSPACE                                          */}
      {/* ---------------------------------------------------------------- */}
      {isCodingRound && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <select
              value={codeLanguage}
              onChange={(e) => setCodeLanguage(e.target.value)}
              aria-label="Programming language"
              className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-bold"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button
              onClick={runCode}
              disabled={running}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[11px] font-black flex items-center gap-1.5"
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Run code
            </button>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={12}
            aria-label="Code editor"
            className="w-full p-4 rounded-2xl bg-zinc-950 text-emerald-300 font-mono text-[12px] leading-relaxed border border-zinc-800 resize-y"
          />

          {codeOutput && (
            <pre className="p-4 rounded-2xl bg-zinc-900 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap border border-zinc-800">
              <span className="flex items-center gap-1.5 text-zinc-500 mb-2">
                <Terminal className="w-3 h-3" /> Output
              </span>
              {codeOutput}
            </pre>
          )}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* ROUNDS 2, 3, 4 — SPOKEN / WRITTEN ANSWER                          */}
      {/* ---------------------------------------------------------------- */}
      {!isMcqRound && (
        <div className="space-y-3">
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={
              isCodingRound
                ? "Explain your approach, complexity and trade-offs…"
                : "Speak or type your answer here…"
            }
            rows={5}
            aria-label="Your answer"
            className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs leading-relaxed resize-y"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => (isListening ? stopRecognition() : startRecognition())}
              disabled={isSpeaking || submitting}
              className={`px-4 py-2.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 border transition-colors disabled:opacity-50 ${
                isListening
                  ? "bg-red-500 border-red-500 text-white"
                  : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300"
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              {isListening ? "Stop recording" : "Answer by voice"}
            </button>

            <button
              onClick={() =>
                submitAnswer(isCodingRound ? `${answer}\n\n--- CODE ---\n${code}` : answer)
              }
              disabled={submitting || (!answer.trim() && !isCodingRound)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-black flex items-center gap-1.5"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              Submit answer
            </button>

            {!speechSupported && (
              <span className="text-[10px] text-amber-500 font-bold">
                Voice input is unavailable in this browser — please type your answer.
              </span>
            )}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* EVALUATION FEEDBACK                                               */}
      {/* ---------------------------------------------------------------- */}
      {evaluation && !isMcqRound && (
        <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-zinc-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Evaluation
            </h4>
            <span className="text-xl font-black font-mono text-indigo-500">{evaluation.score}%</span>
          </div>

          <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">{evaluation.feedback}</p>

          {evaluation.strengths?.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-black mb-1">
                Strengths
              </p>
              <ul className="list-disc list-inside text-[11px] text-zinc-500 space-y-0.5">
                {evaluation.strengths.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {evaluation.weaknesses?.length > 0 && (
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-amber-500 font-black mb-1">
                Improve next
              </p>
              <ul className="list-disc list-inside text-[11px] text-zinc-500 space-y-0.5">
                {evaluation.weaknesses.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={onNextQuestion}
              className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-[11px] font-black flex items-center gap-1.5"
            >
              Next question <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onCompleteRound(currentScore)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black flex items-center gap-1.5"
            >
              Complete this round <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
