/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EvaluationEngine
 * ----------------
 * Scores a single candidate answer for a given interview round.
 *
 * Two modes:
 *  1. Gemini mode  - used when GEMINI_API_KEY is present. Structured JSON output.
 *  2. Heuristic mode - deterministic local scoring so the whole application is
 *     fully demo-able offline with zero API keys.
 */

import { GoogleGenAI, Type } from "@google/genai";

export interface EvaluationInput {
  question: string;
  answer: string;
  roundNumber: number;
  roundName: string;
  company?: string;
  targetRole?: string;
  difficulty?: string;
  resumeData?: string;
  jobDescription?: string;
}

export interface EvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
  followUp: string;
  recruiterNotes: string;
  confidence: number;
  fillerWordsDetected: string[];
  grammarCorrections: string;
  nextDifficulty: "easier" | "same" | "harder";
  personalizedPractice: string[];
}

const FILLER_WORDS = [
  "um", "uh", "erm", "like", "you know", "basically", "actually",
  "literally", "sort of", "kind of", "i mean", "so yeah", "right",
];

const TECHNICAL_KEYWORDS = [
  "complexity", "algorithm", "array", "hash", "map", "loop", "recursion",
  "database", "index", "query", "api", "component", "state", "async",
  "promise", "cache", "scale", "test", "optimi", "memory", "thread",
  "class", "object", "interface", "type", "function", "closure", "http",
];

const STAR_KEYWORDS = [
  "situation", "task", "action", "result", "team", "deadline", "impact",
  "learned", "responsib", "outcome", "challenge", "collaborat", "stakeholder",
];

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
  return Math.max(min, Math.min(max, Math.round(n)));
}

function detectFillers(answer: string): string[] {
  const lower = ` ${answer.toLowerCase()} `;
  return FILLER_WORDS.filter((w) => lower.includes(` ${w} `) || lower.includes(`${w},`));
}

function countMatches(answer: string, keywords: string[]): number {
  const lower = answer.toLowerCase();
  return keywords.filter((k) => lower.includes(k)).length;
}

/**
 * Deterministic, explainable local scoring. Never throws.
 */
