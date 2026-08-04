/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

export enum SelectionStatus {
  SELECTED = "SELECTED",
  WAITLISTED = "WAITLISTED",
  NOT_SELECTED = "NOT_SELECTED"
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  role: Role;
  targetRole: string;
  experienceLevel: string;
  techStack: string[];
  preferredLang: string;
  resumeUrl?: string;
  resumeData?: ResumeData | null;
  createdAt: string;
}

export interface ResumeData {
  name: string;
  skills: string[];
  projects: Array<{ title: string; description: string; tech: string[] }>;
  experience: Array<{ company: string; role: string; duration: string; details: string }>;
  education: Array<{ degree: string; school: string; year: string; gpa?: string }>;
}

export interface JobDescriptionData {
  companyName: string;
  role: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: string;
  responsibilities: string[];
}

export interface CompanyPattern {
  name: string;
  rounds: string[];
  aptitude_style: string;
  technical_focus: string[];
  hr_culture: string;
  pass_threshold: Record<string, number>;
  time_limits: Record<string, number>;
  difficulty: "easy" | "medium" | "hard" | "adaptive";
}

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string; // Letter 'A', 'B', 'C', or 'D'
  explanation: string;
  topic: string;
}

export interface InterviewQuestion {
  id: string;
  roundNumber: number;
  questionText: string;
  type: "text" | "coding" | "mcq";
  mcqOptions?: string[];
  correctAnswer?: string;
  hints?: string[];
  starterCode?: string;
  idealComplexity?: string;
}

export interface RoundScore {
  roundNumber: number;
  roundName: string;
  score: number;
  passed: boolean;
  transcript: Array<{ sender: "interviewer" | "candidate"; text: string; timestamp: string }>;
  codeSubmission?: string;
  feedbackJson?: any;
  startedAt: string;
  completedAt?: string;
}

export interface BehaviorMetric {
  roundNumber: number;
  avgEyeContact: number;
  avgWpm: number;
  fillerWordCount: number;
  avgConfidence: number;
  emotionProfile: {
    happy: number;
    neutral: number;
    nervous: number;
    confused: number;
    confident: number;
  };
  sampledAt: string;
}

export interface RecruiterNote {
  roundNumber: number;
  noteText: string;
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  action: string;
  metadata: any;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  company: string;
  targetRole: string;
  difficulty: "easy" | "medium" | "hard" | "adaptive";
  jdData?: JobDescriptionData | null;
  overallScore?: number;
  selectionStatus?: SelectionStatus;
  startedAt: string;
  completedAt?: string;
  language: string;
  roundScores: RoundScore[];
  behaviorMetrics: BehaviorMetric[];
  recruiterNotes: RecruiterNote[];
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  company: string;
  role: string;
  score: number;
  date: string;
}
