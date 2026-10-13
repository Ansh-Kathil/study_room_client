"use client";

import { useState, useEffect, useRef } from "react";
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
  ChevronRight,
  Code2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiRequest } from "@/lib/api";
import { fireAcceptedConfetti } from "@/lib/confetti";
import { playNotificationSound } from "@/lib/sound";
import { toast } from "sonner";
import { getProblemStarterSnippet, getDefaultStarterTemplate } from "@/data/interviewPrepData";

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "cpp", label: "C++", monaco: "cpp" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "typescript", label: "TypeScript", monaco: "typescript" },
];

const TIMER_PRESETS = [
  { label: "15 min", seconds: 15 * 60 },
  { label: "30 min", seconds: 30 * 60 },
  { label: "45 min", seconds: 45 * 60, default: true },
  { label: "60 min", seconds: 60 * 60 },
];

export default function MockPracticeWorkspace({
  problem,
  onClose,
  onProblemSolved,
}) {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(() => getProblemStarterSnippet(problem, "javascript"));
  const [testcases, setTestcases] = useState(() => {
    if (problem?.exampleTestcases?.length) return problem.exampleTestcases;
    if (problem?.sampleTestCase) return [problem.sampleTestCase];
    return [""];
  });
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [customInput, setCustomInput] = useState("");
  const [useCustomInput, setUseCustomInput] = useState(false);

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [activeResultIndex, setActiveResultIndex] = useState(0);

  // Timer state (personal solo timer, 45 min default)
  const [timerSeconds, setTimerSeconds] = useState(45 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("45 min");
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

  // Optimal Approach / Strategy hidden by default in mock mode
  const [showOptimalApproach, setShowOptimalApproach] = useState(false);

  // Fetch full details if titleSlug exists
  useEffect(() => {
    let isMounted = true;
    if (problem?.titleSlug) {
      setLoadingDetails(true);
      apiRequest(`/leetcode/${problem.titleSlug}`)
        .then((data) => {
          if (!isMounted) return;
          const prob = data.problem;
          setFullProblem(prob);
          if (prob?.exampleTestcaseList?.length > 0) {
            setTestcases(prob.exampleTestcaseList);
          }
          // If snippets exist on LeetCode API, update starter code
          if (prob?.codeSnippets?.length > 0) {
            const starter = getProblemStarterSnippet(prob, language);
            setCode(starter);
          }
        })
        .catch(() => {
          // If offline or search failed, fallback to local curated problem
        })
        .finally(() => {
          if (isMounted) setLoadingDetails(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [problem?.titleSlug]);

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

  // Language Change Handler - seamlessly updates syntax mode and template
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const activeData = fullProblem || problem;
    const newSnippet = getProblemStarterSnippet(activeData, newLang);
    setCode(newSnippet);
    toast.info(`Switched language to ${SUPPORTED_LANGUAGES.find((l) => l.id === newLang)?.label || newLang}`);
  };

  // Run Code against the Compiler endpoint (independent solo execution)
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error("Please write code before running.");
      return;
    }

    setIsRunning(true);
    setExecutionResult(null);

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
        if (onProblemSolved && problem?.id) {
          onProblemSolved(problem.id);
        }

        // Also record personal submission
        try {
          await apiRequest("/submissions", {
            method: "POST",
            body: JSON.stringify({
              problemFrontendId: problem?.frontendId ? String(problem.frontendId) : "",
              problemTitle: problem?.title || "Mock Practice Problem",
              problemTitleSlug: problem?.titleSlug || "",
              difficulty: problem?.difficulty || "Custom",
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
          // ignore background save failure
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

  // AI Hint Generator (Gemini Flash)
  const handleAskAIHint = async () => {
    setAiLoading(true);
    try {
      const res = await apiRequest("/ai/hint", {
        method: "POST",
        body: JSON.stringify({
          problemTitle: problem?.title || "Coding Problem",
          problemDescription: fullProblem?.content || problem?.intuition || "",
          currentCode: code,
          language,
          hintLevel,
        }),
      });

      setAiHint(res.hint || "Review your two pointers or edge boundary conditions.");
      setHintLevel((prev) => Math.min(prev + 1, 3));
      toast.success(`Level ${hintLevel} hint generated! 💡`);
    } catch (err) {
      // Fallback hint based on curated intuition
      setAiHint(problem?.intuition || "Consider using a Hash Map or Two Pointers to achieve optimal Big-O.");
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
    const starter = getProblemStarterSnippet(fullProblem || problem, language);
    setCode(starter);
    toast.info("Editor reset to starter template");
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[820px] transition-all">
      {/* Solo Practice Header (Strictly personal — NO room codes, NO calls, NO peer mesh) */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            ← Back to Hub
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-400">
                #{problem?.frontendId || 1}
              </span>
              <h3 className="font-bold text-sm text-slate-100">{problem?.title}</h3>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                  problem?.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : problem?.difficulty === "Medium"
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}
              >
                {problem?.difficulty}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                {problem?.pattern}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                Solo Practice
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Language Changer, Personal Countdown Timer & Run Button */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-2.5 py-1">
            <span className="text-[11px] text-slate-400 font-medium">Language:</span>
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

          {/* Personal Mock Timer */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1">
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
              {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600/15 hover:bg-purple-600/25 border border-purple-500/30 text-purple-300 rounded-xl text-xs font-semibold transition"
            title="Ask AI Coach for Socratic Hint"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{aiLoading ? "Thinking..." : "AI Hint"}</span>
          </button>

          {/* Run & Verify Code Button */}
          <button
            onClick={handleRunCode}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>{isRunning ? "Running..." : "Run & Test"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left Problem Statement & Intuition, Right Monaco Editor & Testcases */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Problem Statement & Blueprint (5 Cols) */}
        <div className="lg:col-span-5 border-r border-slate-800 bg-slate-950/40 p-5 overflow-y-auto custom-scrollbar flex flex-col space-y-4">
          {/* Target Big-O Complexity Badges */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Target Time:</span>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
              {problem?.timeComp || "O(N)"}
            </span>
            <span className="text-xs text-slate-400 font-medium">Target Space:</span>
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-lg">
              {problem?.spaceComp || "O(1)"}
            </span>
          </div>

          {/* Problem Description HTML or Fallback */}
          {fullProblem?.content ? (
            <div
              className="prose prose-invert prose-xs max-w-none text-slate-300 space-y-2 text-xs leading-relaxed"
              dangerouslySetInnerHTML={{ __html: fullProblem.content }}
            />
          ) : (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Interview Problem Overview
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Given the constraints of <strong>{problem?.title}</strong>, design an optimal solution adhering strictly to <strong>{problem?.pattern}</strong> patterns.
              </p>
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

          {/* Intuition & Pitfalls - Hidden by default in Mock Mode until candidate explicitly requests to reveal */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/90 overflow-hidden">
            <button
              onClick={() => setShowOptimalApproach(!showOptimalApproach)}
              className="w-full p-3.5 flex items-center justify-between gap-2 hover:bg-slate-800/60 transition text-left"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className={`w-4 h-4 ${showOptimalApproach ? "text-amber-400" : "text-slate-400"}`} />
                <span className="text-xs font-bold text-slate-200">
                  {showOptimalApproach ? "Optimal Approach & Traps (Revealed)" : "Optimal Approach & Strategy"}
                </span>
                {!showOptimalApproach && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono border border-slate-700/60">
                    Hidden for Mock
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                {showOptimalApproach ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-400">Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[11px] text-indigo-300">Reveal</span>
                  </>
                )}
              </div>
            </button>

            {showOptimalApproach && (
              <div className="border-t border-slate-800 p-3.5 space-y-3 bg-slate-950/70 animate-in fade-in">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                    <Lightbulb className="w-3 h-3 text-amber-400" />
                    <span>Optimal Strategy & Trade-offs</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l border-amber-500/30">
                    {problem?.intuition}
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="text-[11px] font-bold text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    <span>Common Traps & Edge Cases</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l border-rose-500/30">
                    {problem?.pitfalls}
                  </p>
                </div>
              </div>
            )}
          </div>

          {problem?.titleSlug && (
            <a
              href={`https://leetcode.com/problems/${problem.titleSlug}/`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition pt-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open #{problem.frontendId} on LeetCode</span>
            </a>
          )}
        </div>

        {/* Right Column: Monaco Code Editor & Compiler Output (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-slate-950">
          {/* Editor Sub-toolbar */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
            <span className="font-mono text-slate-400 text-[11px] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Solution Editor ({SUPPORTED_LANGUAGES.find((l) => l.id === language)?.label})</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="p-1 text-slate-400 hover:text-white transition rounded"
                title="Copy Solution Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleResetStarter}
                className="p-1 text-slate-400 hover:text-white transition rounded"
                title="Reset to Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-[350px]">
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
          <div className="h-64 border-t border-slate-800 bg-slate-900/80 flex flex-col shrink-0">
            {/* Console Tabs */}
            <div className="px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-300">Test Cases</span>
                {testcases.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setUseCustomInput(false);
                      setActiveCaseIndex(idx);
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
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
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                    useCustomInput
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Custom
                </button>
              </div>

              {executionResult && (
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                  {executionResult.success ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Passed ({executionResult.totalCount || 1}/{executionResult.totalCount || 1})
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      Failed
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Testcase Input & Output Content */}
            <div className="p-3 flex-1 overflow-y-auto font-mono text-xs space-y-2">
              {useCustomInput ? (
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">Custom Input:</div>
                  <textarea
                    rows={2}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter arguments, e.g. [2,7,11,15]\n9"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                  />
                </div>
              ) : (
                <div>
                  <div className="text-[11px] text-slate-400 mb-1">
                    Input (Case {activeCaseIndex + 1}):
                  </div>
                  <pre className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-200 overflow-x-auto text-xs">
                    {testcases[activeCaseIndex] || "(empty input)"}
                  </pre>
                </div>
              )}

              {/* Output Result */}
              {executionResult && (
                <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                  <div className="text-[11px] text-slate-400">Execution Result:</div>
                  {executionResult.runs?.[activeResultIndex] ? (
                    <div className="space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Status:</span>
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
                          <pre className="text-emerald-300 text-xs">
                            {executionResult.runs[activeResultIndex].stdout}
                          </pre>
                        </div>
                      )}
                      {executionResult.runs[activeResultIndex].stderr && (
                        <div>
                          <span className="text-rose-400 text-[10px]">Error:</span>
                          <pre className="text-rose-300 text-xs">
                            {executionResult.runs[activeResultIndex].stderr}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <pre className="bg-slate-950 p-2 rounded-lg border border-slate-800 text-slate-300 text-xs">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
