"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import Editor from "@monaco-editor/react";
import {
  Plus,
  LogIn,
  LogOut,
  Copy,
  Check,
  Users,
  BookOpen,
  Lock,
  Eye,
  EyeOff,
  Trophy,
  Code2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  FileCode,
  Sparkles,
  Filter,
  CheckCheck,
  X,
  Briefcase,
} from "lucide-react";
import InterviewPrepPage from "@/app/interview-prep/page";

function DashboardContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [fetchingRooms, setFetchingRooms] = useState(true);

  // Tabs state
  const [activeTab, setActiveTab] = useState("rooms"); // 'rooms' | 'submissions'

  // Submissions state
  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [fetchingSubmissions, setFetchingSubmissions] = useState(false);
  const [submissionFilter, setSubmissionFilter] = useState("ALL"); // 'ALL' | 'Accepted' | 'Wrong Answer'
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedSubmissionCode, setCopiedSubmissionCode] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Create room inputs
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [createPassword, setCreatePassword] = useState("");

  // Join room inputs
  const [joinCode, setJoinCode] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [showPasswordField, setShowPasswordField] = useState(false);

  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch rooms and submissions on mount
  useEffect(() => {
    if (user) {
      loadRooms();
      loadSubmissions();
    }
  }, [user]);

  // 📧 Auto-open join modal if user opened an invite link (?joinCode=XYZ)
  useEffect(() => {
    const inviteCode = searchParams.get("joinCode");
    if (inviteCode) {
      setJoinCode(inviteCode.toUpperCase());
      setShowJoinModal(true);
    }
  }, [searchParams]);

  const loadRooms = async () => {
    try {
      setFetchingRooms(true);
      const data = await apiRequest("/rooms");
      setRooms(data.rooms || []);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setFetchingRooms(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      setFetchingSubmissions(true);
      const [subsData, statsData] = await Promise.all([
        apiRequest("/submissions/user"),
        apiRequest("/submissions/stats"),
      ]);
      setSubmissions(subsData.submissions || []);
      setStats(statsData.stats || null);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setFetchingSubmissions(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionLoading(true);

    try {
      const payload = {
        name: roomName,
        password: isPrivate ? createPassword : null,
      };

      const data = await apiRequest("/rooms", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setRoomName("");
      setCreatePassword("");
      setIsPrivate(false);
      setShowCreateModal(false);
      loadRooms();
      router.push(`/rooms/${data.room._id}`);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setActionError("");
    setActionLoading(true);

    try {
      const data = await apiRequest("/rooms/join", {
        method: "POST",
        body: JSON.stringify({
          joinCode,
          password: joinPassword || null,
        }),
      });

      setJoinCode("");
      setJoinPassword("");
      setShowPasswordField(false);
      setShowJoinModal(false);
      loadRooms();
      router.push(`/rooms/${data.roomId}`);
    } catch (err) {
      setActionError(err.message);
      // If server asks for password, reveal password input field
      if (err.message.toLowerCase().includes("password")) {
        setShowPasswordField(true);
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading your study rooms...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg leading-tight truncate">Study Room</h1>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                <span className="hidden xs:inline">Logged in as </span><span className="text-indigo-400 font-medium">{user.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab("mock")}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition border ${
                activeTab === "mock"
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="hidden sm:inline">Mock Interview Prep</span>
              <span className="sm:hidden">Mock</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition"
              title="Sign out of account"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs (Rooms vs Submissions vs Mock Interview Prep) */}
        <div className="flex items-center gap-2.5 sm:gap-3 border-b border-slate-800 pb-4 mb-8 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveTab("rooms")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
              activeTab === "rooms"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Study Rooms</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                activeTab === "rooms" ? "bg-indigo-700/80 text-white" : "bg-slate-800 text-slate-400"
              }`}
            >
              {rooms.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
              activeTab === "submissions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Problem Submissions</span>
            {stats && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                  activeTab === "submissions"
                    ? "bg-indigo-700/80 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {stats.totalSolved} Solved
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("mock")}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 ${
              activeTab === "mock"
                ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                : "text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20"
            }`}
          >
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Mock Interview Prep</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                activeTab === "mock" ? "bg-amber-600 text-white" : "bg-amber-400/20 text-amber-200"
              }`}
            >
              Personal
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* 🏠 STUDY ROOMS VIEW */}
        {/* ========================================================= */}
        {activeTab === "rooms" && (
          <div>
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-100">Your Study Rooms</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Collaborate, chat, and study with peers in real time
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setShowJoinModal(true);
                    setActionError("");
                    setShowPasswordField(false);
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>Join with Code</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setActionError("");
                  }}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-indigo-600/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Room</span>
                </button>
              </div>
            </div>

            {/* Rooms Grid */}
            {fetchingRooms ? (
              <div className="text-center py-20 text-slate-500">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-slate-200 mb-1">No Study Rooms Yet</h3>
                <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                  Create a new room and share the 6-character code with your study group, or join an existing room.
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition"
                >
                  Create Your First Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition group shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-400 transition truncate">
                          {room.name}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {room.isPrivate && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-semibold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md">
                              <Lock className="w-3 h-3" />
                              Private
                            </span>
                          )}
                          {room.owner?._id === user._id && (
                            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md">
                              Owner
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 mb-4">
                        Created by {room.owner?.name || "Unknown"}
                      </p>

                      {/* Join Code Display */}
                      <div className="flex items-center justify-between bg-slate-950/70 border border-slate-800/80 rounded-xl px-3.5 py-2 mb-4">
                        <span className="text-xs text-slate-400">Join Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold tracking-widest text-indigo-400 text-sm">
                            {room.joinCode}
                          </span>
                          <button
                            onClick={() => handleCopyCode(room.joinCode)}
                            title="Copy Code"
                            className="text-slate-400 hover:text-slate-200 transition"
                          >
                            {copiedCode === room.joinCode ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/rooms/${room._id}`}
                      className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-center text-sm transition shadow-sm"
                    >
                      Enter Room →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* 🏆 SUBMISSION HISTORY & PROBLEM PROGRESS VIEW */}
        {/* ========================================================= */}
        {activeTab === "submissions" && (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-100">Submission History</h2>
              <p className="text-sm text-slate-400 mt-0.5">
                Track your solved LeetCode challenges and collaborative coding records
              </p>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Problems Solved</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-100">
                    {stats?.totalSolved || 0}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Unique Accepted</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Total Submissions</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Code2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-100">
                    {stats?.totalSubmissions || 0}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Recorded runs</div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Difficulty Solved</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-medium">
                    {stats?.easy || 0} E
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-medium">
                    {stats?.medium || 0} M
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-medium">
                    {stats?.hard || 0} H
                  </span>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col justify-between shadow-xs">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Acceptance Rate</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-slate-100">
                    {submissions.length > 0
                      ? `${Math.round(
                          (submissions.filter((s) => s.status === "Accepted").length /
                            submissions.length) *
                            100
                        )}%`
                      : "0%"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {submissions.filter((s) => s.status === "Accepted").length} of{" "}
                    {submissions.length} passed
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["ALL", "Accepted", "Wrong Answer", "Compile Error"].map((f) => (
                <button
                  key={f}
                  onClick={() => setSubmissionFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                    submissionFilter === f
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800"
                  }`}
                >
                  {f === "ALL" ? `All (${submissions.length})` : f}
                </button>
              ))}
            </div>

            {/* Submissions List */}
            {fetchingSubmissions ? (
              <div className="text-center py-20 text-slate-500">Loading submission records...</div>
            ) : (() => {
              const filtered = submissions.filter((s) => {
                if (submissionFilter === "ALL") return true;
                return s.status === submissionFilter;
              });

              if (filtered.length === 0) {
                return (
                  <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                    <div className="w-16 h-16 bg-slate-800/80 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Code2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-1">
                      No Submissions Found
                    </h3>
                    <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
                      Join a study room, load a problem from LeetCode, and click "Submit" to record your solutions here.
                    </p>
                    <button
                      onClick={() => setActiveTab("rooms")}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition"
                    >
                      Go to Study Rooms
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {filtered.map((sub) => (
                    <div
                      key={sub._id}
                      className="bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition shadow-xs group"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${
                              sub.status === "Accepted"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : sub.status === "Wrong Answer"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            }`}
                          >
                            {sub.status === "Accepted" ? (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Accepted
                              </span>
                            ) : sub.status === "Wrong Answer" ? (
                              <span className="flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Wrong Answer
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                {sub.status}
                              </span>
                            )}
                          </span>

                          <h3 className="font-bold text-slate-100 group-hover:text-indigo-400 transition truncate text-sm sm:text-base">
                            {sub.problemFrontendId ? `#${sub.problemFrontendId} ` : ""}
                            {sub.problemTitle}
                          </h3>

                          {sub.difficulty && (
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                sub.difficulty === "Easy"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : sub.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : sub.difficulty === "Hard"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {sub.difficulty}
                            </span>
                          )}

                          {sub.problemTitleSlug && (
                            <a
                              href={`https://leetcode.com/problems/${sub.problemTitleSlug}/`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open on LeetCode"
                              className="text-slate-500 hover:text-indigo-400 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                          <span className="bg-slate-800/80 px-2 py-0.5 rounded-md font-mono text-[11px] text-indigo-300">
                            {sub.language}
                          </span>
                          <span>
                            {sub.passedCases}/{sub.totalCases} cases passed
                          </span>
                          {sub.room?.name && (
                            <span>
                              in <span className="text-slate-300">{sub.room.name}</span>
                            </span>
                          )}
                          <span className="text-slate-500">
                            {new Date(sub.createdAt).toLocaleDateString()}{" "}
                            {new Date(sub.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setCopiedSubmissionCode(false);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition border border-slate-700/60 shrink-0 shadow-xs"
                      >
                        <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>View Code</span>
                      </button>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* ========================================================= */}
        {/* 💼 PERSONAL MOCK INTERVIEW PREP VIEW (NOT A ROOM)         */}
        {/* ========================================================= */}
        {activeTab === "mock" && (
          <div className="space-y-6">
            <InterviewPrepPage embedded={true} />
          </div>
        )}
      </main>

      {/* Modal: Create Room */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">Create a Study Room</h3>
            <p className="text-xs text-slate-400 mb-5">
              You'll receive a unique 6-character code to share.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Room Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Algorithms & Data Structures"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Password Protection Toggle */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="w-4 h-4 rounded-sm border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-800"
                  />
                  <span className="text-xs text-slate-300 flex items-center gap-1.5 font-medium">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    Protect with password (Private Room)
                  </span>
                </label>

                {isPrivate && (
                  <div className="mt-3">
                    <input
                      type="password"
                      required={isPrivate}
                      placeholder="Enter room password"
                      value={createPassword}
                      onChange={(e) => setCreatePassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-amber-500/40 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  {actionLoading ? "Creating..." : "Create Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Room */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-1">Join Study Room</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter the 6-character code given by your classmate.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {actionError}
              </div>
            )}

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">6-Character Code</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="e.g. MATH99"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 font-mono tracking-widest uppercase focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              {/* Password field (shown if private or user clicks) */}
              {(showPasswordField || joinPassword.length > 0) && (
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    Room Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter the room password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-amber-500/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
                  />
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition"
                >
                  {actionLoading ? "Joining..." : "Join Room"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Code */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-100 text-sm sm:text-base">
                    {selectedSubmission.problemFrontendId ? `#${selectedSubmission.problemFrontendId} ` : ""}
                    {selectedSubmission.problemTitle}
                  </h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      selectedSubmission.status === "Accepted"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}
                  >
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>
                    Language: <span className="font-mono text-indigo-300">{selectedSubmission.language}</span>
                  </span>
                  <span>•</span>
                  <span>Submitted: {new Date(selectedSubmission.createdAt).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Monaco Code Editor */}
            <div className="flex-1 min-h-[350px]">
              <Editor
                height="350px"
                theme="vs-dark"
                language={selectedSubmission.language}
                value={selectedSubmission.code}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  fontSize: 13,
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 px-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-xs text-slate-500">
                {selectedSubmission.passedCases}/{selectedSubmission.totalCases} test cases passed
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSubmission.code);
                    setCopiedSubmissionCode(true);
                    setTimeout(() => setCopiedSubmissionCode(false), 2000);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition border border-slate-700"
                >
                  {copiedSubmissionCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}