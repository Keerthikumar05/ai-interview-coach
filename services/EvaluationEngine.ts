/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EvaluationEngine
 * ----------------
 * Rubric-based scoring for interview / practice answers.
 *
 *  1. Gemini mode    - used when GEMINI_API_KEY is present (structured JSON).
 *  2. Offline mode   - deterministic rubric scoring, fully usable with no key.
 *
 * Scoring is QUALITY based, never length based. Gibberish and irrelevant
 * answers are capped near zero regardless of how many words they contain.
 */

import { GoogleGenAI, Type } from "@google/genai";
import {
  analyseQuality,
  conceptCoverage,
  questionOverlap,
  hasExample,
  detectStar,
  type AnswerVerdict,
} from "./textQuality";

export interface EvaluationInput {
  question: string;
  answer: string;
  roundNumber?: number;
  roundName?: string;
  company?: string;
  targetRole?: string;
  difficulty?: string;
  resumeData?: string;
  jobDescription?: string;
  /** Rubric metadata (practice question bank / interview question). */
  expectedConcepts?: string[];
  idealAnswer?: string;
  interviewTip?: string;
  category?: string;
  /** "text" | "hr" | "behavioral" | "coding" | "mcq" */
  questionType?: string;
}

export interface EvaluationBreakdown {
  relevance: number;
  correctness: number;
  completeness: number;
  clarity: number;
  example: number;
  communication: number;
}

export interface EvaluationResult {
  score: number;
  verdict: AnswerVerdict;
  breakdown: EvaluationBreakdown;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  feedback: string;
  betterAnswer: string;
  followUp: string;
  recruiterNotes: string;
  confidence: number;
  fillerWordsDetected: string[];
  grammarCorrections: string;
  nextDifficulty: "easier" | "same" | "harder";
  personalizedPractice: string[];
  star?: { situation: boolean; task: boolean; action: boolean; result: boolean };
  interviewTip?: string;
  evaluatedBy: "gemini" | "offline";
  analysisOnly?: boolean;
}

let cachedClient: GoogleGenAI | null | undefined;

function getClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key || process.env.AI_PROVIDER === "mock") {
    cachedClient = null;
    return cachedClient;
  }
  try {
    cachedClient = new GoogleGenAI({ apiKey: key });
  } catch {
    cachedClient = null;
  }
  return cachedClient;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(Number.isFinite(n) ? n : 0)));
}

// Weights per question family (must sum to 100).
const WEIGHTS: Record<string, EvaluationBreakdown> = {
  technical: { relevance: 25, correctness: 30, completeness: 20, clarity: 10, example: 10, communication: 5 },
  hr: { relevance: 25, correctness: 15, completeness: 20, clarity: 15, example: 15, communication: 10 },
  behavioral: { relevance: 20, correctness: 15, completeness: 20, clarity: 15, example: 20, communication: 10 },
  coding: { relevance: 20, correctness: 35, completeness: 20, clarity: 10, example: 10, communication: 5 },
};

function weightsFor(input: EvaluationInput): { key: string; w: EvaluationBreakdown } {
  const t = (input.questionType || "").toLowerCase();
  if (t === "hr") return { key: "hr", w: WEIGHTS.hr };
  if (t === "behavioral") return { key: "behavioral", w: WEIGHTS.behavioral };
  if (t === "coding") return { key: "coding", w: WEIGHTS.coding };
  const name = (input.roundName || "").toLowerCase();
  if (name.includes("hr")) return { key: "hr", w: WEIGHTS.hr };
  if (name.includes("behav") || name.includes("communication")) return { key: "behavioral", w: WEIGHTS.behavioral };
  if (name.includes("coding")) return { key: "coding", w: WEIGHTS.coding };
  return { key: "technical", w: WEIGHTS.technical };
}

/**
 * Deterministic rubric scoring. Never throws.
 */
