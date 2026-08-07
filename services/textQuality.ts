/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * textQuality
 * -----------
 * Language-quality + relevance primitives used by the offline evaluator.
 * Pure functions, no I/O, no network. Deterministic and fully testable.
 */

/** ~180 of the most frequent English letter bigrams. */
const COMMON_BIGRAMS = new Set(
  ("th he in er an re on at en nd ti es or te of ed is it al ar st to nt ng se ha as ou io le ve co me de hi ri ro ic ne ea ra ce li ch ll be ma si om ur ca el ta la ns di fo ho pe ec pr no ct us ac ot il tr ly nc et ut ss so rs un lo wa ge ie wh ee wi em ad ol rt po we na ul ni ts mo ow pa im mi ai sh ir su id os iv ia am fi ci vi pl ig tu ev ld ry mp fe bl ab gh ap ck ge sp rd sa ai op ba ei by ay ki nt ph ex qu ju ky sc sk sl sm sn sw tw dr fr gr br cr pr tr wr bo bu cu cl du fa fl fu gi go gu ha hu ja je ke ku lu mu nu pi pu re ru sy ti tt oo ss ff nn mm rr ll cc dd pp ee").split(
    /\s+/,
  ),
);

/** Frequently used English function/content words that anchor real prose. */
const COMMON_WORDS = new Set(
  ("a an the and or but if then than that this these those there here is are was were be been being am do does did done have has had having will would shall should can could may might must not no yes of in on at to from by with without for about into over under again further once all any both each few more most other some such only own same so too very i you he she it we they me him her us them my your his its our their who whom which what when where why how as because while during before after above below up down out off between against about very just now also however therefore thus hence example instead means used using use uses make makes made get gets got give gives given take takes taken like want need work works working help helps time times people person team project company role job answer question interview experience skill skills learn learned learning problem problems solution solutions result results process system data value values type types way ways part parts new good better best able allow allows allowed"
  ).split(/\s+/),
);

/** Domain lexicon so real technical vocabulary is never flagged as gibberish. */
const DOMAIN_WORDS = new Set(
  ("polymorphism inheritance encapsulation abstraction interface implementation override overriding overload overloading class classes object objects instance instances method methods constructor destructor subclass superclass parent child base derived runtime compile compiletime static dynamic virtual generic generics algorithm algorithms complexity bigo logarithmic linear quadratic constant recursion recursive iteration iterative array arrays list linked stack queue heap tree binary graph hash hashmap hashtable dictionary set tuple string integer boolean float pointer reference memory garbage collector collection thread threads threading concurrency parallel mutex semaphore deadlock process processes scheduling paging segmentation virtualmemory kernel syscall filesystem cache caching buffer database databases sql query queries join joins inner outer left right normalization normalize denormalization index indexes indexing transaction transactions acid atomicity consistency isolation durability primary foreign key constraint schema table tables row rows column columns aggregate groupby having subquery view trigger stored procedure nosql mongodb postgres mysql tcp udp ip http https dns osi socket router switch subnet packet latency bandwidth firewall ssl tls rest api endpoint json xml microservice monolith docker kubernetes deployment scalability availability throughput python java javascript typescript react angular node express html css dom flexbox grid selector responsive closure hoisting promise async await callback eventloop prototype module import export variable function functions loop loops conditional exception exceptions try catch finally throw error handling debugging testing unittest integration mocking framework library repository git branch merge commit pipeline agile scrum sprint stakeholder deadline mentorship leadership ownership initiative collaboration communication conflict feedback deliverable milestone metric kpi revenue customer product design tradeoff tradeoffs optimize optimization refactor refactoring maintainable readable scalable pandas numpy tensor model training dataset regression classification"
  ).split(/\s+/),
);

const FILLER_WORDS = [
  "um", "uh", "erm", "hmm", "like", "you know", "basically", "actually",
  "literally", "sort of", "kind of", "i mean", "so yeah",
];

const STOPWORDS = new Set(
  ("a an the and or but of in on at to from by with for is are was were be been being that this these those what which who whom how why when where do does did can could should would will shall it its as if then than there here you your my our their his her them us we i he she they not no yes so such into about over under also more most very".split(
    /\s+/,
  )),
);

export type AnswerVerdict =
  | "VALID"
  | "PARTIALLY_RELEVANT"
  | "IRRELEVANT"
  | "GIBBERISH"
  | "TOO_SHORT"
  | "EMPTY";

export interface QualityReport {
  wordCount: number;
  sentenceCount: number;
  englishRatio: number;
  uniqueRatio: number;
  gibberishWords: string[];
  fillerWords: string[];
  hasSentenceStructure: boolean;
  isKeyboardSmash: boolean;
}

export function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** Very small, forgiving suffix stemmer so "extends"/"extended" ~ "extend". */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z0-9+#]/g, "");
  if (w.length <= 4) return w;
  for (const suf of ["ization", "isation", "ingly", "edly", "ing", "ies", "ied", "ers", "er", "ed", "es", "s", "ly", "ness", "ment", "ity", "ance", "ence"]) {
    if (w.endsWith(suf) && w.length - suf.length >= 4) {
      w = w.slice(0, w.length - suf.length);
      break;
    }
  }
  if (w.endsWith("i")) w = w.slice(0, -1) + "y";
  return w;
}

