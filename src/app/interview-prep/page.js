"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import {
  Trophy,
  ArrowLeft,
  Sparkles,
  BookOpen,
  Timer,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Layers,
  MessageSquare,
  Cpu,
  Award,
  Filter,
  Search,
  Users,
  Play,
  Lightbulb,
  AlertTriangle,
  Code2,
  Check,
  Copy,
  Compass,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  CURATED_PROBLEMS,
  BEHAVIORAL_QUESTIONS,
  SYSTEM_DESIGN_TOPICS,
} from "@/data/interviewPrepData";
import MockPracticeWorkspace from "@/components/MockPracticeWorkspace";
import SystemDesignPrimer from "@/components/SystemDesignPrimer";
import {
  PREF_KEYS,
  getStorageItem,
  setStorageItem,
  getStorageJSON,
  setStorageJSON,
} from "@/lib/preferences";

export default function InterviewPrepPage({ embedded = false }) {
  const router = useRouter();
  const { user } = useAuth();

  // Load initial tab and filters from localStorage preferences
  const [activeTab, setActiveTab] = useState(() => {
    return getStorageItem(PREF_KEYS.PREP_ACTIVE_TAB, "dsa");
  });
  const [selectedPattern, setSelectedPattern] = useState(() => {
    return getStorageItem(PREF_KEYS.PREP_PATTERN_FILTER, "ALL");
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState(() => {
    return getStorageItem(PREF_KEYS.PREP_DIFF_FILTER, "ALL");
  });
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'SOLVED' | 'UNSOLVED'
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedProblemId, setExpandedProblemId] = useState(null);
  const [solvedList, setSolvedList] = useState([]);
  const [behavioralPrepared, setBehavioralPrepared] = useState([]);
  const [lastPracticedProblem, setLastPracticedProblem] = useState(null);
  const [preferredLang, setPreferredLang] = useState("javascript");
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [selectedPracticeProblem, setSelectedPracticeProblem] = useState(null);
  const [revealedApproachIds, setRevealedApproachIds] = useState([]);

  // Load preferences, solved list, and drafts from localStorage
  useEffect(() => {
    const savedSolved = getStorageJSON(PREF_KEYS.SOLVED_PROBLEMS);
    if (savedSolved) setSolvedList(savedSolved);

    const savedPrepared = getStorageJSON(PREF_KEYS.BEHAVIORAL_PREPARED);
    if (savedPrepared) setBehavioralPrepared(savedPrepared);

    const savedLastId = getStorageItem(PREF_KEYS.LAST_PROBLEM_ID);
    if (savedLastId) {
      const match = CURATED_PROBLEMS.find((p) => String(p.id) === String(savedLastId));
      if (match) setLastPracticedProblem(match);
    }

    const savedLang = getStorageItem(PREF_KEYS.PREFERRED_LANGUAGE, "javascript");
    setPreferredLang(savedLang);
  }, []);

  // Save solved list to localStorage
  const toggleSolved = (id) => {
    setSolvedList((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setStorageJSON(PREF_KEYS.SOLVED_PROBLEMS, next);
      return next;
    });
  };

  // Toggle Behavioral Question Preparedness in localStorage
  const toggleBehavioralPrepared = (id) => {
    setBehavioralPrepared((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      setStorageJSON(PREF_KEYS.BEHAVIORAL_PREPARED, next);
      toast.success(next.includes(id) ? "Marked as rehearsed! ⭐" : "Removed from rehearsed list");
      return next;
    });
  };

  // Handlers that update state and persist preferences
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setStorageItem(PREF_KEYS.PREP_ACTIVE_TAB, tab);
  };

  const handleDifficultyChange = (diff) => {
    setSelectedDifficulty(diff);
    setStorageItem(PREF_KEYS.PREP_DIFF_FILTER, diff);
  };

  const handlePatternChange = (pat) => {
    setSelectedPattern(pat);
    setStorageItem(PREF_KEYS.PREP_PATTERN_FILTER, pat);
  };

  // Canonical ordering for patterns
  const CANONICAL_PATTERN_ORDER = [
    "Arrays & Hashing",
    "Two Pointers",
    "Sliding Window",
    "Stack",
    "Binary Search",
    "Linked List",
    "Trees",
    "Tries",
    "Heap & Priority Queue",
    "Dynamic Programming",
    "Graphs",
    "Matrix",
    "Intervals",
    "Bit Manipulation",
    "Backtracking",
    "Greedy",
  ];

  // Unique patterns list ordered logically
  const patternsList = [
    "ALL",
    ...CANONICAL_PATTERN_ORDER.filter((pat) =>
      CURATED_PROBLEMS.some((p) => p.pattern === pat)
    ),
  ];

  // Filter problems
  const filteredProblems = CURATED_PROBLEMS.filter((p) => {
    if (selectedPattern !== "ALL" && p.pattern !== selectedPattern) return false;
    if (selectedDifficulty !== "ALL" && p.difficulty !== selectedDifficulty) return false;
    if (statusFilter === "SOLVED" && !solvedList.includes(p.id)) return false;
    if (statusFilter === "UNSOLVED" && solvedList.includes(p.id)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        String(p.frontendId).includes(q) ||
        p.pattern.toLowerCase().includes(q) ||
        p.companies.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Quick Action: Launch Personal Solo Mock Interview Practice
  const handleStartSoloPractice = (problem) => {
    setSelectedPracticeProblem(problem);
    setLastPracticedProblem(problem);
    setStorageItem(PREF_KEYS.LAST_PROBLEM_ID, String(problem.id));
    toast.info(`Opened workspace for "${problem.title}" ⏱️`);
  };

  const handleCloseSoloPractice = () => {
    setSelectedPracticeProblem(null);
  };

  const solvedCount = solvedList.length;
  const progressPercent = Math.round((solvedCount / CURATED_PROBLEMS.length) * 100);

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${embedded ? "min-h-0" : ""}`}>
      {/* Top Navigation Bar (Hidden when embedded in Dashboard) */}
      {!embedded && (
        <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <Link
                href="/dashboard"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 text-xs shrink-0"
                title="Return to Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-5 w-[1px] bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h1 className="font-bold text-xs sm:text-base leading-tight flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    <span>Interview Preparation Hub</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                      Personal FAANG Kit
                    </span>
                  </h1>
                  <p className="text-[11px] text-slate-400 hidden sm:block">
                    Curated Blind 75, STAR Behavioral Mastery, System Design & Timed Mock Mode
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Live Practice Button */}
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Study Rooms</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Hero Strip & Readiness Stats */}
      <section className="bg-gradient-to-b from-indigo-950/30 via-slate-950 to-slate-950 border-b border-slate-800/80 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Left Headline */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3" />
                <span>Comprehensive Technical Interview Kit</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 tracking-tight">
                Master the Patterns. Ace the Interview.
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Interviewers at Google, Meta, and Amazon don't test memory — they test pattern recognition, trade-off communication, and edge case rigor.
              </p>
            </div>

            {/* Progress Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  Blind 75 Progress
                </span>
                <span className="font-mono text-indigo-400 font-bold">
                  {solvedCount} / {CURATED_PROBLEMS.length} ({progressPercent}%)
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                Check off solved questions to track your interview readiness.
              </p>
            </div>

            {/* Quick Mock Card */}
            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Timer className="w-4 h-4 text-indigo-400" />
                  <span>Timed Solo Mock Mode</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Practice personal 45-minute FAANG clock with Monaco editor & AI hints.
                </div>
              </div>
              <button
                onClick={() =>
                  handleStartSoloPractice(lastPracticedProblem || CURATED_PROBLEMS[0])
                }
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition"
              >
                <Play className="w-3.5 h-3.5" />
                <span>
                  {lastPracticedProblem
                    ? `Resume #${lastPracticedProblem.frontendId} ${lastPracticedProblem.title}`
                    : "Start Two Sum Mock"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dedicated LeetCode-Grade Focused Mock Practice Workspace */}
      {selectedPracticeProblem && (
        <MockPracticeWorkspace
          problem={selectedPracticeProblem}
          allProblems={CURATED_PROBLEMS}
          solvedList={solvedList}
          onToggleSolved={toggleSolved}
          onSelectProblem={(prob) => {
            setSelectedPracticeProblem(prob);
            setLastPracticedProblem(prob);
            setStorageItem(PREF_KEYS.LAST_PROBLEM_ID, String(prob.id));
          }}
          onClose={handleCloseSoloPractice}
          onProblemSolved={(probId) => {
            if (!solvedList.includes(probId)) {
              toggleSolved(probId);
            }
          }}
        />
      )}

      {/* Navigation Tabs */}
      <div className={`border-b border-slate-800 bg-slate-900/60 sticky ${embedded ? "top-0" : "top-[57px]"} z-20 backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1.5 sm:gap-2 overflow-x-auto custom-scrollbar py-2.5">
          <button
            onClick={() => handleTabChange("dsa")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === "dsa"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Blind 75 Problems ({CURATED_PROBLEMS.length})</span>
          </button>

          <button
            onClick={() => handleTabChange("behavioral")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === "behavioral"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>STAR Behavioral Mastery</span>
          </button>

          <button
            onClick={() => handleTabChange("sysdesign")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === "sysdesign"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>System Design Primer</span>
          </button>

          <button
            onClick={() => handleTabChange("rubric")}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
              activeTab === "rubric"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>FAANG 45m Rubric</span>
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full">
        {/* ==================================================== */}
        {/* TAB 1: DSA CODING PATTERNS & HIGH-FREQUENCY PROBLEMS */}
        {/* ==================================================== */}
        {activeTab === "dsa" && (
          <div className="space-y-6">
            {/* Filter & Search Bar - Fully Responsive, Clean Wrapped Topic Pills, Zero Overflow */}
            <div className="bg-slate-900/70 border border-slate-800 p-3.5 sm:p-4 rounded-2xl space-y-3.5 shadow-sm">
              {/* Row 1: Search + Quick Dropdowns + Reset */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search problem, company, or #id..."
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-500 hover:text-slate-300 transition"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdowns Group */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  {/* Pattern Dropdown */}
                  <div className="min-w-[130px] flex-1 sm:flex-none">
                    <select
                      value={selectedPattern}
                      onChange={(e) => handlePatternChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                      title="Filter by Topic / Pattern"
                    >
                      <option value="ALL">All Topics ({CURATED_PROBLEMS.length})</option>
                      {patternsList.filter((p) => p !== "ALL").map((pat) => (
                        <option key={pat} value={pat}>
                          {pat} ({CURATED_PROBLEMS.filter((p) => p.pattern === pat).length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty Dropdown */}
                  <div className="min-w-[120px] flex-1 sm:flex-none">
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => handleDifficultyChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">All Difficulties</option>
                      <option value="Easy">Easy ({CURATED_PROBLEMS.filter((p) => p.difficulty === "Easy").length})</option>
                      <option value="Medium">Medium ({CURATED_PROBLEMS.filter((p) => p.difficulty === "Medium").length})</option>
                      <option value="Hard">Hard ({CURATED_PROBLEMS.filter((p) => p.difficulty === "Hard").length})</option>
                    </select>
                  </div>

                  {/* Status Dropdown */}
                  <div className="min-w-[110px] flex-1 sm:flex-none">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="SOLVED">Solved ({solvedCount})</option>
                      <option value="UNSOLVED">Unsolved ({CURATED_PROBLEMS.length - solvedCount})</option>
                    </select>
                  </div>

                  {/* Reset Filters */}
                  {(selectedPattern !== "ALL" || selectedDifficulty !== "ALL" || statusFilter !== "ALL" || searchQuery.trim()) && (
                    <button
                      onClick={() => {
                        handlePatternChange("ALL");
                        handleDifficultyChange("ALL");
                        setStatusFilter("ALL");
                        setSearchQuery("");
                      }}
                      className="px-2.5 py-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium whitespace-nowrap transition bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl"
                      title="Reset all filters"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Row 2: Wrapped Topic / Pattern Filter Pills (Never overflows) */}
              <div className="pt-2.5 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Filter className="w-3 h-3 text-indigo-400" />
                    <span>Filter by Topic / Pattern:</span>
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Showing {filteredProblems.length} of {CURATED_PROBLEMS.length}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 w-full">
                  {patternsList.map((pat) => {
                    const count =
                      pat === "ALL"
                        ? CURATED_PROBLEMS.length
                        : CURATED_PROBLEMS.filter((p) => p.pattern === pat).length;
                    const isSelected = selectedPattern === pat;
                    return (
                      <button
                        key={pat}
                        onClick={() => handlePatternChange(pat)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition border ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                            : "bg-slate-950/70 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                        }`}
                      >
                        <span>{pat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected
                              ? "bg-indigo-700 text-indigo-100"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Problems List Grid */}
            <div className="space-y-3">
              {filteredProblems.map((prob) => {
                const isExpanded = expandedProblemId === prob.id;
                const isSolved = solvedList.includes(prob.id);

                return (
                  <div
                    key={prob.id}
                    className={`rounded-2xl border transition-all ${
                      isSolved
                        ? "bg-slate-900/50 border-emerald-500/30"
                        : "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-start sm:items-center gap-3">
                        {/* Solved Checkbox */}
                        <button
                          onClick={() => toggleSolved(prob.id)}
                          className="mt-0.5 sm:mt-0 p-1 text-slate-400 hover:text-emerald-400 transition"
                          title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                        >
                          {isSolved ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-semibold text-slate-400">
                              #{prob.frontendId}
                            </span>
                            <span
                              className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition cursor-pointer"
                              onClick={() => handleStartSoloPractice(prob)}
                              title="Open in LeetCode-style workspace"
                            >
                              {prob.title}
                            </span>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                              {prob.pattern}
                            </span>
                          </div>

                          {/* Company Tags */}
                          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-500">Seen at:</span>
                            {prob.companies.map((comp) => (
                              <span
                                key={comp}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono"
                              >
                                {comp}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Action Buttons */}
                      <div className="flex items-center gap-2 ml-8 sm:ml-0">
                        <button
                          onClick={() => handleStartSoloPractice(prob)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                          title="Practice this problem in personal solo mock workspace"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Practice Solo</span>
                        </button>

                        <a
                          href={`https://leetcode.com/problems/${prob.titleSlug}/`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                          title="Open on LeetCode"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        <button
                          onClick={() => setExpandedProblemId(isExpanded ? null : prob.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                          title="View Intuition & Solution Blueprint"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-indigo-400" : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Intuition & Big-O Accordion */}
                    {isExpanded && (
                      <div className="border-t border-slate-800/80 p-4 bg-slate-950/60 rounded-b-2xl space-y-3.5 text-xs animate-in fade-in">
                        {/* Optimal Approach & Pitfalls (Hidden by default in mock questions until user clicks to reveal) */}
                        {revealedApproachIds.includes(prob.id) ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                                Solution Blueprint (Revealed)
                              </span>
                              <button
                                onClick={() =>
                                  setRevealedApproachIds((prev) => prev.filter((id) => id !== prob.id))
                                }
                                className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 transition"
                              >
                                <EyeOff className="w-3 h-3" />
                                <span>Hide</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                                <div className="font-semibold text-indigo-400 flex items-center gap-1.5">
                                  <Lightbulb className="w-3.5 h-3.5" />
                                  Optimal Intuition & Strategy
                                </div>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                  {prob.intuition}
                                </p>
                              </div>

                              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                                <div className="font-semibold text-amber-400 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  Pitfalls & Critical Edge Cases
                                </div>
                                <p className="text-slate-300 leading-relaxed text-[11px]">
                                  {prob.pitfalls}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-slate-500" />
                              <div>
                                <div className="font-semibold text-slate-300 text-xs">
                                  Optimal Approach & Traps
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  Hidden by default so you can solve organically first without spoilers.
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                setRevealedApproachIds((prev) => [...prev, prob.id])
                              }
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700/80 transition shrink-0"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Reveal Approach</span>
                            </button>
                          </div>
                        )}

                        {/* Complexity Badges */}
                        <div className="flex items-center gap-4 text-xs pt-1 border-t border-slate-800/60">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Target Time:</span>
                            <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                              {prob.timeComp}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-medium">Target Space:</span>
                            <span className="font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
                              {prob.spaceComp}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: STAR BEHAVIORAL MASTERY                       */}
        {/* ==================================================== */}
        {activeTab === "behavioral" && (
          <div className="space-y-8">
            {/* The STAR Method Explainer */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/30 space-y-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-base">
                <Sparkles className="w-5 h-5" />
                <span>The STAR Method Blueprint (Situation, Task, Action, Result)</span>
              </div>
              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                At Google, Meta, and Amazon, behavioral questions make up 30-50% of the hiring loop. Every story should allocate <strong className="text-white">15% to Situation</strong>, <strong className="text-white">10% to Task</strong>, <strong className="text-white">60% to your specific Actions</strong>, and <strong className="text-white">15% to quantified Results</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-indigo-400 font-bold font-mono text-xs">S - Situation</span>
                  <p className="text-[11px] text-slate-400">Context, team, business stakes, and timeline.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-indigo-400 font-bold font-mono text-xs">T - Task</span>
                  <p className="text-[11px] text-slate-400">The specific challenge you personally owned.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-emerald-400 font-bold font-mono text-xs">A - Action (Key!)</span>
                  <p className="text-[11px] text-slate-400">What YOU did: design, code, triage, convince, test.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-amber-400 font-bold font-mono text-xs">R - Result</span>
                  <p className="text-[11px] text-slate-400">Quantified metrics: latency cut, uptime, customer impact.</p>
                </div>
              </div>
            </div>

            {/* High Stakes Behavioral Questions */}
            <div className="space-y-4">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Top FAANG Behavioral Questions with Winning Answer Formulas</span>
              </h3>

              <div className="space-y-4">
                {BEHAVIORAL_QUESTIONS.map((bq, idx) => (
                  <div key={bq.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <h4 className="font-bold text-sm text-slate-100">"{bq.question}"</h4>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <button
                          onClick={() => toggleBehavioralPrepared(bq.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition ${
                            behavioralPrepared.includes(bq.id)
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700/60 hover:text-slate-200"
                          }`}
                          title={behavioralPrepared.includes(bq.id) ? "Marked as Rehearsed" : "Mark as Rehearsed"}
                        >
                          {behavioralPrepared.includes(bq.id) ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5" />
                          )}
                          <span>{behavioralPrepared.includes(bq.id) ? "Rehearsed" : "Mark Rehearsed"}</span>
                        </button>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold">
                          {bq.competency}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400">
                      <strong className="text-slate-300">Why Interviewers Ask This: </strong>
                      {bq.why}
                    </div>

                    {/* STAR Breakdown Box */}
                    <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                      <div className="font-semibold text-slate-200">STAR Response Blueprint:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
                        <div>
                          <strong className="text-indigo-400">Situation: </strong>
                          {bq.starBlueprint.situation}
                        </div>
                        <div>
                          <strong className="text-indigo-400">Task: </strong>
                          {bq.starBlueprint.task}
                        </div>
                        <div>
                          <strong className="text-emerald-400">Action: </strong>
                          {bq.starBlueprint.action}
                        </div>
                        <div>
                          <strong className="text-amber-400">Result: </strong>
                          {bq.starBlueprint.result}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pro-Tip: </strong> {bq.topTip}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: SYSTEM DESIGN PRIMER                          */}
        {/* ==================================================== */}
        {activeTab === "sysdesign" && <SystemDesignPrimer />}

        {/* ==================================================== */}
        {/* TAB 4: FAANG 45-MINUTE RUBRIC & TIMELINE             */}
        {/* ==================================================== */}
        {activeTab === "rubric" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                <Compass className="w-5 h-5" />
                <span>The 45-Minute Technical Interview Breakdown</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                How successful candidates allocate time during a live coding screen:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-indigo-400 font-bold text-xs">0 - 5 min</span>
                  <div className="font-semibold text-slate-200 text-xs">Introductions</div>
                  <p className="text-[11px] text-slate-400">Brief background and ice-breaker.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-emerald-400 font-bold text-xs">5 - 12 min</span>
                  <div className="font-semibold text-slate-200 text-xs">Clarify & Examples</div>
                  <p className="text-[11px] text-slate-400">Confirm constraints, input types, edge cases.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-amber-400 font-bold text-xs">12 - 28 min</span>
                  <div className="font-semibold text-slate-200 text-xs">Optimal Code</div>
                  <p className="text-[11px] text-slate-400">Clean modular implementation while speaking aloud.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-rose-400 font-bold text-xs">28 - 38 min</span>
                  <div className="font-semibold text-slate-200 text-xs">Test & Complexity</div>
                  <p className="text-[11px] text-slate-400">Dry-run with sample inputs; derive Big-O.</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-purple-400 font-bold text-xs">38 - 45 min</span>
                  <div className="font-semibold text-slate-200 text-xs">Your Questions</div>
                  <p className="text-[11px] text-slate-400">Ask insightful questions about team & tech stack.</p>
                </div>
              </div>
            </div>

            {/* Rubric Criteria Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sm text-emerald-400">1. Problem Solving (25%)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Did the candidate identify the core algorithm without excessive hints? Did they analyze trade-offs between brute force and optimal solutions?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sm text-cyan-400">2. Code Quality & Modularity (25%)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Is the code readable with clear variable naming? Are boundary conditions cleanly structured rather than messy nested conditionals?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sm text-amber-400">3. Communication & Collaboration (25%)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Did the candidate "think aloud"? When the interviewer provided guidance, did they incorporate it receptive and thoughtfully?
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5">
                <h4 className="font-bold text-sm text-rose-400">4. Verification & Testing Rigor (25%)</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Did the candidate dry run with empty, single-element, and duplicate inputs before being prompted? Did they state accurate Time & Space Big-O?
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