function offlineEvaluate(input: EvaluationInput): EvaluationResult {
  const answer = (input.answer || "").trim();
  const q = analyseQuality(answer);
  const { key: family, w } = weightsFor(input);
  const concepts = input.expectedConcepts || [];
  const coverage = conceptCoverage(answer, concepts);
  const overlap = questionOverlap(input.question || "", answer);
  const star = detectStar(answer);
  const example = hasExample(answer);

  const base: EvaluationResult = {
    score: 0,
    verdict: "VALID",
    breakdown: { relevance: 0, correctness: 0, completeness: 0, clarity: 0, example: 0, communication: 0 },
    strengths: [],
    weaknesses: [],
    missingConcepts: coverage.missing,
    feedback: "",
    betterAnswer: input.idealAnswer || "",
    followUp: "",
    recruiterNotes: "",
    confidence: 0,
    fillerWordsDetected: q.fillerWords,
    grammarCorrections: "",
    nextDifficulty: "same",
    personalizedPractice: [],
    star: family === "behavioral" || family === "hr" ? star : undefined,
    interviewTip: input.interviewTip,
    evaluatedBy: "offline",
    analysisOnly: family === "coding" ? true : undefined,
  };

  // ---------------------------------------------------------------- gates
  if (q.wordCount === 0) {
    return {
      ...base,
      verdict: "EMPTY",
      score: 0,
      weaknesses: ["No answer was provided."],
      feedback: "No response was recorded. Even a partial attempt scores better than silence in a real interview.",
      followUp: "Would you like to try this question again?",
      recruiterNotes: "Candidate did not respond to the question.",
      grammarCorrections: "No text available to review.",
      nextDifficulty: "easier",
      personalizedPractice: ["Practise a 15-second opener that restates the question while you think."],
    };
  }

  if (q.wordCount < 4 && coverage.matched.length === 0) {
    return {
      ...base,
      verdict: "TOO_SHORT",
      score: clamp(q.wordCount * 1.5, 0, 8),
      weaknesses: ["The answer is too short to demonstrate any understanding."],
      feedback: "This answer is too short to evaluate. Explain the concept in at least two or three complete sentences.",
      followUp: "Can you expand on that with a definition and an example?",
      recruiterNotes: "Answer far too short to assess competence.",
      grammarCorrections: "Write complete sentences.",
      nextDifficulty: "easier",
      personalizedPractice: ["Answer in the shape: definition → how it works → short example."],
    };
  }

  const gibberish = q.isKeyboardSmash || q.englishRatio < 0.6 || !q.hasSentenceStructure;
  if (gibberish) {
    const topic = (input.question || "this topic").replace(/\?+$/, "");
    return {
      ...base,
      verdict: "GIBBERISH",
      score: clamp(q.englishRatio * 6, 0, 5),
      weaknesses: [
        "The response does not contain recognisable, meaningful language.",
        q.gibberishWords.length ? `Unrecognised text detected: ${q.gibberishWords.slice(0, 5).join(", ")}.` : "No coherent sentence structure detected.",
      ],
      feedback: `Your answer does not meaningfully address ${topic.toLowerCase().startsWith("what") || topic.toLowerCase().startsWith("explain") ? "the question" : topic}. Explain the concept in your own words and provide an example.`,
      followUp: "Let's restart: in one sentence, what does this question ask you to explain?",
      recruiterNotes: "Response was unintelligible / non-answer. No signal on ability.",
      confidence: 0,
      grammarCorrections: "The text is not readable English. Write complete sentences using real words.",
      nextDifficulty: "easier",
      personalizedPractice: [
        "Read the ideal answer below, then rewrite it in your own words from memory.",
        "Practise stating a one-sentence definition before adding detail.",
      ],
    };
  }

  // ------------------------------------------------------- rubric components
  // Relevance: question-term overlap + concept hits. Length plays no part.
  const conceptSignal = concepts.length ? coverage.ratio : Math.min(1, overlap * 1.4);
  const relevanceRaw = Math.min(1, overlap * 1.1 * 0.5 + conceptSignal * 0.7);

  // Correctness: offline proxy = coverage of expected concepts (+ overlap when
  // no rubric exists). Never awarded for verbosity.
  const correctnessRaw = concepts.length
    ? Math.min(1, coverage.ratio * 1.15)
    : Math.min(1, overlap * 1.2);

  // Completeness: concepts covered, with word count as a *small* supporting
  // signal only (max 25% of this component) and capped by relevance.
  const depthSignal = Math.min(1, q.wordCount / (family === "coding" ? 90 : 70));
  const completenessRaw = Math.min(1, conceptSignal * 0.75 + depthSignal * 0.25) * Math.min(1, relevanceRaw + 0.15);

  // Clarity: sentence structure quality.
  const avgSentence = q.wordCount / Math.max(1, q.sentenceCount);
  let clarityRaw = 1;
  if (q.sentenceCount < 2) clarityRaw -= 0.25;
  if (avgSentence > 40) clarityRaw -= 0.3;
  if (avgSentence < 5) clarityRaw -= 0.25;
  if (q.uniqueRatio < 0.55) clarityRaw -= 0.25;
  clarityRaw = Math.max(0, clarityRaw);

  // Example / evidence (STAR for behavioural families).
  const starHits = Object.values(star).filter(Boolean).length;
  const exampleRaw =
    family === "behavioral" || family === "hr" ? starHits / 4 : example ? 1 : 0.15;

  // Communication: real language + low filler noise.
  const communicationRaw = Math.max(0, Math.min(1, q.englishRatio - q.fillerWords.length * 0.06));

  const breakdown: EvaluationBreakdown = {
    relevance: clamp(relevanceRaw * 100),
    correctness: clamp(correctnessRaw * 100),
    completeness: clamp(completenessRaw * 100),
    clarity: clamp(clarityRaw * 100),
    example: clamp(exampleRaw * 100),
    communication: clamp(communicationRaw * 100),
  };

  let score =
    (breakdown.relevance * w.relevance +
      breakdown.correctness * w.correctness +
      breakdown.completeness * w.completeness +
      breakdown.clarity * w.clarity +
      breakdown.example * w.example +
      breakdown.communication * w.communication) /
    100;

  // ---------------------------------------------------------------- verdict
  let verdict: AnswerVerdict = "VALID";
  const relevanceSignal = Math.max(coverage.ratio, overlap);
  if (relevanceSignal < 0.12) {
    verdict = "IRRELEVANT";
    score = Math.min(score, 10);
  } else if (relevanceSignal < 0.3 || breakdown.relevance < 40) {
    verdict = "PARTIALLY_RELEVANT";
    score = Math.min(score, 55);
  }

  score = clamp(score);

  // ---------------------------------------------------------------- feedback
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (breakdown.relevance >= 60) strengths.push("The answer directly addresses what was asked.");
  else weaknesses.push("The answer does not clearly address the question that was asked.");

  if (coverage.matched.length) strengths.push(`Correctly covered: ${coverage.matched.slice(0, 4).join(", ")}.`);
  if (coverage.missing.length) weaknesses.push(`Missing key points: ${coverage.missing.slice(0, 4).join(", ")}.`);

  if (breakdown.clarity >= 70) strengths.push("Clear, well-structured explanation.");
  else weaknesses.push("Structure was hard to follow — use short, complete sentences.");

  if (family === "behavioral" || family === "hr") {
    const missingStar = Object.entries(star).filter(([, v]) => !v).map(([k]) => k);
    if (missingStar.length === 0) strengths.push("Full STAR structure present (Situation, Task, Action, Result).");
    else weaknesses.push(`STAR components missing: ${missingStar.join(", ")}.`);
  } else if (!example) {
    weaknesses.push("No concrete example was given to support the explanation.");
  } else {
    strengths.push("Supported the explanation with a concrete example.");
  }

  if (q.fillerWords.length > 2) weaknesses.push(`Filler expressions detected: ${q.fillerWords.slice(0, 5).join(", ")}.`);

  const feedback =
    verdict === "IRRELEVANT"
      ? `Your answer is readable but does not address the question. Focus specifically on: ${(concepts.slice(0, 3).join(", ") || input.question)}.`
      : `Scored ${score}/100 — relevance ${breakdown.relevance}, correctness ${breakdown.correctness}, completeness ${breakdown.completeness}, clarity ${breakdown.clarity}. ` +
        (score >= 75
          ? "Strong, hire-worthy answer; keep this level of specificity."
          : score >= 55
            ? "Solid foundation, but add the missing key points and a concrete example to stand out."
            : "Below the interview bar. Address the core concepts directly and structure the explanation.");

  const personalizedPractice: string[] = [];
  if (coverage.missing.length) personalizedPractice.push(`Rewrite this answer explicitly covering: ${coverage.missing.slice(0, 3).join(", ")}.`);
  if (!example && family !== "hr") personalizedPractice.push("Add one concrete example or code snippet to every technical answer.");
  if (family === "behavioral" && starHits < 4) personalizedPractice.push("Re-tell this story as four labelled sentences: Situation, Task, Action, Result.");
  if (personalizedPractice.length === 0) personalizedPractice.push("Practise harder variants of this question to maintain the standard.");

  return {
    ...base,
    score,
    verdict,
    breakdown,
    strengths,
    weaknesses,
    missingConcepts: coverage.missing,
    feedback,
    followUp:
      family === "technical" || family === "coding"
        ? "Can you walk me through the time and space complexity, and the trade-offs at scale?"
        : "Can you give a specific example with a measurable outcome?",
    recruiterNotes: `${input.roundName || input.category || "Practice"}: scored ${score}%. ${weaknesses[0] || "No significant concerns."}`,
    confidence: clamp(score * 0.6 + breakdown.communication * 0.4),
    grammarCorrections:
      q.fillerWords.length > 0
        ? `Remove conversational fillers (${q.fillerWords.slice(0, 4).join(", ")}) and prefer complete declarative sentences.`
        : "Grammar and phrasing read cleanly for a professional interview context.",
    nextDifficulty: score >= 78 ? "harder" : score < 50 ? "easier" : "same",
    personalizedPractice,
  };
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    relevance: { type: Type.NUMBER },
    correctness: { type: Type.NUMBER },
    completeness: { type: Type.NUMBER },
    clarity: { type: Type.NUMBER },
    communication: { type: Type.NUMBER },
    overallScore: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    missingConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
    feedback: { type: Type.STRING },
    betterAnswer: { type: Type.STRING },
  },
  required: ["relevance", "correctness", "completeness", "clarity", "communication", "overallScore", "feedback"],
};

