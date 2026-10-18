"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Editor from "@monaco-editor/react";
import {
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Timer,
  Pause,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Code2,
  Search,
  Circle,
  PanelLeft,
  Layers,
  X,
  BookOpen,
  FileCode,
  CheckCheck,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { fireAcceptedConfetti } from "@/lib/confetti";
import { playNotificationSound } from "@/lib/sound";
import { toast } from "sonner";
import {
  getProblemStarterSnippet,
  getDefaultStarterTemplate,
  CURATED_PROBLEMS,
} from "@/data/interviewPrepData";

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", monaco: "javascript", ext: "js" },
  { id: "python", label: "Python", monaco: "python", ext: "py" },
  { id: "cpp", label: "C++", monaco: "cpp", ext: "cpp" },
  { id: "java", label: "Java", monaco: "java", ext: "java" },
  { id: "typescript", label: "TypeScript", monaco: "typescript", ext: "ts" },
];

const TIMER_PRESETS = [
  { label: "15m", seconds: 15 * 60 },
  { label: "30m", seconds: 30 * 60 },
  { label: "45m", seconds: 45 * 60 },
  { label: "60m", seconds: 60 * 60 },
];

export default function MockPracticeWorkspace({
  problem,
  allProblems = CURATED_PROBLEMS,
  solvedList = [],
  onToggleSolved,
  onSelectProblem,
  onClose,
  onProblemSolved,
}) {
  // Current active problem state
  const [currentProblem, setCurrentProblem] = useState(problem || allProblems[0]);

  // Sidebar state
  const [showSidebar, setShowSidebar] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [sidebarFilter, setSidebarFilter] = useState("ALL"); // ALL | SOLVED | UNSOLVED | Easy | Medium | Hard

  // Problem view tabs: description | approach | solutions
  const [activeProblemTab, setActiveProblemTab] = useState("description");

  // Code editor & language
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(() =>
    getProblemStarterSnippet(problem || allProblems[0], "javascript")
  );
  const [testcases, setTestcases] = useState(() => {
    const p = problem || allProblems[0];
    if (p?.exampleTestcases?.length) return p.exampleTestcases;
    if (p?.sampleTestCase) return [p.sampleTestCase];
    return [""];
  });
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Console panel height & state
  const [consoleCollapsed, setConsoleCollapsed] = useState(false);
  const [activeConsoleTab, setActiveConsoleTab] = useState("testcases"); // testcases | result

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("45m");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerIntervalRef = useRef(null);

  // Full problem details fetched from API if available
  const [fullProblem, setFullProblem] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // AI Hint state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHint, setAiHint] = useState("");
  const [hintLevel, setHintLevel] = useState(1);

  // Sync if prop problem changes externally
  useEffect(() => {
    if (problem && problem.id !== currentProblem?.id) {
      handleSwitchProblem(problem);
    }
  }, [problem?.id]);

  // Switch to new problem helper
  const handleSwitchProblem = (newProb) => {
    if (!newProb) return;
    setCurrentProblem(newProb);
    setExecutionResult(null);
    setAiHint("");
    setHintLevel(1);
    setActiveResultIndex(0);
    setActiveCaseIndex(0);
    setUseCustomInput(false);

    // Initial test cases
    if (newProb.exampleTestcases?.length) {
      setTestcases(newProb.exampleTestcases);
    } else if (newProb.sampleTestCase) {
      setTestcases([newProb.sampleTestCase]);
    } else {
      setTestcases([""]);
    }

    // Starter code
    const snippet = getProblemStarterSnippet(newProb, language);
    setCode(snippet);

    if (onSelectProblem) {
      onSelectProblem(newProb);
    }
  };

  // Fetch full details if titleSlug exists
  useEffect(() => {
    let isMounted = true;
    if (currentProblem?.titleSlug) {
      setLoadingDetails(true);
      apiRequest(`/leetcode/${currentProblem.titleSlug}`)
        .then((data) => {
          if (!isMounted) return;
          const prob = data.problem;
          setFullProblem(prob);
          if (prob?.exampleTestcaseList?.length > 0) {
            setTestcases(prob.exampleTestcaseList);
          }
          if (prob?.codeSnippets?.length > 0) {
            const starter = getProblemStarterSnippet(prob, language);
            setCode(starter);
          }
        })
        .catch(() => {
          // Fallback to local curated problem
          setFullProblem(null);
        })
        .finally(() => {
          if (isMounted) setLoadingDetails(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [currentProblem?.titleSlug]);

  // Personal countdown timer logic
  useEffect(() => {
    if (timerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setTimerRunning(false);
            if (soundEnabled) {
              try {
                playNotificationSound("message");
              } catch (e) {}
            }
            toast.error("⏰ Mock Interview Time is Up! Conclude your solution & explain complexity.");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning, soundEnabled]);

  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Language Change Handler
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const activeData = fullProblem || currentProblem;
    const newSnippet = getProblemStarterSnippet(activeData, newLang);
    setCode(newSnippet);
    toast.info(`Language switched to ${SUPPORTED_LANGUAGES.find((l) => l.id === newLang)?.label || newLang}`);
  };

  // Run Code against compiler
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write code before running.");
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);
    setActiveConsoleTab("result");
    setConsoleCollapsed(false);

    try {
      const inputs = useCustomInput
        ? [customInput]
        : testcases.filter((tc) => tc !== undefined && tc !== null);

      const expected = fullProblem?.expectedOutputs || [];

      const result = await apiRequest("/compiler/run", {
        method: "POST",
        body: JSON.stringify({
          code,
          language,
          inputs: inputs.length > 0 ? inputs : [""],
          expectedOutputs: expected.slice(0, inputs.length),
        }),
      });

      setExecutionResult(result);
      setActiveResultIndex(0);

      if (result.success) {
        fireAcceptedConfetti();
        if (soundEnabled) playNotificationSound("join");
        toast.success(`🎉 Accepted! All ${result.totalCount || 1} test cases passed!`);
        if (onProblemSolved && currentProblem?.id) {
          onProblemSolved(currentProblem.id);
        }

        // Record submission
        try {
          await apiRequest("/submissions", {
            method: "POST",
            body: JSON.stringify({
              problemFrontendId: currentProblem?.frontendId ? String(currentProblem.frontendId) : "",
              problemTitle: currentProblem?.title || "Mock Practice Problem",
              problemTitleSlug: currentProblem?.titleSlug || "",
              difficulty: currentProblem?.difficulty || "Custom",
              language,
              code,
              status: "Accepted",
              passedCases: result.totalCount || 1,
              totalCases: result.totalCount || 1,
              runtime: result.runs?.[0]?.time || 0,
              memory: result.runs?.[0]?.memory || 0,
            }),
          });
        } catch (e) {
          // ignore
        }
      } else {
        toast.error("Wrong Answer or Error. Review the compiler feedback below.");
      }
    } catch (err) {
      toast.error("Execution failed: " + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // AI Hint Generator
  const handleAskAIHint = async () => {
    setAiLoading(true);
    try {
      const res = await apiRequest("/ai/hint", {
        method: "POST",
        body: JSON.stringify({
          problemTitle: currentProblem?.title || "Coding Problem",
          problemDescription: fullProblem?.content || currentProblem?.intuition || "",
          currentCode: code,
          language,
          hintLevel,
        }),
      });

      setAiHint(res.hint || "Review two pointers or boundary edge cases.");
      setHintLevel((prev) => Math.min(prev + 1, 3));
      setActiveProblemTab("description");
      toast.success(`Level ${hintLevel} Socratic hint generated! 💡`);
    } catch (err) {
      setAiHint(
        currentProblem?.intuition ||
          "Consider using a Hash Map or Two Pointers to achieve optimal Big-O complexity."
      );
      setActiveProblemTab("description");
      toast.info("Generated blueprint hint.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success("Code copied!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleResetStarter = () => {
    if (!confirm("Reset editor to original starter template?")) return;
    const starter = getProblemStarterSnippet(fullProblem || currentProblem, language);
    setCode(starter);
    toast.info("Editor reset to starter template");
  };

  // Navigation: Next / Prev problem
  const currentIndex = allProblems.findIndex((p) => p.id === currentProblem?.id);
  const handlePrevProblem = () => {
    if (currentIndex > 0) {
      handleSwitchProblem(allProblems[currentIndex - 1]);
    }
  };
  const handleNextProblem = () => {
    if (currentIndex < allProblems.length - 1) {
      handleSwitchProblem(allProblems[currentIndex + 1]);
    }
  };

  // Filtered sidebar problems list
  const filteredSidebarProblems = useMemo(() => {
    return allProblems.filter((p) => {
      const isSolved = solvedList.includes(p.id);
      if (sidebarFilter === "SOLVED" && !isSolved) return false;
      if (sidebarFilter === "UNSOLVED" && isSolved) return false;
      if (
        sidebarFilter === "Easy" ||
        sidebarFilter === "Medium" ||
        sidebarFilter === "Hard"
      ) {
        if (p.difficulty !== sidebarFilter) return false;
      }
      if (sidebarSearch.trim()) {
        const q = sidebarSearch.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          String(p.frontendId).includes(q) ||
          p.pattern.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allProblems, solvedList, sidebarFilter, sidebarSearch]);

  const solvedCount = solvedList.length;
  const isCurrentSolved = solvedList.includes(currentProblem?.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col h-screen w-screen overflow-hidden text-slate-100 select-none">
      {/* =========================================================================
          TOP LEETCODE-GRADE NAVIGATION BAR
      ========================================================================= */}
      <header className="h-14 bg-slate-900/90 border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-2 shrink-0 z-30">
        {/* Left: Hub back, Sidebar toggle, Question selector & Prev/Next */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition shrink-0"
            title="Return to Interview Preparation Hub"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Hub</span>
          </button>

          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className={`p-1.5 rounded-xl border transition shrink-0 ${
              showSidebar
                ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/30"
                : "bg-slate-800 text-slate-400 hover:text-white border-slate-700/60"
            }`}
            title={showSidebar ? "Hide Questions Sidebar" : "Show Questions Sidebar"}
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Prev / Next Buttons */}
          <div className="flex items-center gap-0.5 bg-slate-800/80 rounded-xl p-0.5 border border-slate-700/60 shrink-0">
            <button
              onClick={handlePrevProblem}
              disabled={currentIndex <= 0}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
              title="Previous Problem"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNextProblem}
              disabled={currentIndex >= allProblems.length - 1}
              className="p-1 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition"
              title="Next Problem"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Current Problem Title & Metadata */}
          <div className="flex items-center gap-2 min-w-0 overflow-hidden">
            <span className="font-mono text-xs font-bold text-slate-400 shrink-0">
              #{currentProblem?.frontendId || 1}
            </span>
            <h2 className="font-bold text-xs sm:text-sm text-slate-100 truncate">
              {currentProblem?.title}
            </h2>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border shrink-0 ${
                currentProblem?.difficulty === "Easy"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : currentProblem?.difficulty === "Medium"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
              }`}
            >
              {currentProblem?.difficulty}
            </span>
            <span className="hidden md:inline-block text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium shrink-0">
              {currentProblem?.pattern}
            </span>
          </div>
        </div>

        {/* Right: Solved Toggle, Language, Timer, AI Hint, Run Code */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Solved Status Toggle */}
          <button
            onClick={() => onToggleSolved && onToggleSolved(currentProblem.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              isCurrentSolved
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25"
                : "bg-slate-800/80 text-slate-400 border-slate-700/60 hover:text-slate-200"
            }`}
            title={isCurrentSolved ? "Mark as Unsolved" : "Mark as Solved"}
          >
            {isCurrentSolved ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Circle className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isCurrentSolved ? "Solved" : "Unsolved"}
            </span>
          </button>

          {/* Language Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-transparent text-xs text-indigo-300 font-semibold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Mock Interview Countdown Timer */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-800 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <Timer
              className={`w-3.5 h-3.5 ${
                timerRunning ? "text-amber-400 animate-pulse" : "text-slate-400"
              }`}
            />
            <span
              className={`font-mono text-xs font-bold ${
                timerSeconds < 300
                  ? "text-rose-400"
                  : timerSeconds < 600
                  ? "text-amber-400"
                  : "text-slate-200"
              }`}
            >
              {formatTimer(timerSeconds)}
            </span>

            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="p-1 rounded text-slate-400 hover:text-white transition ml-1"
              title={timerRunning ? "Pause Timer" : "Start Mock Interview Timer"}
            >
              {timerRunning ? (
                <Pause className="w-3 h-3 text-amber-400" />
              ) : (
                <Play className="w-3 h-3 text-emerald-400" />
              )}
            </button>

            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(45 * 60);
              }}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
              title="Reset Timer to 45m"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* AI Hint Button */}
          <button
            onClick={handleAskAIHint}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 rounded-xl text-xs font-semibold transition"
            title="Ask AI Coach for Socratic Hint"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">{aiLoading ? "Thinking..." : "AI Hint"}</span>
          </button>

          {/* Run & Verify Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          {/* Close Workspace Button */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Close LeetCode Workspace"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          MAIN BODY: 3-PANEL SPLIT (Sidebar + Problem Description + Monaco Editor)
      ========================================================================= */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* =====================================================================
            1. COLLAPSIBLE LEFT QUESTIONS SIDEBAR (Blind 75 & Curated)
        ===================================================================== */}
        {showSidebar && (
          <aside className="w-72 sm:w-80 md:w-84 border-r border-slate-800 bg-slate-900/95 flex flex-col h-full shrink-0 overflow-hidden z-20">
            {/* Sidebar Top: Progress & Title */}
            <div className="p-3 border-b border-slate-800 space-y-2.5 bg-slate-950/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Blind 75 Questions</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                  <CheckCheck className="w-3 h-3" />
                  <span>
                    {solvedCount}/{allProblems.length}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.round((solvedCount / Math.max(1, allProblems.length)) * 100)}%`,
                  }}
                />
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Filter by title, #id, pattern..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                {["ALL", "UNSOLVED", "SOLVED", "Easy", "Medium", "Hard"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSidebarFilter(filter)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold whitespace-nowrap transition ${
                      sidebarFilter === filter
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions Scrollable List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-800/30">
              {filteredSidebarProblems.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No questions match your filter.
                </div>
              ) : (
                filteredSidebarProblems.map((p) => {
                  const isSolved = solvedList.includes(p.id);
                  const isCurrent = p.id === currentProblem?.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSwitchProblem(p)}
                      className={`p-2.5 sm:px-3 sm:py-2.5 flex items-center justify-between gap-2.5 cursor-pointer transition ${
                        isCurrent
                          ? "bg-indigo-600/15 border-l-2 border-indigo-500"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Solved Checkbox Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSolved && onToggleSolved(p.id);
                          }}
                          className="text-slate-500 hover:text-emerald-400 transition shrink-0 p-0.5"
                          title={isSolved ? "Mark as Unsolved" : "Mark as Solved"}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-slate-400 shrink-0">
                              #{p.frontendId}
                            </span>
                            <span
                              className={`text-xs truncate ${
                                isCurrent
                                  ? "font-bold text-indigo-300"
                                  : "text-slate-200 hover:text-white"
                              }`}
                            >
                              {p.title}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 truncate mt-0.5">
                            {p.pattern}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          p.difficulty === "Easy"
                            ? "text-emerald-400 bg-emerald-500/10"
                            : p.difficulty === "Medium"
                            ? "text-amber-400 bg-amber-500/10"
                            : "text-rose-400 bg-rose-500/10"
                        }`}
                      >
                        {p.difficulty}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </aside>
        )}

        {/* =====================================================================
            2. PROBLEM STATEMENT & INTUITION PANEL (LeetCode-Style Description)
        ===================================================================== */}
        <section className="w-full lg:w-[42%] min-w-[320px] max-w-full lg:max-w-[48%] border-r border-slate-800 bg-slate-950 flex flex-col h-full overflow-hidden shrink-0">
          {/* Tabs: Description | Optimal Approach | Solutions */}
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveProblemTab("description")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeProblemTab === "description"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Description</span>
              </button>

              <button
                onClick={() => setActiveProblemTab("approach")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeProblemTab === "approach"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Strategy</span>
              </button>

              <button
                onClick={() => setActiveProblemTab("solutions")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  activeProblemTab === "solutions"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Reference</span>
              </button>
            </div>

            {currentProblem?.titleSlug && (
              <a
                href={`https://leetcode.com/problems/${currentProblem.titleSlug}/`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-indigo-400 transition"
                title="View on official LeetCode"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Tab Content with independent smooth scroll */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {/* TAB: DESCRIPTION */}
            {activeProblemTab === "description" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                {/* Big-O Complexity Targets */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-400 font-medium">Target Time:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {currentProblem?.timeComp || "O(N)"}
                  </span>
                  <span className="text-xs text-slate-400 font-medium ml-2">Target Space:</span>
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
                    {currentProblem?.spaceComp || "O(1)"}
                  </span>
                  {currentProblem?.frequency && (
                    <span className="font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg ml-auto">
                      Frequency: {currentProblem.frequency}
                    </span>
                  )}
                </div>

                {/* Companies Asked */}
                {currentProblem?.companies?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] text-slate-500">Seen at:</span>
                    {currentProblem.companies.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400 font-mono border border-slate-700/50"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* AI Hint Banner if triggered */}
                {aiHint && (
                  <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>AI Interviewer Hint (Level {hintLevel - 1})</span>
                    </div>
                    <p className="text-xs text-purple-200/90 leading-relaxed">{aiHint}</p>
                  </div>
                )}

                {/* LeetCode Problem Content HTML or Fallback */}
                {loadingDetails ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs">Loading problem details...</span>
                  </div>
                ) : fullProblem?.content ? (
                  <div
                    className="prose prose-invert prose-xs max-w-none text-slate-300 space-y-3 text-xs leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: fullProblem.content }}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Problem Overview
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Given the problem constraints for <strong>{currentProblem?.title}</strong>,
                        implement an optimal solution using the <strong>{currentProblem?.pattern}</strong>{" "}
                        technique.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300">Target Objectives:</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-400">
                        <li>
                          Achieve optimal time complexity of{" "}
                          <strong className="text-emerald-400 font-mono">
                            {currentProblem?.timeComp}
                          </strong>
                          .
                        </li>
                        <li>
                          Adhere strictly to space complexity constraint{" "}
                          <strong className="text-cyan-400 font-mono">
                            {currentProblem?.spaceComp}
                          </strong>
                          .
                        </li>
                        <li>Handle critical edge cases and large input scales.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: STRATEGY & INTUITION */}
            {activeProblemTab === "approach" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                    <Lightbulb className="w-4 h-4" />
                    <span>Core Intuition & Blueprint</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProblem?.intuition ||
                      "Focus on two pointers, frequency maps, or dynamic programming state transitions."}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Common Traps & Edge Cases</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentProblem?.pitfalls ||
                      "Watch out for empty arrays, single elements, negative numbers, and boundary indexing."}
                  </p>
                </div>
              </div>
            )}

            {/* TAB: REFERENCE SOLUTIONS */}
            {activeProblemTab === "solutions" && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Reference Solution Snippets</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Multi-language blueprints
                  </span>
                </div>

                {currentProblem?.codeSnippets?.length > 0 ? (
                  currentProblem.codeSnippets.map((snip, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden"
                    >
                      <div className="px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-mono text-indigo-300 flex items-center justify-between">
                        <span>{snip.lang}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(snip.code);
                            toast.success(`Copied ${snip.lang} solution`);
                          }}
                          className="hover:text-white transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto custom-scrollbar">
                        {snip.code}
                      </pre>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No reference snippet provided for this question yet.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* =====================================================================
            3. RIGHT MONACO CODE EDITOR & COLLAPSIBLE TESTCASES CONSOLE
        ===================================================================== */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#1e1e1e] min-w-0">
          {/* Editor Header Bar */}
          <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              <span className="font-mono text-xs font-semibold text-slate-200">
                solution.
                {SUPPORTED_LANGUAGES.find((l) => l.id === language)?.ext || "js"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({SUPPORTED_LANGUAGES.find((l) => l.id === language)?.label})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-white transition rounded"
                title="Copy Solution Code"
              >
                {copiedCode ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                onClick={handleResetStarter}
                className="p-1 text-slate-400 hover:text-white transition rounded"
                title="Reset to Starter Template"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 w-full min-h-0 relative">
            <Editor
              height="100%"
              language={SUPPORTED_LANGUAGES.find((l) => l.id === language)?.monaco || "javascript"}
              theme="vs-dark"
              value={code}
              onChange={(newVal) => setCode(newVal || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "var(--font-mono), monospace",
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>

          {/* Bottom Execution Console & Testcases Panel */}
          <div
            className={`border-t border-slate-800 bg-slate-900/95 flex flex-col shrink-0 transition-all duration-200 ${
              consoleCollapsed ? "h-10" : "h-64 sm:h-72"
            }`}
          >
            {/* Console Toolbar */}
            <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/80 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setConsoleCollapsed(!consoleCollapsed)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white font-semibold transition"
                  title={consoleCollapsed ? "Expand Console" : "Collapse Console"}
                >
                  {consoleCollapsed ? (
                    <ChevronUp className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                  <span>Console</span>
                </button>

                <div className="h-4 w-[1px] bg-slate-800 mx-1" />

                <button
                  onClick={() => {
                    setActiveConsoleTab("testcases");
                    if (consoleCollapsed) setConsoleCollapsed(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                    activeConsoleTab === "testcases"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Test Cases
                </button>

                <button
                  onClick={() => {
                    setActiveConsoleTab("result");
                    if (consoleCollapsed) setConsoleCollapsed(false);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1 ${
                    activeConsoleTab === "result"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <span>Test Result</span>
                  {executionResult && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        executionResult.success ? "bg-emerald-400" : "bg-rose-400"
                      }`}
                    />
                  )}
                </button>
              </div>

              {/* Status Badge */}
              {executionResult && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  {executionResult.success ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accepted
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Wrong Answer
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Console Body (Shown only when not collapsed) */}
            {!consoleCollapsed && (
              <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-2 custom-scrollbar">
                {activeConsoleTab === "testcases" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      {testcases.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setUseCustomInput(false);
                            setActiveCaseIndex(idx);
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                            !useCustomInput && activeCaseIndex === idx
                              ? "bg-indigo-600 text-white font-bold"
                              : "bg-slate-800 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          Case {idx + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setUseCustomInput(true)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition ${
                          useCustomInput
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-slate-800 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Custom Input
                      </button>
                    </div>

                    {useCustomInput ? (
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">
                          Custom Testcase Input:
                        </div>
                        <textarea
                          rows={3}
                          value={customInput}
                          onChange={(e) => setCustomInput(e.target.value)}
                          placeholder="Enter arguments, e.g. [2,7,11,15]\n9"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="text-[11px] text-slate-400 mb-1">
                          Input (Case {activeCaseIndex + 1}):
                        </div>
                        <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto text-xs">
                          {testcases[activeCaseIndex] || "(empty input)"}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {activeConsoleTab === "result" && (
                  <div>
                    {!executionResult ? (
                      <div className="py-8 text-center text-slate-500 text-xs">
                        Click &quot;Run&quot; above to execute your solution against test cases.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {executionResult.runs?.[activeResultIndex] ? (
                          <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-400">Result:</span>
                              <span
                                className={`font-bold ${
                                  executionResult.runs[activeResultIndex].passed
                                    ? "text-emerald-400"
                                    : "text-rose-400"
                                }`}
                              >
                                {executionResult.runs[activeResultIndex].status}
                              </span>
                            </div>
                            {executionResult.runs[activeResultIndex].stdout && (
                              <div>
                                <span className="text-slate-500 text-[10px]">Your Output:</span>
                                <pre className="text-emerald-300 text-xs mt-0.5">
                                  {executionResult.runs[activeResultIndex].stdout}
                                </pre>
                              </div>
                            )}
                            {executionResult.runs[activeResultIndex].stderr && (
                              <div>
                                <span className="text-rose-400 text-[10px]">Error:</span>
                                <pre className="text-rose-300 text-xs mt-0.5">
                                  {executionResult.runs[activeResultIndex].stderr}
                                </pre>
                              </div>
                            )}
                          </div>
                        ) : (
                          <pre className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-slate-300 text-xs">
                            {JSON.stringify(executionResult, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
