/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import AvatarPanel from "./components/AvatarPanel";
import LiveMetricsBar from "./components/LiveMetricsBar";
import InteractionPanel from "./components/InteractionPanel";
import RecruiterNotes from "./components/RecruiterNotes";
import CoachingView from "./components/CoachingView";
import DashboardView from "./components/DashboardView";
import ReportView from "./components/ReportView";
import AdminView from "./components/AdminView";
import CoachingAcademy from "./components/CoachingAcademy";
import PlacementRoadmap from "./components/PlacementRoadmap";
import ReportsList from "./components/ReportsList";
import ProfileSettingsView from "./components/ProfileSettingsView";
import { Sparkles, Star, Users, Briefcase, FileText, UploadCloud, ChevronRight, Activity, Eye, ShieldAlert, Award, MessageSquare, Code2 } from "lucide-react";

export default function App() {
  // -------------------------------------------------------------------------
  // USER / AUTH STATE
  // -------------------------------------------------------------------------
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string>("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Junior");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [techStack, setTechStack] = useState("JavaScript, React, Node.js");
  const [authLoading, setAuthLoading] = useState(false);

  // -------------------------------------------------------------------------
  // THEME STATE
  // -------------------------------------------------------------------------
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // -------------------------------------------------------------------------
  // VIEW SWITCHER STATE
  // -------------------------------------------------------------------------
  const [view, setView] = useState<string>("auth"); // dashboard, admin, interview, report, coaching

  // -------------------------------------------------------------------------
  // ACTIVE INTERVIEW SESSION STATE
  // -------------------------------------------------------------------------
  const [activeSession, setActiveSession] = useState<any>(null);
  const [currentRoundNumber, setCurrentRoundNumber] = useState(1);
  const [currentRoundName, setCurrentRoundName] = useState("Aptitude Assessment");
  const [interviewerName, setInterviewerName] = useState("Meera");
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [lastSubmittedScore, setLastSubmittedScore] = useState(0);
  const [showScoreWarning, setShowScoreWarning] = useState<number | null>(null);

  // Avatar states
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [textToSpeak, setTextToSpeak] = useState("");
  const [speechQueue, setSpeechQueue] = useState<string[]>([]);
  const [lastAnswerScore, setLastAnswerScore] = useState<number | null>(null);

  // Live timer state
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes per round
  const timerRef = useRef<any>(null);

  // Togglable recruiter notes drawer
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [recruiterNotes, setRecruiterNotes] = useState<any[]>([]);

  // Diagnostics state
  const [diagnostics, setDiagnostics] = useState({
    eyeContact: 85,
    wpm: 125,
    fillerCount: 0,
    confidence: 90,
    emotions: { happy: 15, neutral: 70, nervous: 10, confused: 5, confident: 80 }
  });

  // Selected session report payload
  const [reportSession, setReportSession] = useState<any>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Language state
  const [language, setLanguage] = useState("en");

  // -------------------------------------------------------------------------
  // RE-AUTH AUTO LOGIN
  // -------------------------------------------------------------------------
  useEffect(() => {
    const savedToken = localStorage.getItem("iq_token");
    const savedUser = localStorage.getItem("iq_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      
      const path = window.location.pathname;
      if (path === "/academy" || path === "/coaching") {
        setView("academy");
      } else if (path === "/roadmap") {
        setView("roadmap");
      } else if (path === "/reports") {
        setView("reports");
      } else if (path === "/profile") {
        setView("profile");
      } else {
        setView("dashboard");
      }
    }
  }, []);

  // Sync theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  // Round count-down logic
  useEffect(() => {
    if (view === "interview" && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            alert("Time is up for this round! Proceeding to evaluation.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [view, timeLeft]);

  // -------------------------------------------------------------------------
  // THEME & LANGUAGE CONTROLLER
  // -------------------------------------------------------------------------
  const handleToggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
  };

  // -------------------------------------------------------------------------
  // AUTH ROUTE CALLS
  // -------------------------------------------------------------------------
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = authMode === "login" 
        ? { email, password } 
        : { email, password, name, experienceLevel, targetRole, techStack: techStack.split(",").map(s => s.trim()) };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("iq_token", data.token);
        localStorage.setItem("iq_user", JSON.stringify(data.user));
        setView("dashboard");
      } else {
        alert("Authentication failed: " + data.error);
      }
    } catch (e: any) {
      alert("Network exception: " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("iq_token");
    localStorage.removeItem("iq_user");
    setToken("");
    setUser(null);
    setView("auth");
  };

  // -------------------------------------------------------------------------
  // INTERVIEW CONTEXT CONTROLLER
  // -------------------------------------------------------------------------
  const handleStartSession = async (config: { company: string; targetRole: string; difficulty: string; jdText: string; language: string; startRound?: number }) => {
    console.log("[DEBUG] Start interview function called");
    setSessionError(null);
    // Unlock SpeechSynthesis synchronously within user click gesture
    if (typeof window !== "undefined" && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const silentUtterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(silentUtterance);
        console.log("[TTS] Unlocked SpeechSynthesis via start-session click gesture.");
      } catch (e) {
        console.warn("[TTS] Unlock error (ignored):", e);
      }
    }

    setIsThinking(true);
    setLanguage(config.language);

    // 1. Resolve and validate user profile/token
    let currentUserProfile = user;
    let currentToken = token;

    if (!currentToken) {
      currentToken = localStorage.getItem("iq_token") || "";
      if (!currentToken) {
        const fallbackUserId = "usr-" + Math.random().toString(36).substr(2, 9);
        currentToken = `token_${fallbackUserId}`;
        localStorage.setItem("iq_token", currentToken);
        setToken(currentToken);
      }
    }

    if (!currentUserProfile) {
      const savedUserStr = localStorage.getItem("iq_user");
      if (savedUserStr) {
        try {
          currentUserProfile = JSON.parse(savedUserStr);
        } catch (err) {
          console.error("Failed to parse iq_user from localStorage:", err);
        }
      }
    }

    // 2. If onboarding is not completed (e.g. no profile is set up or name is empty), redirect to profile view
    if (!currentUserProfile || !currentUserProfile.name || currentUserProfile.name.trim() === "") {
      // Create a candidate profile in memory to help them complete it
      const defaultProfile = {
        name: name || "Mock Candidate",
        email: email || "candidate@interviewiq.ai",
        targetRole: targetRole || config.targetRole || "Software Engineer",
        experienceLevel: experienceLevel || config.difficulty || "Junior",
        techStack: techStack ? techStack.split(",").map(s => s.trim()) : ["React", "TypeScript", "Node.js"]
      };
      localStorage.setItem("iq_user", JSON.stringify(defaultProfile));
      setUser(defaultProfile);
      
      console.log("[DEBUG] Incomplete onboarding profile. Redirecting user to complete onboarding.");
      setView("profile");
      setIsThinking(false);
      alert("Please complete your candidate profile before starting the mock interview.");
      return;
    }

    // 3. Fallback: If some optional fields are missing on the profile, populate them safely
    if (!currentUserProfile.targetRole) currentUserProfile.targetRole = config.targetRole || "Software Engineer";
    if (!currentUserProfile.experienceLevel) currentUserProfile.experienceLevel = config.difficulty || "Junior";
    if (!currentUserProfile.techStack) currentUserProfile.techStack = ["React", "TypeScript", "Node.js"];

    try {
      console.log("[DEBUG] Session initialization started");
      const res = await fetch("/api/interview/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`
        },
        body: JSON.stringify({
          ...config,
          userProfile: currentUserProfile
        })
      });
      const data = await res.json();

      if (res.ok && data.session) {
        console.log("[DEBUG] Session initialization completed");
        setActiveSession(data.session);
        const sr = config.startRound || 1;
        setCurrentRoundNumber(sr);
        const roundNames = [
          "Aptitude Assessment",
          "Communication Assessment",
          "Technical Coding Round",
          "HR fit Round"
        ];
        const initialRoundName = roundNames[sr - 1];
        setCurrentRoundName(initialRoundName);
        setInterviewerName("Priya"); // Priya delivers the welcome greeting initially
        setTimeLeft(600); // Reset timer
        setRecruiterNotes([]);

        const greetingText = "Hello, welcome to InterviewIQ. I'm Priya. I'll be conducting your communication interview today. Let's begin.";

        if (sr === 1) {
          const qText = "Welcome to your Aptitude Assessment! Answer the 5 quantitative and logical reasoning multiple choice questions below.";
          setCurrentQuestionText(qText);
          triggerAvatarSpeech([greetingText, qText]);
        } else {
          setCurrentQuestionText("Formulating target question...");
          // Call next-question API on session init for chosen non-aptitude round
          try {
            const qRes = await fetch(`/api/interview/${data.session.id}/next-question`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                roundNumber: sr,
                roundName: initialRoundName
              })
            });
            const qData = await qRes.json();
            if (qRes.ok) {
              const qText = qData.questionText;
              setCurrentQuestionText(qText);
              triggerAvatarSpeech([greetingText, qText]);
            } else {
              const qText = "Let's begin the round! Tell me about yourself.";
              setCurrentQuestionText(qText);
              triggerAvatarSpeech([greetingText, qText]);
            }
          } catch (qErr) {
            console.error("Failed to fetch initial round question:", qErr);
            const qText = "Let's begin the round! Tell me about yourself.";
            setCurrentQuestionText(qText);
            triggerAvatarSpeech([greetingText, qText]);
          }
        }

        console.log("[DEBUG] Navigation requested");
        setView("interview");
      } else {
        const errMsg = data.error || "Unknown initialization failure.";
        setSessionError("Session initialization failed: " + errMsg);
        if (res.status === 401) {
          setView("dashboard");
        }
      }
    } catch (e: any) {
      setSessionError("Connection failure: " + e.message);
    } finally {
      setIsThinking(false);
    }
  };

  const triggerAvatarSpeech = (text: string | string[]) => {
    const texts = Array.isArray(text) ? text : [text];
    if (texts.length === 0) return;

    setIsSpeaking(true);
    setIsListening(false);

    const [first, ...rest] = texts;
    setSpeechQueue(rest);
    setTextToSpeak(first);
  };

  const handleSpeechEnd = () => {
    if (speechQueue.length > 0) {
      const nextText = speechQueue[0];
      setSpeechQueue((prev) => prev.slice(1));

      // Reset the interviewer to the actual recruiter of the current round once welcome greeting finishes
      if (currentRoundNumber === 1) {
        setInterviewerName("Meera");
      } else if (currentRoundNumber === 2) {
        setInterviewerName("Priya");
      } else if (currentRoundNumber === 3) {
        setInterviewerName("Aanya");
      } else if (currentRoundNumber === 4) {
        setInterviewerName("Neha");
      }

      setTextToSpeak(nextText);
      setIsSpeaking(true);
      setIsListening(false);
    } else {
      setIsSpeaking(false);
      setIsListening(true);
    }
  };

  // Handle recorded behavioral metrics
  const handleRecordMetric = (metrics: any) => {
    setDiagnostics(metrics);
  };

  // Submission handler from the MCQ or code workspace
  const handleAnswerSubmit = async (answerText: string) => {
    // Evaluation feedback occurs inside InteractionPanel, so we just save the final score once computed
  };

  // Advance state machine to the next round!
  const handleCompleteRound = async (score: number) => {
    setLastSubmittedScore(score);
    setIsListening(false);
    setIsSpeaking(false);

    // If candidate scored below threshold, prompt them
    if (score < 60) {
      setShowScoreWarning(score);
      return;
    }

    // Otherwise, advance to next round!
    await advanceToNextRound();
  };

  const advanceToNextRound = async () => {
    const nextRound = currentRoundNumber + 1;
    if (nextRound > 4) {
      // Completed all rounds! Request selection decision scorecard
      setIsThinking(true);
      try {
        const res = await fetch(`/api/interview/${activeSession.id}/complete`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setReportSession(data.session);
          setView(`session-report-${activeSession.id}`);
        } else {
          alert("Error resolving decision summary. Returning home.");
          setView("dashboard");
        }
      } catch (e) {
        console.error(e);
        setView("dashboard");
      } finally {
        setIsThinking(false);
      }
      return;
    }

    // Set next round parameters
    setIsThinking(true);
    setCurrentRoundNumber(nextRound);
    setTimeLeft(600);

    const roundNames = [
      "Aptitude Assessment",
      "Communication Assessment",
      "Technical Coding Round",
      "HR fit Round"
    ];
    const targetRoundName = roundNames[nextRound - 1];
    setCurrentRoundName(targetRoundName);

    // Call server to fetch initial round question
    try {
      const res = await fetch(`/api/interview/${activeSession.id}/next-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roundNumber: nextRound,
          roundName: targetRoundName
        })
      });
      const data = await res.json();
      if (res.ok) {
        const invName = data.interviewer || (nextRound === 2 ? "Priya" : nextRound === 3 ? "Aanya" : "Neha");
        setInterviewerName(invName);
        setCurrentQuestionText(data.questionText);
        triggerAvatarSpeech(data.questionText);
      } else {
        alert("Failed to compile next round parameters.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsThinking(false);
    }
  };

  const handleNextQuestion = async () => {
    // Ask another question INSIDE the current round (round advance is a
    // separate action handled by "Complete this round").
    setLastAnswerScore(null);
    setIsListening(false);
    setIsThinking(true);
    try {
      const res = await fetch(`/api/interview/${activeSession.id}/next-question`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          roundNumber: currentRoundNumber,
          roundName: currentRoundName
        })
      });
      const data = await res.json();
      if (res.ok && data.questionText) {
        if (data.interviewer) setInterviewerName(data.interviewer);
        setCurrentQuestionText(data.questionText);
        triggerAvatarSpeech(data.questionText);
      } else {
        setSessionError("Could not load the next question. Please try again.");
        setIsListening(true);
      }
    } catch (e: any) {
      console.error("Failed to fetch next question:", e);
      setSessionError("Connection failure while loading the next question.");
      setIsListening(true);
    } finally {
      setIsThinking(false);
    }
  };


  // Custom route view checks
  const isReportViewActive = view.startsWith("session-report-");
  const isCoachingViewActive = view.startsWith("coaching-");

  // -------------------------------------------------------------------------
  // MAIN BODY RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans text-zinc-800 dark:text-zinc-100 transition-colors flex flex-col">
      
      {/* RENDER HEADER ONLY WHEN LOGGED IN */}
      {view !== "auth" && (
        <>
          <Header
            user={user}
            currentRound={view === "interview" ? currentRoundName : undefined}
            timeLeft={view === "interview" ? timeLeft : undefined}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            language={language}
            onLanguageChange={handleLanguageChange}
            onLogout={handleLogout}
            setView={setView}
            companyName={activeSession?.company}
          />
          
          {/* PERSISTENT SUB-HEADER NAVIGATION BAR */}
          <div className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-850 px-6 py-2 shadow-sm shrink-0">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <nav className="flex flex-wrap gap-1.5" aria-label="Main Navigation">
                {[
                  { id: "dashboard", label: "Dashboard", icon: "🏠" },
                  { id: "interview-trigger", label: "Mock Interview", icon: "🎤" },
                  { id: "academy", label: "InterviewIQ Academy", icon: "🎓" },
                  { id: "roadmap", label: "Placement Roadmap", icon: "🛣️" },
                  { id: "reports", label: "Reports", icon: "📊" },
                  { id: "profile", label: "Profile", icon: "👤" },
                ].map((item) => {
                  let isActive = view === item.id;
                  if (item.id === "interview-trigger") {
                    isActive = view === "interview";
                  }
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.id === "interview-trigger") {
                          // Switch to dashboard and scroll to configuring chamber
                          setView("dashboard");
                          window.history.pushState({}, "", "/");
                          setTimeout(() => {
                            const el = document.getElementById("configure-interview-panel");
                            if (el) {
                              el.scrollIntoView({ behavior: "smooth" });
                            }
                          }, 250);
                        } else {
                          setView(item.id);
                          window.history.pushState({}, "", item.id === "dashboard" ? "/" : `/${item.id}`);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-600 text-white shadow font-black scale-[1.02]"
                          : "text-zinc-500 hover:text-zinc-850 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <span className="text-sm shrink-0">{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Quick Readiness Progress Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-xl text-xs font-bold text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Job Readiness Score: <strong className="text-indigo-600 dark:text-indigo-400 font-mono font-black">82%</strong></span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* VIEW DELEGATIONS */}
      <main className="flex-1">
        
        {/* A. AUTH VIEW */}
        {view === "auth" && (
          <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 relative overflow-hidden">
            <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[60px] top-10 left-10 pointer-events-none" />
            <div className="absolute w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[60px] bottom-10 right-10 pointer-events-none" />

            <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 p-8 rounded-3xl shadow-2xl relative z-10" id="auth-card">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-xl mx-auto shadow-md">
                  IQ
                </div>
                <h2 className="text-2xl font-black mt-3 text-zinc-50 font-sans tracking-tight">
                  Welcome to InterviewIQ
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Enterprise-grade AI Mock Interview & Behavioral Diagnostics Panel
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === "register" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Candidate Name</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Meera Sharma"
                        className="w-full p-3 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Experience</label>
                        <select
                          value={experienceLevel}
                          onChange={(e) => setExperienceLevel(e.target.value)}
                          className="w-full p-2.5 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                        >
                          <option value="Junior">Junior (0-2 Yrs)</option>
                          <option value="Mid">Mid (2-5 Yrs)</option>
                          <option value="Senior">Senior (5+ Yrs)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Target Role</label>
                        <input
                          type="text"
                          required
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          placeholder="e.g. React Lead"
                          className="w-full p-2.5 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Key Technologies</label>
                      <input
                        type="text"
                        required
                        value={techStack}
                        onChange={(e) => setTechStack(e.target.value)}
                        placeholder="React, TypeScript, Node.js"
                        className="w-full p-3 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full p-3 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-mono font-bold text-zinc-400">Secret Pin-Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-3 border border-zinc-800 rounded-xl bg-zinc-900 mt-1 text-xs font-semibold text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors"
                >
                  {authLoading ? "Synchronizing server secure handshake..." : authMode === "login" ? "Secure Login" : "Initialize Credentials"}
                </button>
              </form>

              <div className="border-t border-zinc-800 mt-6 pt-4 text-center">
                <button
                  onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
                  className="text-xs text-indigo-400 hover:underline font-bold"
                >
                  {authMode === "login" ? "New candidate? Create an account" : "Have an account? Secure Sign-In"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* B. DASHBOARD VIEW */}
        {view === "dashboard" && (
          <DashboardView
            user={user}
            onStartSession={handleStartSession}
            setView={setView}
            token={token}
            isThinking={isThinking}
            sessionError={sessionError}
            setSessionError={setSessionError}
          />
        )}

        {/* C. INTERVIEW SESSION CHAMBER VIEW */}
        {view === "interview" && activeSession && (
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-6 flex flex-col justify-between" id="mock-chamber">
            
            {/* Action panel stream options */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono">
                  Live webcam & voice session stream active
                </span>
              </div>

              <button
                onClick={() => setIsNotesOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reveal Live Recruiter Comments
              </button>
            </div>

            {/* Interactive Round Navigator Tabs */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-100 dark:border-zinc-900 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 font-mono">
                  Practice Round Selector (Jump to any stage anytime)
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold rounded-full">
                  Multi-Round Simulator
                </span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  { num: 1, name: "Aptitude Assessment", icon: <Award className="w-4 h-4" /> },
                  { num: 2, name: "Communication Assessment", icon: <MessageSquare className="w-4 h-4" /> },
                  { num: 3, name: "Technical Coding Round", icon: <Code2 className="w-4 h-4" /> },
                  { num: 4, name: "HR Fit Round", icon: <Users className="w-4 h-4" /> }
                ].map((round) => {
                  const isActive = currentRoundNumber === round.num;
                  return (
                    <button
                      key={round.num}
                      onClick={async () => {
                        if (isThinking) return;
                        setIsThinking(true);
                        setCurrentRoundNumber(round.num);
                        setCurrentRoundName(round.name);
                        setInterviewerName(round.num === 1 ? "Meera" : round.num === 2 ? "Priya" : round.num === 3 ? "Aanya" : "Neha");
                        
                        if (round.num === 1) {
                          setCurrentQuestionText("Welcome to your Aptitude Assessment! Answer the 5 quantitative and logical reasoning multiple choice questions below.");
                          triggerAvatarSpeech("Welcome to your Aptitude Assessment! Answer the 5 quantitative and logical reasoning multiple choice questions below.");
                          setIsThinking(false);
                        } else {
                          setCurrentQuestionText("Formulating target question...");
                          try {
                            const qRes = await fetch(`/api/interview/${activeSession.id}/next-question`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({
                                roundNumber: round.num,
                                roundName: round.name
                              })
                            });
                            const qData = await qRes.json();
                            if (qRes.ok) {
                              setInterviewerName(qData.interviewer || (round.num === 2 ? "Priya" : round.num === 3 ? "Aanya" : "Neha"));
                              setCurrentQuestionText(qData.questionText);
                              triggerAvatarSpeech(qData.questionText);
                            } else {
                              setCurrentQuestionText("Let's begin the round! Tell me about yourself.");
                              triggerAvatarSpeech("Let's begin the round! Tell me about yourself.");
                            }
                          } catch (qErr) {
                            console.error("Failed to fetch round question:", qErr);
                            setCurrentQuestionText("Let's begin the round! Tell me about yourself.");
                            triggerAvatarSpeech("Let's begin the round! Tell me about yourself.");
                          } finally {
                            setIsThinking(false);
                          }
                        }
                      }}
                      className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center gap-2.5 ${
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-[1.01]"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${isActive ? "bg-indigo-500 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                        {round.num}
                      </span>
                      <span className="truncate">{round.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Central visual and interaction module */}
            <div className="flex flex-col md:flex-row gap-6">
              <AvatarPanel
                roundNumber={currentRoundNumber}
                interviewerName={interviewerName}
                isSpeaking={isSpeaking}
                isThinking={isThinking}
                isListening={isListening}
                textToSpeak={textToSpeak}
                onSpeechEnd={handleSpeechEnd}
                lastAnswerScore={lastAnswerScore}
              />

              <InteractionPanel
                roundNumber={currentRoundNumber}
                roundName={currentRoundName}
                questionText={currentQuestionText}
                isThinking={isThinking}
                onAnswerSubmit={handleAnswerSubmit}
                onNextQuestion={handleNextQuestion}
                onCompleteRound={handleCompleteRound}
                sessionId={activeSession.id}
                language={language}
                avatarSpeak={triggerAvatarSpeech}
                onRecordMetric={handleRecordMetric}
                onAnswerEvaluated={(score) => setLastAnswerScore(score)}
                isListening={isListening}
                isSpeaking={isSpeaking}
                setIsListening={setIsListening}
                setIsSpeaking={setIsSpeaking}
              />
            </div>

            {/* Collapsible live diagnostics footer bar */}
            <LiveMetricsBar metrics={diagnostics} />

            {/* Togglable side comment drawer */}
            <RecruiterNotes
              isOpen={isNotesOpen}
              onClose={() => setIsNotesOpen(false)}
              notes={recruiterNotes}
              roundsList={[
                "Aptitude Assessment",
                "Communication Assessment",
                "Technical Coding Round",
                "HR fit Round"
              ]}
            />

            {/* Show low score warning modal */}
            {showScoreWarning !== null && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl text-center space-y-5 animate-scale-up">
                  <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-2xl flex items-center justify-center text-3xl mx-auto shadow-sm">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 font-sans">
                      Performance Milestone Note
                    </h3>
                    <p className="text-sm font-bold text-zinc-500 mt-1 font-mono uppercase tracking-wider">
                      Round {currentRoundNumber} Score: <span className="text-indigo-600 dark:text-indigo-400">{showScoreWarning}%</span>
                    </p>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    To match benchmark eligibility scores of top-tier companies, a target of <strong className="text-zinc-800 dark:text-zinc-200">60% or above</strong> is recommended. 
                    Would you like to step into the personalized <strong>Coaching Academy</strong> to boost your skills, or <strong>ignore the benchmark and proceed</strong> directly to the next round anyway?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <button
                      onClick={() => {
                        setShowScoreWarning(null);
                        setView(`coaching-${currentRoundNumber}`);
                      }}
                      className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      Go to Coaching Academy
                    </button>
                    <button
                      onClick={async () => {
                        setShowScoreWarning(null);
                        await advanceToNextRound();
                      }}
                      className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-extrabold text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 transition-colors"
                    >
                      Proceed to Next Round
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* D. SPECIALIZED COACHING VIEW */}
        {isCoachingViewActive && (
          <CoachingView
            roundNumber={currentRoundNumber}
            roundName={currentRoundName}
            score={lastSubmittedScore}
            onRetake={() => handleStartSession({
              company: activeSession?.company || "TCS",
              targetRole: activeSession?.targetRole || "Software Engineer",
              difficulty: activeSession?.difficulty || "medium",
              jdText: activeSession?.jdData || "",
              language: language
            })}
            onExit={() => setView("dashboard")}
          />
        )}

        {/* E. REPORT SCORECARD VIEW */}
        {isReportViewActive && (
          <ReportView
            session={reportSession || activeSession}
            onExit={() => setView("dashboard")}
            setView={setView}
            onStartRetest={(config: any) => handleStartSession({
              company: config.company || activeSession?.company || "TCS",
              targetRole: config.targetRole || activeSession?.targetRole || "Software Engineer",
              difficulty: config.difficulty || activeSession?.difficulty || "medium",
              jdText: activeSession?.jdData || "",
              language: language
            })}
          />
        )}

        {/* F. SYSTEM ADMIN VIEW */}
        {view === "admin" && (
          <AdminView
            token={token}
            onExit={() => setView("dashboard")}
          />
        )}

        {/* G. INTERVIEWIQ ACADEMY VIEW */}
        {(view === "academy" || view === "coaching") && (
          <CoachingAcademy
            session={activeSession || reportSession}
            onExit={() => setView("dashboard")}
            setView={setView}
            onStartRetest={(config: any) => handleStartSession({
              company: config.company || activeSession?.company || "TCS",
              targetRole: config.targetRole || activeSession?.targetRole || "Software Engineer",
              difficulty: config.difficulty || activeSession?.difficulty || "medium",
              jdText: activeSession?.jdData || "",
              language: language
            })}
          />
        )}

        {/* H. PLACEMENT ROADMAP VIEW */}
        {view === "roadmap" && (
          <PlacementRoadmap
            session={activeSession || reportSession}
            user={user}
            setView={setView}
          />
        )}

        {/* I. DEDICATED REPORTS CATALOG VIEW */}
        {view === "reports" && (
          <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
            <ReportsList
              setView={setView}
              setReportSession={setReportSession}
              token={token}
            />
          </div>
        )}

        {/* J. CANDIDATE PROFILE SETTINGS VIEW */}
        {view === "profile" && (
          <ProfileSettingsView
            user={user}
            setUser={setUser}
            experienceLevel={experienceLevel}
            setExperienceLevel={setExperienceLevel}
            targetRole={targetRole}
            setTargetRole={setTargetRole}
            techStack={techStack}
            setTechStack={setTechStack}
            setView={setView}
          />
        )}

      </main>
    </div>
  );
}
