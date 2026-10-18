"use client";

import { useState, useEffect } from "react";
import {
  Award,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  BrainCircuit,
  FileText,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import InterviewReportView from "./InterviewReportView";

export default function PastInterviewsView({ onSelectTrackToPractice }) {
  const [interviews, setInterviews] = useState([]);
  const [stats, setStats] = useState({ totalInterviews: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/mock-interview/history");
      setInterviews(data.interviews || []);
      setStats(data.stats || { totalInterviews: 0, averageScore: 0 });
    } catch (err) {
      console.error("Failed to load interview history:", err);
      toast.error(err.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await apiRequest(`/mock-interview/${id}`);
      if (data.interview) {
        setSelectedInterview(data.interview);
      }
    } catch (err) {
      toast.error("Failed to open interview report: " + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

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

  if (selectedInterview) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          <InterviewReportView
            interview={selectedInterview}
            onClose={() => setSelectedInterview(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Interviews</span>
            <div className="text-2xl font-black text-slate-100 font-mono mt-0.5">
              {stats.totalInterviews}
            </div>
            <p className="text-[10px] text-slate-500">Sessions evaluated by Gemini</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Average Performance</span>
            <div className={`text-2xl font-black font-mono mt-0.5 ${getScoreColor(stats.averageScore)}`}>
              {stats.averageScore}
              <span className="text-sm font-sans text-slate-500 font-normal"> / 100</span>
            </div>
            <p className="text-[10px] text-slate-500">Across all topics & levels</p>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bar Raiser Readiness</span>
            <div className="text-sm font-bold text-slate-200 mt-1">
              {stats.averageScore >= 80 ? "FAANG Ready" : stats.averageScore >= 65 ? "Solid Foundation" : "Needs Rehearsal"}
            </div>
            <p className="text-[10px] text-slate-500">Based on senior engineering standards</p>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            Completed Mock Interview Sessions ({interviews.length})
          </h3>
          <button
            onClick={fetchHistory}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
            <span>Loading your interview history...</span>
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-12 px-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-200">No mock interviews recorded yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Choose any track from the directory and start a voice mock interview with Gemini to receive a full scorecard and analysis.
              </p>
            </div>
            {onSelectTrackToPractice && (
              <button
                onClick={onSelectTrackToPractice}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition"
              >
                <span>Browse Mock Tracks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5">
            {interviews.map((item) => {
              const score = item.report?.overallScore || 0;
              const verdict = item.report?.verdict || "Completed";
              const date = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const mins = Math.round((item.duration || 0) / 60);

              return (
                <div
                  key={item._id}
                  onClick={() => handleOpenDetail(item._id)}
                  className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-slate-700/80 transition flex items-center justify-between gap-4 cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold font-mono text-sm group-hover:scale-105 transition shrink-0">
                      <span className={getScoreColor(score)}>{score}</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate group-hover:text-indigo-300 transition">
                          {item.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getVerdictStyle(verdict)}`}>
                          {verdict}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="font-semibold text-slate-300">{item.topic}</span>
                        <span>•</span>
                        <span>{item.difficulty}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {date}
                        </span>
                        {mins > 0 && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {mins} min
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      disabled={loadingDetail}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 group-hover:bg-indigo-600 text-slate-300 group-hover:text-white text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <span>View Scorecard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