function heuristicEvaluate(input: EvaluationInput): EvaluationResult {
  const answer = (input.answer || "").trim();
  const words = answer.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = answer.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const fillers = detectFillers(answer);

  if (wordCount === 0) {
    return {
      score: 0,
      strengths: [],
      weaknesses: ["No answer was provided for this question."],
      feedback:
        "No response was recorded. Attempting an answer — even a partial one — always scores better than silence in a real interview.",
      followUp: "Would you like to try answering this question again?",
      recruiterNotes: `Round ${input.roundNumber}: candidate did not respond to the question.`,
      confidence: 0,
      fillerWordsDetected: [],
      grammarCorrections: "No text available to review.",
      nextDifficulty: "easier",
      personalizedPractice: [
        "Practise the 30-second 'buy time' opener: restate the question in your own words.",
        "Rehearse two STAR stories you can adapt to almost any behavioural prompt.",
      ],
    };
  }

  // --- Length / depth component (0-35) -----------------------------------
  const idealMin = input.roundNumber === 3 ? 40 : 55;
  const idealMax = input.roundNumber === 3 ? 260 : 220;
  let lengthScore: number;
  if (wordCount < idealMin) {
    lengthScore = (wordCount / idealMin) * 28;
  } else if (wordCount <= idealMax) {
    lengthScore = 35;
  } else {
    lengthScore = Math.max(22, 35 - (wordCount - idealMax) / 25);
  }

  // --- Relevance to the question (0-25) ----------------------------------
  const questionTerms = (input.question || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 4);
  const uniqueTerms = Array.from(new Set(questionTerms));
  const overlap = uniqueTerms.filter((t) => answer.toLowerCase().includes(t)).length;
  const relevanceScore = uniqueTerms.length
    ? Math.min(25, (overlap / uniqueTerms.length) * 40)
    : 15;

  // --- Substance keywords (0-25) -----------------------------------------
  const isTechnicalRound = input.roundNumber === 3;
  const substanceHits = isTechnicalRound
    ? countMatches(answer, TECHNICAL_KEYWORDS)
    : countMatches(answer, STAR_KEYWORDS);
  const substanceScore = Math.min(25, substanceHits * 4.5);

  // --- Structure & clarity (0-15) ----------------------------------------
  const avgSentenceLength = wordCount / Math.max(1, sentences.length);
  let structureScore = 15;
  if (sentences.length < 2) structureScore -= 6;
  if (avgSentenceLength > 40) structureScore -= 5;
  if (avgSentenceLength < 5) structureScore -= 4;
  structureScore = Math.max(0, structureScore);

  // --- Penalties ----------------------------------------------------------
  const fillerPenalty = Math.min(12, fillers.length * 2.5);

  const raw = lengthScore + relevanceScore + substanceScore + structureScore - fillerPenalty;
  const score = clamp(raw);

  const confidence = clamp(
    60 + (wordCount > idealMin ? 15 : -10) + (fillers.length === 0 ? 15 : -fillers.length * 3),
    10,
    98,
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (lengthScore >= 30) strengths.push("Answer length is well suited to an interview setting.");
  else weaknesses.push("The answer was too brief — interviewers expect concrete detail and examples.");

  if (relevanceScore >= 15) strengths.push("Response stayed on topic and addressed the question directly.");
  else weaknesses.push("The response drifted away from what was actually asked.");

  if (substanceScore >= 14) {
    strengths.push(
      isTechnicalRound
        ? "Good use of precise technical vocabulary and engineering reasoning."
        : "Behavioural detail present — situation, action and outcome are recognisable.",
    );
  } else {
    weaknesses.push(
      isTechnicalRound
        ? "Missing technical depth: no mention of complexity, trade-offs or data structures."
        : "Missing STAR structure: state the Situation, Task, Action and measurable Result.",
    );
  }

  if (fillers.length === 0) strengths.push("Clean delivery with no detected filler words.");
  else weaknesses.push(`Detected ${fillers.length} filler expression(s): ${fillers.slice(0, 5).join(", ")}.`);

  if (structureScore < 10) weaknesses.push("Sentence structure was hard to follow — break ideas into shorter statements.");

  const feedback =
    `Round ${input.roundNumber} (${input.roundName}) scored ${score}/100. ` +
    `You used ${wordCount} words across ${sentences.length} sentence(s). ` +
    (score >= 75
      ? "This is a strong, hire-worthy answer — keep this level of specificity."
      : score >= 60
        ? "A solid answer that would pass most screens, but it needs sharper specifics to stand out."
        : "This answer would likely fall below the bar. Add concrete examples, numbers and clear structure.");

  const followUp = isTechnicalRound
    ? "Can you walk me through the time and space complexity of your approach, and what you would change at 10x scale?"
    : "Can you give me a specific example with a measurable outcome?";

  const personalizedPractice: string[] = [];
  if (score < 60) personalizedPractice.push("Rewrite this same answer in exactly 4 sentences: context, action, result, learning.");
  if (fillers.length > 2) personalizedPractice.push("Record a 60-second answer and count filler words; target under two.");
  if (isTechnicalRound && substanceHits < 3)
    personalizedPractice.push("Review Big-O analysis and rehearse stating complexity out loud after every solution.");
  if (!isTechnicalRound && substanceHits < 3)
    personalizedPractice.push("Build three STAR stories (conflict, failure, achievement) you can reuse.");
  if (personalizedPractice.length === 0)
    personalizedPractice.push("Keep drilling harder variants of this question to maintain the standard.");

  return {
    score,
    strengths,
    weaknesses,
    feedback,
    followUp,
    recruiterNotes:
      `Round ${input.roundNumber} — ${input.roundName}: scored ${score}%. ` +
      (weaknesses[0] || "No significant concerns raised."),
    confidence,
    fillerWordsDetected: fillers,
    grammarCorrections:
      fillers.length > 0
        ? `Remove conversational fillers (${fillers.slice(0, 4).join(", ")}) and prefer complete, declarative sentences.`
        : "Grammar and phrasing read cleanly for a professional interview context.",
    nextDifficulty: score >= 78 ? "harder" : score < 50 ? "easier" : "same",
    personalizedPractice,
  };
}

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.NUMBER },
    strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
    weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
    feedback: { type: Type.STRING },
    followUp: { type: Type.STRING },
    recruiterNotes: { type: Type.STRING },
    confidence: { type: Type.NUMBER },
    fillerWordsDetected: { type: Type.ARRAY, items: { type: Type.STRING } },
    grammarCorrections: { type: Type.STRING },
    nextDifficulty: { type: Type.STRING },
    personalizedPractice: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: [
    "score",
    "strengths",
    "weaknesses",
    "feedback",
    "followUp",
    "recruiterNotes",
    "confidence",
    "nextDifficulty",
    "personalizedPractice",
  ],
};