async function geminiEvaluate(client: GoogleGenAI, input: EvaluationInput): Promise<EvaluationResult> {
  const offline = offlineEvaluate(input);

  const prompt = `You are a strict senior interviewer at ${input.company || "a top tech company"}.
Grade the candidate's answer on QUALITY, never on length. Long irrelevant or nonsense answers must score 0-10.

Interview type: ${input.questionType || input.roundName || "technical"}
Target role: ${input.targetRole || "Software Engineer"}
Difficulty: ${input.difficulty || "medium"}
Expected concepts (rubric): ${(input.expectedConcepts || []).join("; ") || "not provided"}
Reference ideal answer: ${input.idealAnswer || "not provided"}

QUESTION: ${input.question}
CANDIDATE ANSWER: ${input.answer}

Return JSON with relevance, correctness, completeness, clarity, communication, overallScore (all 0-100),
strengths[], weaknesses[], missingConcepts[], feedback, betterAnswer.`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: { temperature: 0.2, responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA as any },
  });

  const parsed = JSON.parse(response.text || "{}");
  if (typeof parsed.overallScore !== "number") return offline;

  // Server-side sanity guard: never let the model reward gibberish.
  let score = clamp(parsed.overallScore);
  if (offline.verdict === "GIBBERISH" || offline.verdict === "EMPTY") score = Math.min(score, 5);
  if (offline.verdict === "TOO_SHORT") score = Math.min(score, 25);

  return {
    ...offline,
    evaluatedBy: "gemini",
    score,
    breakdown: {
      relevance: clamp(parsed.relevance ?? offline.breakdown.relevance),
      correctness: clamp(parsed.correctness ?? offline.breakdown.correctness),
      completeness: clamp(parsed.completeness ?? offline.breakdown.completeness),
      clarity: clamp(parsed.clarity ?? offline.breakdown.clarity),
      example: offline.breakdown.example,
      communication: clamp(parsed.communication ?? offline.breakdown.communication),
    },
    strengths: parsed.strengths?.length ? parsed.strengths : offline.strengths,
    weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : offline.weaknesses,
    missingConcepts: parsed.missingConcepts?.length ? parsed.missingConcepts : offline.missingConcepts,
    feedback: parsed.feedback || offline.feedback,
    betterAnswer: parsed.betterAnswer || offline.betterAnswer,
    confidence: clamp(score * 0.6 + (parsed.communication ?? offline.breakdown.communication) * 0.4),
    nextDifficulty: score >= 78 ? "harder" : score < 50 ? "easier" : "same",
  };
}

export const EvaluationEngine = {
  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const client = getClient();
    if (!client) return offlineEvaluate(input);
    try {
      return await geminiEvaluate(client, input);
    } catch (error: any) {
      const message = String(error?.message || error);
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
        cachedClient = null;
      }
      console.log("[EvaluationEngine] Falling back to offline rubric evaluator.");
      return offlineEvaluate(input);
    }
  },

  /** Exposed for testing / offline use. */
  offlineEvaluate,
  heuristicEvaluate: offlineEvaluate,
};

export default EvaluationEngine;
