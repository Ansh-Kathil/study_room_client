"use client";

import { useState, useEffect } from "react";
import {
  Cpu,
  Server,
  Layers,
  Clock,
  Binary,
  Calculator,
  ChevronRight,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Circle,
  Sparkles,
  Activity,
  Search,
  Printer,
  SlidersHorizontal,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  LATENCY_NUMBERS,
  POWERS_OF_TWO,
  ESTIMATION_CHEAT_SHEET,
  SYSTEM_DESIGN_MODULES,
  SYSTEM_DESIGN_CASE_STUDIES,
} from "@/data/systemDesignData";

export default function SystemDesignPrimer() {
  const [subTab, setSubTab] = useState("core"); // 'core' | 'cases' | 'numbers'
  const [selectedModuleId, setSelectedModuleId] = useState("framework");
  const [selectedCaseId, setSelectedCaseId] = useState("pastebin-url-shortener");
  const [searchQuery, setSearchQuery] = useState("");
  const [caseDifficultyFilter, setCaseDifficultyFilter] = useState("ALL");
  const [completedItems, setCompletedItems] = useState([]);

  // Load user progress tracking from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("system_design_completed");
      if (saved) {
        setCompletedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Toggle item as completed/learned
  const toggleCompleted = (id, title) => {
    setCompletedItems((prev) => {
      const isAlready = prev.includes(id);
      const next = isAlready ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem("system_design_completed", JSON.stringify(next));
      } catch (e) {}

      if (!isAlready) {
        toast.success(`Marked "${title}" as mastered! 🎯`);
      } else {
        toast.info(`Unmarked "${title}"`);
      }
      return next;
    });
  };

  // Filter Modules by search query
  const filteredModules = SYSTEM_DESIGN_MODULES.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.badge.toLowerCase().includes(q) ||
      m.summary.toLowerCase().includes(q) ||
      m.sections.some(
        (s) =>
          s.heading.toLowerCase().includes(q) ||
          s.details.some((d) => d.toLowerCase().includes(q))
      )
    );
  });

  // Filter Cases by difficulty and search query
  const filteredCases = SYSTEM_DESIGN_CASE_STUDIES.filter((c) => {
    if (caseDifficultyFilter !== "ALL" && c.difficulty !== caseDifficultyFilter) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.summary.toLowerCase().includes(q) ||
      c.companies.some((comp) => comp.toLowerCase().includes(q)) ||
      c.architecture.step1.toLowerCase().includes(q) ||
      c.architecture.step3.toLowerCase().includes(q)
    );
  });

  // Filter latency table
  const filteredLatency = LATENCY_NUMBERS.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.event.toLowerCase().includes(q) ||
      row.time.toLowerCase().includes(q) ||
      row.comparison.toLowerCase().includes(q)
    );
  });

  const activeModule =
    SYSTEM_DESIGN_MODULES.find((m) => m.id === selectedModuleId) || filteredModules[0] || SYSTEM_DESIGN_MODULES[0];

  const activeCase =
    SYSTEM_DESIGN_CASE_STUDIES.find((c) => c.id === selectedCaseId) || filteredCases[0] || SYSTEM_DESIGN_CASE_STUDIES[0];

  // Print/Export Cheat Sheet to PDF
  const handlePrintCheatSheet = () => {
    toast.info("Opening print dialog. Select 'Save as PDF' to download your Cheat Sheet.");
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const totalMasterableItems = SYSTEM_DESIGN_MODULES.length + SYSTEM_DESIGN_CASE_STUDIES.length;
  const progressPercent = Math.round((completedItems.length / totalMasterableItems) * 100);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/40 border border-cyan-500/30 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>System Design Primer (Inspired by donnemartin)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              One-Stop Architectural Mastery
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Master distributed scaling from first principles: CAP Theorem, Multi-Tier Caching, Sharding, Message Brokers, Latency numbers every engineer must know, and iconic FAANG case studies.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Download/Print Cheat-Sheet */}
            <button
              onClick={handlePrintCheatSheet}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition shadow-sm"
              title="Print or Save Cheat-Sheet as PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Export PDF</span>
            </button>

            {/* Original Repo Link */}
            <a
              href="https://github.com/donnemartin/system-design-primer"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Original Repo</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        {/* Learning Progress Indicator */}
        <div className="mt-5 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-200">
                System Design Progress: <span className="text-cyan-400">{completedItems.length}</span> / {totalMasterableItems} Topics Mastered
              </div>
              <div className="text-[11px] text-slate-400">
                Click the checkmark on any module or case study to track your mastery.
              </div>
            </div>
          </div>

          <div className="w-full sm:w-60 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 w-10 text-right">
              {progressPercent}%
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search all modules, case studies, or latency terms (e.g. CAP, Redis, Kafka, Uber, Sharding, L1)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition shadow-inner"
          />
        </div>

        {/* Sub-nav switcher inside System Design */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/80 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setSubTab("core")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              subTab === "core"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Core Architectural Concepts ({SYSTEM_DESIGN_MODULES.length})</span>
          </button>

          <button
            onClick={() => setSubTab("cases")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              subTab === "cases"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Iconic Case Studies ({SYSTEM_DESIGN_CASE_STUDIES.length})</span>
          </button>

          <button
            onClick={() => setSubTab("numbers")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              subTab === "numbers"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/25"
                : "bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Latency Numbers & Capacity Math</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: CORE ARCHITECTURAL CONCEPTS                                    */}
      {/* ========================================================================= */}
      {subTab === "core" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Topics Navigation */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[11px] font-mono uppercase text-slate-400 font-bold px-1 mb-1">
              Modules ({filteredModules.length})
            </div>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredModules.map((mod) => {
                const isSelected = mod.id === activeModule?.id;
                const isMastered = completedItems.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          document.getElementById("module-content-display")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex-1 text-left space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-bold border ${
                            isSelected
                              ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {mod.badge}
                        </span>
                      </div>
                      <div
                        className={`text-xs font-bold leading-snug ${
                          isSelected ? "text-slate-100" : "text-slate-300"
                        }`}
                      >
                        {mod.title}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">
                        {mod.summary}
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompleted(mod.id, mod.title);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition shrink-0"
                      title={isMastered ? "Mark as uncompleted" : "Mark as mastered"}
                    >
                      {isMastered ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Deep-Dive Content Display */}
          <div id="module-content-display" className="lg:col-span-8 space-y-4 scroll-mt-20">
            {activeModule && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[11px] font-mono uppercase font-bold px-2.5 py-1 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                      {activeModule.badge}
                    </span>
                    <h3 className="text-lg sm:text-xl font-extrabold text-slate-100 mt-2">
                      {activeModule.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">{activeModule.summary}</p>
                  </div>

                  <button
                    onClick={() => toggleCompleted(activeModule.id, activeModule.title)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      completedItems.includes(activeModule.id)
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedItems.includes(activeModule.id) ? "Mastered" : "Mark as Mastered"}
                    </span>
                  </button>
                </div>

                {/* Sections Cards */}
                <div className="space-y-4">
                  {activeModule.sections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <h4 className="font-bold text-sm text-slate-100">{sec.heading}</h4>
                      </div>

                      <ul className="space-y-2 pt-1">
                        {sec.details.map((item, dIdx) => (
                          <li
                            key={dIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed"
                          >
                            <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Pro-Tip Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 font-semibold">FAANG Interviewer Tip: </strong>
                    Always voice trade-offs before naming technologies. Saying{" "}
                    <em>"We choose Redis because we need sub-millisecond atomic decrement for our token bucket counter"</em>{" "}
                    scores much higher than just saying <em>"We will use Redis here."</em>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: ICONIC CASE STUDIES                                            */}
      {/* ========================================================================= */}
      {subTab === "cases" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Case Studies Selector */}
          <div className="lg:col-span-4 space-y-3">
            {/* Difficulty Filter Chips */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-mono px-2 text-slate-500 font-bold flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" /> Filter:
              </span>
              {["ALL", "Medium", "Hard"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setCaseDifficultyFilter(lvl)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex-1 ${
                    caseDifficultyFilter === lvl
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredCases.map((c) => {
                const isSelected = c.id === activeCase?.id;
                const isMastered = completedItems.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`w-full text-left p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-slate-900 border-indigo-500/60 shadow-lg shadow-indigo-950/40"
                        : "bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/70 hover:border-slate-700"
                    }`}
                  >
                    <button
                      onClick={() => {
                        setSelectedCaseId(c.id);
                        if (typeof window !== "undefined" && window.innerWidth < 1024) {
                          document.getElementById("case-content-display")?.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className="flex-1 text-left space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                            c.difficulty === "Hard"
                              ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {c.difficulty}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {c.scale.split(",")[0]}
                        </span>
                      </div>

                      <div
                        className={`text-xs font-bold leading-snug ${
                          isSelected ? "text-slate-100" : "text-slate-300"
                        }`}
                      >
                        {c.title}
                      </div>

                      <div className="flex flex-wrap gap-1 pt-1">
                        {c.companies.map((comp) => (
                          <span
                            key={comp}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 font-mono"
                          >
                            {comp}
                          </span>
                        ))}
                      </div>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCompleted(c.id, c.title);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition shrink-0"
                      title={isMastered ? "Mark as uncompleted" : "Mark as mastered"}
                    >
                      {isMastered ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Case Study Detailed Breakdown */}
          <div id="case-content-display" className="lg:col-span-8 space-y-4 scroll-mt-20">
            {activeCase && (
              <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                          activeCase.difficulty === "Hard"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {activeCase.difficulty}
                      </span>
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        Scale: {activeCase.scale}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-slate-100">{activeCase.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{activeCase.summary}</p>
                  </div>

                  <button
                    onClick={() => toggleCompleted(activeCase.id, activeCase.title)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                      completedItems.includes(activeCase.id)
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-slate-800 border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {completedItems.includes(activeCase.id) ? "Mastered" : "Mark as Mastered"}
                    </span>
                  </button>
                </div>

                {/* Data Flow Diagram Card */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-indigo-400" />
                    <span>High-Level Architecture Pipeline</span>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs font-mono text-indigo-300 break-all leading-relaxed">
                    {activeCase.keyDiagram}
                  </div>
                </div>

                {/* 4-Step Breakdown for the Case */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        1
                      </span>
                      <span>Scoping & Requirements</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeCase.architecture.step1}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        2
                      </span>
                      <span>Back-of-Envelope & Storage</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeCase.architecture.step2}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        3
                      </span>
                      <span>Core Engineering Mechanism</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeCase.architecture.step3}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
                    <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-mono font-bold">
                        4
                      </span>
                      <span>Scaling Bottlenecks & Caching</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeCase.architecture.step4}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: LATENCY NUMBERS & CAPACITY ESTIMATION MATH                     */}
      {/* ========================================================================= */}
      {subTab === "numbers" && (
        <div className="space-y-6">
          {/* Latency Table */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Latency Numbers Every Programmer Should Know (Jeff Dean)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Scale of reference: If 1 L1 cache reference is 1 human heart beat, a cross-Atlantic network call is equivalent to 19 years!
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-slate-400">
                1s = 1,000ms = 1,000,000µs = 10^9ns
              </span>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px] font-mono">
                    <th className="py-2.5 px-3">Operation / Hardware Event</th>
                    <th className="py-2.5 px-3">Actual Latency</th>
                    <th className="py-2.5 px-3">Human Scale Analogy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLatency.map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-800/40 transition group"
                    >
                      <td className="py-2.5 px-3 font-medium text-slate-200">
                        {row.event}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">
                        {row.time}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {row.comparison}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Mental Math Cheatsheet */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Powers of Two Table */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Binary className="w-4 h-4 text-indigo-400" />
                <span>Powers of Two for Capacity Math</span>
              </h4>
              <div className="space-y-2">
                {POWERS_OF_TWO.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs font-mono"
                  >
                    <span className="font-bold text-indigo-400">{p.power}</span>
                    <span className="text-slate-400">{p.exact}</span>
                    <span className="text-slate-200 font-semibold">{p.approx}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Back-of-Envelope Formulas */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Fast Back-of-Envelope Rules of Thumb</span>
              </h4>
              <div className="space-y-2.5">
                {ESTIMATION_CHEAT_SHEET.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-400">{rule.metric}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {rule.formula}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">{rule.ruleOfThumb}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