async function geminiEvaluate(
  client: GoogleGenAI,
  input: EvaluationInput,
): Promise<EvaluationResult> {
  const prompt = `You are a senior technical interviewer at ${input.company || "a top tech company"}.
Evaluate the candidate's answer honestly and strictly. Never give inflated praise.

Round ${input.roundNumber}: ${input.roundName}
Target role: ${input.targetRole || "Software Engineer"}
Difficulty: ${input.difficulty || "medium"}
Candidate resume context: ${input.resumeData || "Not provided"}
Job description context: ${input.jobDescription || "Not provided"}

QUESTION: ${input.question}
CANDIDATE ANSWER: ${input.answer}

Return JSON with:
- score: integer 0-100 reflecting real hiring-bar quality
- strengths / weaknesses: concrete, specific bullet points about THIS answer
- feedback: 2-4 sentences of actionable coaching
- followUp: the single best follow-up question to ask next
- recruiterNotes: one blunt internal recruiter note
- confidence: 0-100 estimated delivery confidence
- fillerWordsDetected: filler words present in the answer
- grammarCorrections: concise grammar/phrasing guidance
- nextDifficulty: "easier" | "same" | "harder"
- personalizedPractice: 2-4 targeted practice tasks`;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA as any,
    },
  });

  const parsed = JSON.parse(response.text || "{}");
  const fallback = heuristicEvaluate(input);

  return {
    score: clamp(Number(parsed.score ?? fallback.score)),
    strengths: parsed.strengths?.length ? parsed.strengths : fallback.strengths,
    weaknesses: parsed.weaknesses?.length ? parsed.weaknesses : fallback.weaknesses,
    feedback: parsed.feedback || fallback.feedback,
    followUp: parsed.followUp || fallback.followUp,
    recruiterNotes: parsed.recruiterNotes || fallback.recruiterNotes,
    confidence: clamp(Number(parsed.confidence ?? fallback.confidence)),
    fillerWordsDetected: parsed.fillerWordsDetected ?? fallback.fillerWordsDetected,
    grammarCorrections: parsed.grammarCorrections || fallback.grammarCorrections,
    nextDifficulty: (parsed.nextDifficulty as any) || fallback.nextDifficulty,
    personalizedPractice: parsed.personalizedPractice?.length
      ? parsed.personalizedPractice
      : fallback.personalizedPractice,
  };
}

export const EvaluationEngine = {
  /**
   * Evaluate one answer. Falls back to local heuristic scoring whenever the
   * AI provider is unavailable, rate limited, or returns malformed output.
   */
  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    const client = getClient();
    if (!client) return heuristicEvaluate(input);

    try {
      return await geminiEvaluate(client, input);
    } catch (error: any) {
      const message = String(error?.message || error);
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("quota")) {
        // Stop hammering a rate-limited key for the rest of the process lifetime.
        cachedClient = null;
      }
      console.log("[EvaluationEngine] Falling back to local scoring engine.");
      return heuristicEvaluate(input);
    }
  },

  /** Exposed for testing / offline use. */
  heuristicEvaluate,
};

export default EvaluationEngine;
