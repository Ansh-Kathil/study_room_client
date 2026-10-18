"use client";

import { useState } from "react";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  ArrowRight,
  RotateCcw,
  X,
  Share2,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  MessageSquare,
  Compass,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

export default function InterviewReportView({ interview, onClose, onRetake }) {
  const [copied, setCopied] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState([0]); // Expand first model answer by default

  const report = interview?.report || {};
  const overallScore = report.overallScore || 0;
  const verdict = report.verdict || "Completed";

  const getVerdictStyle = (v) => {
    switch (v) {
      case "Strong Hire":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case "Hire":
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/30";
      case "Lean Hire":
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      default:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    }
  };

  const getScoreColor = (s) => {
    if (s >= 85) return "text-emerald-400";
    if (s >= 70) return "text-indigo-400";
    if (s >= 55) return "text-amber-400";
    return "text-rose-400";
  };

  const handleCopyReport = () => {
    const text = [
      `# 🏆 Mock Interview Report: ${interview.title}`,
      `**Topic:** ${interview.topic} | **Level:** ${interview.difficulty}`,
      `**Score:** ${overallScore}/100 | **Verdict:** ${verdict}`,
      "",
      `## 📝 Summary`,
      report.summary || "N/A",
      "",
      `## 🌟 Strengths`,
      ...(report.strengths || []).map((s) => `- ${s}`),
      "",
      `## ⚠️ Areas for Improvement`,
      ...(report.areasForImprovement || []).map((a) => `- ${a}`),
      "",
      `## 📚 Recommended Topics`,
      ...(report.recommendedTopics || []).map((r) => `- ${r}`),
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Interview report copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAnswer = (idx) => {
    setExpandedAnswers((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="flex flex-col h-full max-h-[90vh] bg-slate-900 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">{interview.title}</h3>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getVerdictStyle(verdict)}`}>
                {verdict}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluated by Gemini AI • {interview.topic} ({interview.difficulty})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700/60"
            title="Copy Report as Markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? "Copied" : "Copy Report"}</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close report"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Report Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar select-text">
        {/* Top Score & Summary Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80">
          {/* Big Score Card */}
          <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Overall Score</span>
            <span className={`text-4xl font-extrabold font-mono ${getScoreColor(overallScore)}`}>
              {overallScore}
              <span className="text-lg text-slate-500 font-sans">/100</span>
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getVerdictStyle(verdict)}`}>
              {verdict}
            </span>
          </div>

          {/* Executive Summary */}
          <div className="md:col-span-3 flex flex-col justify-center space-y-1.5 p-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              Executive Evaluation Summary
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {report.summary || "Candidate completed the technical mock interview session."}
            </p>
          </div>
        </div>

        {/* 4 Core Dimensions Radar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Technical Depth", score: report.technicalDepthScore, icon: Cpu },
            { label: "Problem Solving", score: report.problemSolvingScore, icon: BrainCircuit },
            { label: "Communication", score: report.communicationScore, icon: MessageSquare },
            { label: "Trade-offs & Edge Cases", score: report.tradeoffsScore, icon: Compass },
          ].map((dim, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1 truncate text-[11px] font-medium">
                  <dim.icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="truncate">{dim.label}</span>
                </span>
                <span className={`font-mono font-bold text-xs ${getScoreColor(dim.score || 70)}`}>
                  {dim.score || 70}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${dim.score || 70}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses Two-Column */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Key Strengths Demonstrated
            </h4>
            <ul className="space-y-2">
              {(report.strengths || []).map((s, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              Areas for Improvement & Blind Spots
            </h4>
            <ul className="space-y-2">
              {(report.areasForImprovement || []).map((a, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Question-by-Question Model Answer Breakdown */}
        {report.modelAnswers && report.modelAnswers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Detailed Question Feedback & Senior Engineer Model Answers
            </h4>

            <div className="space-y-2.5">
              {report.modelAnswers.map((item, idx) => {
                const isExpanded = expandedAnswers.includes(idx);
                return (
                  <div key={idx} className="rounded-2xl bg-slate-950/60 border border-slate-800 overflow-hidden">
                    <button
                      onClick={() => toggleAnswer(idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between hover:bg-slate-800/40 transition gap-3"
                    >
                      <span className="text-xs font-bold text-slate-200 truncate">
                        Question #{idx + 1}: {item.question}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 border-t border-slate-800/60 space-y-3 text-xs">
                        {item.candidateSummary && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-slate-500">
                              Your Answer Summary
                            </span>
                            <p className="text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                              {item.candidateSummary}
                            </p>
                          </div>
                        )}

                        {item.feedback && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-indigo-400">
                              Interviewer Feedback
                            </span>
                            <p className="text-slate-300 bg-indigo-950/20 p-2.5 rounded-xl border border-indigo-500/20 leading-relaxed">
                              {item.feedback}
                            </p>
                          </div>
                        )}

                        {item.idealAnswer && (
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              What a Staff Engineer Would Answer
                            </span>
                            <p className="text-emerald-200 bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 leading-relaxed font-sans">
                              {item.idealAnswer}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actionable Study Roadmap / Recommended Topics */}
        {report.recommendedTopics && report.recommendedTopics.length > 0 && (
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-3">
            <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Recommended Study Topics for Your Next Round
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {report.recommendedTopics.map((topic, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span className="leading-snug">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
        <span className="text-xs text-slate-500">
          Saved to your Past Interview Performance history.
        </span>

        <div className="flex items-center gap-2">
          {onRetake && (
            <button
              onClick={onRetake}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700/60"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Retake Interview</span>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition"
            >
              Done & Back to Tracks
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