function bigramPlausibility(word: string): number {
  const w = word.replace(/[^a-z]/g, "");
  if (w.length < 3) return 1;
  let hits = 0;
  let total = 0;
  for (let i = 0; i < w.length - 1; i++) {
    total++;
    if (COMMON_BIGRAMS.has(w.slice(i, i + 2))) hits++;
  }
  return total ? hits / total : 1;
}

/** True when the token plausibly is a real (English or technical) word. */
export function looksLikeWord(token: string): boolean {
  const w = token.replace(/[^a-z0-9+#]/g, "");
  if (!w) return false;
  if (/^\d+(\.\d+)?$/.test(w)) return true; // numbers are fine
  const s = stem(w);
  if (COMMON_WORDS.has(w) || COMMON_WORDS.has(s)) return true;
  if (DOMAIN_WORDS.has(w) || DOMAIN_WORDS.has(s)) return true;
  if (w.length <= 2) return true; // too short to judge
  const letters = w.replace(/[^a-z]/g, "");
  if (!letters) return false;
  const vowels = (letters.match(/[aeiouy]/g) || []).length;
  const vowelRatio = vowels / letters.length;
  if (vowelRatio < 0.2 || vowelRatio > 0.85) return false;
  if (/[bcdfghjklmnpqrstvwxz]{4,}/.test(letters)) return false;
  if (/(.)\1{2,}/.test(letters)) return false;
  if (/(qwer|wert|erty|asdf|sdfg|zxcv|xcvb|hjkl|uiop)/.test(letters)) return false;
  return bigramPlausibility(letters) >= 0.62;
}

export function analyseQuality(text: string): QualityReport {
  const answer = (text || "").trim();
  const tokens = tokenize(answer);
  const words = tokens.filter((t) => /[a-z]/.test(t));
  const sentences = answer.split(/[.!?\n]+/).map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 3);

  const gibberishWords = words.filter((w) => !looksLikeWord(w));
  const englishRatio = words.length ? 1 - gibberishWords.length / words.length : 0;
  const uniqueRatio = words.length ? new Set(words).size / words.length : 0;

  const lower = ` ${answer.toLowerCase()} `;
  const fillerWords = FILLER_WORDS.filter((f) => lower.includes(` ${f} `) || lower.includes(`${f},`));

  // A real sentence generally contains at least one function word.
  const hasSentenceStructure = words.some((w) => COMMON_WORDS.has(w)) && words.length >= 5;

  const isKeyboardSmash =
    words.length > 0 && (englishRatio < 0.45 || (uniqueRatio < 0.35 && words.length > 8));

  return {
    wordCount: tokens.length,
    sentenceCount: Math.max(sentences.length, answer ? 1 : 0),
    englishRatio,
    uniqueRatio,
    gibberishWords: Array.from(new Set(gibberishWords)).slice(0, 8),
    fillerWords,
    hasSentenceStructure,
    isKeyboardSmash,
  };
}

/** Content (non-stopword) stems of a piece of text. */
export function contentStems(text: string): string[] {
  return tokenize(text)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .map(stem);
}

/**
 * Concept coverage: a concept counts as covered when most of its content
 * words (or one of its synonym variants) appear in the answer. Deliberately
 * fuzzy so "one interface with multiple implementations" matches
 * "same interface different implementations".
 */
export function conceptCoverage(
  answer: string,
  concepts: string[],
): { matched: string[]; missing: string[]; ratio: number } {
  const answerStems = new Set(contentStems(answer));
  const matched: string[] = [];
  const missing: string[] = [];

  for (const concept of concepts || []) {
    const parts = contentStems(concept);
    if (parts.length === 0) continue;
    const hits = parts.filter((p) => answerStems.has(p)).length;
    const needed = parts.length === 1 ? 1 : Math.ceil(parts.length * 0.6);
    if (hits >= needed) matched.push(concept);
    else missing.push(concept);
  }

  const total = matched.length + missing.length;
  return { matched, missing, ratio: total ? matched.length / total : 0 };
}

/** Overlap between the question's content words and the answer. */
export function questionOverlap(question: string, answer: string): number {
  const qStems = Array.from(new Set(contentStems(question)));
  if (qStems.length === 0) return 0;
  const aStems = new Set(contentStems(answer));
  const hits = qStems.filter((s) => aStems.has(s)).length;
  return hits / qStems.length;
}

export function hasExample(answer: string): boolean {
  const lower = (answer || "").toLowerCase();
  return (
    /\bfor example\b|\be\.g\.|\bfor instance\b|\bsuch as\b|\bimagine\b|\bconsider\b|\bsuppose\b|\blet's say\b/.test(lower) ||
    /[{}();]|=>|\bclass \w+|\bdef \w+|\bfunction \w+/.test(answer || "")
  );
}

/** STAR component detection for behavioural answers. */
export function detectStar(answer: string): { situation: boolean; task: boolean; action: boolean; result: boolean } {
  const l = (answer || "").toLowerCase();
  return {
    situation: /\b(when|while|during|at my|in my (last|previous)|we were|the situation|context|project|internship|semester)\b/.test(l),
    task: /\b(responsib|my task|i had to|goal|objective|needed to|asked me|assigned|deadline|requirement)\b/.test(l),
    action: /\b(i (did|built|led|created|implemented|designed|organis|organiz|wrote|refactor|coordinat|propos|automat|debug|reached|talked|decided)|we (built|implemented|decided|split))\b/.test(l),
    result: /\b(result|outcome|reduced|increased|improved|saved|achieved|delivered|shipped|learned|impact|\d+\s*%|percent)\b/.test(l),
  };
}

export { FILLER_WORDS, STOPWORDS };
