"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Editor from "@monaco-editor/react";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import { initSocket } from "@/lib/socket";
import { playNotificationSound } from "@/lib/sound";
import {
  Send,
  Users,
  Copy,
  Check,
  ArrowLeft,
  LogOut,
  Sparkles,
  Mail,
  Code2,
  MessageSquare,
  Columns,
  FileText,
  Trophy,
  Search,
  X,
  BookOpen,
  ChevronRight,
  Play,
  Terminal,
  ChevronUp,
  ChevronDown,
  Plus,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SUPPORTED_LANGUAGES = [
  { id: "javascript", label: "JavaScript", lcSlug: "javascript" },
  { id: "python", label: "Python", lcSlug: "python3" },
  { id: "cpp", label: "C++", lcSlug: "cpp" },
  { id: "java", label: "Java", lcSlug: "java" },
  { id: "typescript", label: "TypeScript", lcSlug: "typescript" },
];

export default function StudyRoomPage() {
  const { id: roomId } = useParams();
  const { user, loading } = useAuth();
  const router = useRouter();

  // Room & Chat State
  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [error, setError] = useState("");

  // ⌨️ Code Editor & 📝 Notes State
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [notes, setNotes] = useState("");
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'code' | 'notes' | 'chat'
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // 🏆 LeetCode & Problem State
  const [showLeetCodeModal, setShowLeetCodeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeProblem, setActiveProblem] = useState(null);
  const [showProblemPanel, setShowProblemPanel] = useState(false);
  const [loadingProblem, setLoadingProblem] = useState(false);

  // 🧪 Compiler & Testcases State
  const [testcases, setTestcases] = useState([""]);
  const [expectedOutputs, setExpectedOutputs] = useState([]);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [activeResultIndex, setActiveResultIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(true);
  const [consoleTab, setConsoleTab] = useState("testcase"); // 'testcase' | 'result'
  const [isRunning, setIsRunning] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // 📧 Email Invite State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ loading: false, success: "", error: "" });

  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  // 1. Auth Guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 2. Fetch Initial Room Details & History
  useEffect(() => {
    if (!user || !roomId) return;

    const fetchRoomData = async () => {
      try {
        setConnecting(true);
        const roomData = await apiRequest(`/rooms/${roomId}`);
        setRoom(roomData.room);
        setCode(roomData.room.code || "");
        setLanguage(roomData.room.language || "javascript");
        setNotes(roomData.room.notes || "");

        const msgData = await apiRequest(`/rooms/${roomId}/messages`);
        setMessages(msgData.messages || []);
      } catch (err) {
        setError(err.message || "Failed to load room");
      } finally {
        setConnecting(false);
      }
    };

    fetchRoomData();
  }, [user, roomId]);

  // 3. Socket.IO Lifecycle
  useEffect(() => {
    if (!user || !roomId) return;

    const socket = initSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      socket.emit("join_room", { roomId });
    });

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("user_joined", ({ name }) => {
      playNotificationSound("join");
      toast.info(`${name} joined the study room 👋`, { duration: 3000 });
    });

    socket.on("user_left", ({ name }) => {
      playNotificationSound("leave");
      toast(`${name} left the room 🚪`, { duration: 3000 });
    });

    socket.on("new_message", (message) => {
      setMessages((prev) => [...prev, message]);

      if (message.sender?._id !== user._id) {
        playNotificationSound("message");

        setViewMode((currentMode) => {
          if (currentMode !== "chat" && currentMode !== "split") {
            setUnreadChatCount((count) => count + 1);
            toast.message(`${message.sender?.name || "Peer"} in chat:`, {
              description: message.content,
            });
          }
          return currentMode;
        });
      }
    });

    socket.on("code_update", ({ code: newCode }) => {
      setCode(newCode);
    });

    socket.on("language_update", ({ language: newLanguage }) => {
      setLanguage(newLanguage);
    });

    socket.on("notes_update", ({ notes: newNotes }) => {
      setNotes(newNotes);
    });

    // When another peer selects a LeetCode problem
    socket.on("problem_selected", ({ problem }) => {
      setActiveProblem(problem);
      setShowProblemPanel(true);
      if (problem.exampleTestcaseList?.length > 0) {
        setTestcases(problem.exampleTestcaseList);
        setActiveCaseIndex(0);
      }
      setExpectedOutputs(problem.expectedOutputs || []);
      setExecutionResult(null);
      setActiveResultIndex(0);
      toast.success(`Peer loaded LeetCode #${problem.questionFrontendId}: ${problem.title}!`, {
        icon: "🏆",
      });
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      socket.emit("leave_room", { roomId });
      socket.disconnect();
    };
  }, [user, roomId]);

  // 4. Auto-scroll on new chat messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 5. Live LeetCode Search with debounce
  useEffect(() => {
    if (!showLeetCodeModal) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await apiRequest(`/leetcode/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.problems || []);
      } catch (err) {
        console.error("LeetCode search error:", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, showLeetCodeModal]);

  // 🏆 Select LeetCode Problem & Prefill Testcases
  const handleSelectProblem = async (titleSlug) => {
    setLoadingProblem(true);
    try {
      const data = await apiRequest(`/leetcode/${titleSlug}`);
      const problem = data.problem;

      setActiveProblem(problem);
      setShowProblemPanel(true);
      setShowLeetCodeModal(false);

      // Prefill LeetCode test cases!
      if (problem.exampleTestcaseList && problem.exampleTestcaseList.length > 0) {
        setTestcases(problem.exampleTestcaseList);
        setActiveCaseIndex(0);
      } else if (problem.sampleTestCase) {
        setTestcases([problem.sampleTestCase]);
        setActiveCaseIndex(0);
      } else {
        setTestcases([""]);
        setActiveCaseIndex(0);
      }

      setExpectedOutputs(problem.expectedOutputs || []);
      setExecutionResult(null);
      setActiveResultIndex(0);

      // Inject starter code for active language
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];
      const snippet = problem.codeSnippets?.find(
        (s) => s.langSlug === langConfig.lcSlug || s.lang.toLowerCase().includes(langConfig.id)
      );

      const starterCode =
        snippet?.code ||
        `// LeetCode #${problem.questionFrontendId}: ${problem.title}\n// Solve collaboratively in real time!\n`;

      setCode(starterCode);

      // Broadcast to room
      if (socketRef.current) {
        socketRef.current.emit("select_problem", { roomId, problem });
        socketRef.current.emit("code_change", { roomId, code: starterCode });
      }

      toast.success(`Loaded #${problem.questionFrontendId}: ${problem.title} with example test cases!`, {
        icon: "🏆",
      });
    } catch (err) {
      toast.error(err.message || "Failed to load LeetCode problem");
    } finally {
      setLoadingProblem(false);
    }
  };

  // ▶️ Run Code with All Testcases
  const handleRunCode = async () => {
    if (!code || !code.trim()) {
      toast.error("Code editor is empty!");
      return;
    }

    setIsRunning(true);
    setShowConsole(true);
    setConsoleTab("result");

    try {
      const activeTestcases = testcases.filter((tc) => tc !== undefined && tc !== null);
      const testInputs = activeTestcases.length > 0 ? activeTestcases : [""];
      const result = await apiRequest("/compiler/run", {
        method: "POST",
        body: JSON.stringify({
          code,
          language,
          inputs: testInputs,
          expectedOutputs: expectedOutputs.slice(0, testInputs.length),
        }),
      });

      setExecutionResult(result);
      setActiveResultIndex(0);

      if (result.success) {
        playNotificationSound("join");
        toast.success(`Accepted! All ${result.totalCount} test cases passed!`, { icon: "🎉" });
      } else {
        playNotificationSound("message");
        if (result.status === "Wrong Answer") {
          toast.error(`Wrong Answer (${result.passedCount}/${result.totalCount} cases passed)`);
        } else {
          toast.error(`${result.status} on test cases`);
        }
      }
    } catch (err) {
      setExecutionResult({
        success: false,
        status: "Error",
        output: err.message,
        time: "0.00s",
        memory: "N/A",
        results: [
          {
            caseIndex: 0,
            input: testcases[0] || "",
            actual: err.message,
            passed: false,
            status: "Error",
          },
        ],
      });
      toast.error(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  // ⌨️ Handle Code Editor Keystrokes
  const handleCodeChange = (newCode) => {
    const updated = newCode || "";
    setCode(updated);
    if (socketRef.current) {
      socketRef.current.emit("code_change", { roomId, code: updated });
    }
  };

  // 🌐 Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);

    if (activeProblem?.codeSnippets) {
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
      const snippet = activeProblem.codeSnippets.find(
        (s) => s.langSlug === langConfig?.lcSlug || s.lang.toLowerCase().includes(newLang)
      );
      if (snippet?.code) {
        setCode(snippet.code);
        socketRef.current?.emit("code_change", { roomId, code: snippet.code });
      }
    }

    if (socketRef.current) {
      socketRef.current.emit("language_change", { roomId, language: newLang });
    }
  };

  // 📝 Handle Shared Notes Keystrokes
  const handleNotesChange = (e) => {
    const updated = e.target.value;
    setNotes(updated);
    if (socketRef.current) {
      socketRef.current.emit("notes_change", { roomId, notes: updated });
    }
  };

  // 💬 Handle Chat Submit
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("send_message", {
      roomId,
      content: inputMessage.trim(),
    });

    setInputMessage("");
  };

  // 📧 Handle Email Invite
  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviteStatus({ loading: true, success: "", error: "" });

    try {
      const data = await apiRequest(`/rooms/${roomId}/invite`, {
        method: "POST",
        body: JSON.stringify({ email: inviteEmail }),
      });
      setInviteStatus({ loading: false, success: data.message, error: "" });
      setInviteEmail("");
      toast.success(`Invitation sent to ${inviteEmail}`);
      setTimeout(() => setShowInviteModal(false), 2000);
    } catch (err) {
      setInviteStatus({ loading: false, success: "", error: err.message });
    }
  };

  const handleCopyCode = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.joinCode);
    setCopiedCode(true);
    toast.success("Join code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleLeaveRoom = async () => {
    if (!confirm("Are you sure you want to leave this study room?")) return;
    try {
      await apiRequest(`/rooms/${roomId}/leave`, { method: "DELETE" });
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading || connecting) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm">Connecting to live study room...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-sm text-slate-400 mb-6">{error}</p>
          <Link
            href="/dashboard"
            className="inline-block px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none">
      {/* Toast Notification Container */}
      <Toaster richColors position="bottom-right" theme="dark" />

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Room Title & Live Badge */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-2">
            <h1 className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[130px] sm:max-w-xs">
              {room?.name}
            </h1>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Center: LeetCode Trigger, View Switcher & Language Selector */}
        <div className="flex items-center gap-2">
          {/* 🏆 LeetCode Explorer Button */}
          <button
            onClick={() => setShowLeetCodeModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>LeetCode</span>
          </button>

          {/* Toggle Problem Description Panel */}
          {activeProblem && (
            <button
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border transition ${
                showProblemPanel
                  ? "bg-slate-800 border-indigo-500/50 text-indigo-400 font-medium"
                  : "bg-slate-800/60 border-slate-700 text-slate-400"
              }`}
              title="Toggle Problem Statement Panel"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">#{activeProblem.questionFrontendId}</span>
            </button>
          )}

          {/* Language Dropdown */}
          {(viewMode === "code" || viewMode === "split") && (
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-medium rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>
          )}

          {/* View Mode Tabs */}
          <div className="hidden sm:flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setViewMode("notes")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                viewMode === "notes"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => {
                setViewMode("chat");
                setUnreadChatCount(0);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md relative transition ${
                viewMode === "chat"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadChatCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Join Code, Invite & Leave */}
        <div className="flex items-center gap-2">
          {/* Join Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-mono transition"
            title="Click to copy join code"
          >
            <span className="text-slate-400 font-sans hidden md:inline">Code:</span>
            <span className="font-bold text-indigo-400 tracking-wider">
              {room?.joinCode}
            </span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Invite Button */}
          <button
            onClick={() => {
              setShowInviteModal(true);
              setInviteStatus({ loading: false, success: "", error: "" });
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition"
            title="Invite by email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Invite</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={handleLeaveRoom}
            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg text-xs font-medium transition"
            title="Leave room"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* 1. MONACO CODE EDITOR + LEETCODE PANEL + TESTCASES CONSOLE */}
        {(viewMode === "split" || viewMode === "code") && (
          <div
            className={`flex flex-col border-r border-slate-800 bg-[#1e1e1e] ${
              viewMode === "split" ? "w-full md:w-3/5 lg:w-2/3" : "w-full"
            }`}
          >
            {/* Split row: Problem Panel (Left) & Editor Pane (Right) */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              {/* Collapsible LeetCode Problem Statement Panel */}
              {activeProblem && showProblemPanel && (
                <div className="w-1/2 border-r border-slate-800 bg-slate-900/90 flex flex-col overflow-hidden">
                  <div className="h-8 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-100 truncate">
                        #{activeProblem.questionFrontendId} {activeProblem.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          activeProblem.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : activeProblem.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {activeProblem.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowProblemPanel(false)}
                      className="p-1 text-slate-400 hover:text-white rounded transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Formatted HTML Problem Statement */}
                  <div className="flex-1 p-4 overflow-y-auto text-xs text-slate-300 leading-relaxed space-y-4 select-text">
                    <div
                      dangerouslySetInnerHTML={{ __html: activeProblem.content }}
                      className="prose prose-invert prose-xs max-w-none [&_pre]:bg-slate-950 [&_pre]:border [&_pre]:border-slate-800 [&_code]:text-indigo-300"
                    />
                    <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-1">
                      {activeProblem.topicTags?.map((tag) => (
                        <span
                          key={tag.name}
                          className="px-2 py-0.5 bg-slate-800 text-[10px] text-slate-400 rounded-md"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Editor Workspace */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Editor Header Bar with RUN Button */}
                <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 shrink-0">
                  <span className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "java" ? "java" : "js"}
                  </span>

                  <div className="flex items-center gap-3">
                    {/* RUN CODE BUTTON */}
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg shadow-sm transition shadow-emerald-600/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isRunning ? "Running..." : "Run Code"}</span>
                    </button>
                  </div>
                </div>

                {/* Monaco Editor Component */}
                <div className="flex-1 relative">
                  <Editor
                    height="100%"
                    language={language}
                    theme="vs-dark"
                    value={code}
                    onChange={handleCodeChange}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      wordWrap: "on",
                      automaticLayout: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* 🧪 INTERACTIVE TESTCASE & CONSOLE DRAWER (LeetCode Style) */}
            <div className="border-t border-slate-800 bg-slate-900 flex flex-col shrink-0">
              {/* Console Toggle Header */}
              <div className="h-9 px-4 flex items-center justify-between border-b border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setConsoleTab("testcase");
                      setShowConsole(true);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                      consoleTab === "testcase" && showConsole
                        ? "bg-slate-800 text-indigo-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Testcase</span>
                  </button>

                  <button
                    onClick={() => {
                      setConsoleTab("result");
                      setShowConsole(true);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                      consoleTab === "result" && showConsole
                        ? "bg-slate-800 text-indigo-400"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span>Test Result</span>
                    {executionResult && (
                      <span
                        className={`w-2 h-2 rounded-full ${
                          executionResult.success ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => setShowConsole(!showConsole)}
                  className="p-1 text-slate-400 hover:text-white transition"
                  title={showConsole ? "Collapse Console" : "Expand Console"}
                >
                  {showConsole ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Console Body */}
              {showConsole && (
                <div className="h-64 p-3 bg-slate-950/90 overflow-y-auto select-text">
                  {/* TAB 1: TESTCASE (Prefilled from LeetCode) */}
                  {consoleTab === "testcase" && (
                    <div className="h-full flex flex-col">
                      {/* Case Tabs: Case 1, Case 2, Case 3, + */}
                      <div className="flex items-center gap-2 mb-2">
                        {testcases.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveCaseIndex(idx)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                              activeCaseIndex === idx
                                ? "bg-slate-800 text-slate-100 border border-slate-700"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                            }`}
                          >
                            Case {idx + 1}
                          </button>
                        ))}
                        <button
                          onClick={() => {
                            setTestcases([...testcases, ""]);
                            setActiveCaseIndex(testcases.length);
                          }}
                          className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                          title="Add Test Case"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Active Testcase Input Box */}
                      <div className="flex-1">
                        <textarea
                          value={testcases[activeCaseIndex] || ""}
                          onChange={(e) => {
                            const updated = [...testcases];
                            updated[activeCaseIndex] = e.target.value;
                            setTestcases(updated);
                          }}
                          placeholder="Enter testcase parameters (e.g. [2,7,11,15]\n9)..."
                          className="w-full h-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TEST RESULT */}
                  {consoleTab === "result" && (
                    <div className="h-full flex flex-col">
                      {executionResult ? (
                        <div className="space-y-3">
                          {/* Summary Row */}
                          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                              {executionResult.success ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Accepted</span>
                                </span>
                              ) : executionResult.status === "Wrong Answer" ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Wrong Answer</span>
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  {executionResult.status}
                                </span>
                              )}

                              {executionResult.passedCount !== undefined && (
                                <span className="text-[11px] font-sans text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                                  {executionResult.passedCount}/{executionResult.totalCount} Testcases Passed
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500">
                              <span>
                                Runtime: <strong className="text-slate-300">{executionResult.time}</strong>
                              </span>
                              <span>
                                Memory: <strong className="text-slate-300">{executionResult.memory}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Individual Test Case Result Tabs (Case 1, Case 2, Case 3) */}
                          {executionResult.results && executionResult.results.length > 0 ? (
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2">
                                {executionResult.results.map((c, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => setActiveResultIndex(idx)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition ${
                                      activeResultIndex === idx
                                        ? "bg-slate-800 text-slate-100 border border-slate-700 shadow-xs"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                                    }`}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        c.passed ? "bg-emerald-400" : "bg-rose-400"
                                      }`}
                                    />
                                    <span>Case {idx + 1}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Selected Case Breakdown */}
                              {(() => {
                                const currentCase =
                                  executionResult.results[activeResultIndex] || executionResult.results[0];
                                return (
                                  <div className="space-y-2.5">
                                    <div>
                                      <span className="text-[11px] font-sans text-slate-400 font-semibold block mb-1">
                                        Input
                                      </span>
                                      <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-2.5 font-mono text-xs text-slate-200 whitespace-pre-wrap">
                                        {currentCase.input || "No input"}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-[11px] font-sans text-slate-400 font-semibold block mb-1">
                                          Output
                                        </span>
                                        <div
                                          className={`p-2.5 rounded-xl font-mono text-xs whitespace-pre-wrap border ${
                                            currentCase.passed
                                              ? "bg-slate-900 border-slate-800 text-emerald-400"
                                              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                                          }`}
                                        >
                                          {currentCase.actual || currentCase.rawOutput || "No output"}
                                        </div>
                                      </div>

                                      {currentCase.expected && (
                                        <div>
                                          <span className="text-[11px] font-sans text-slate-400 font-semibold block mb-1">
                                            Expected
                                          </span>
                                          <div className="bg-slate-900 border border-slate-800/90 rounded-xl p-2.5 font-mono text-xs text-indigo-300 whitespace-pre-wrap">
                                            {currentCase.expected}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 font-mono text-xs text-slate-200 whitespace-pre-wrap max-h-32 overflow-y-auto">
                              {executionResult.output}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-slate-500 py-8">
                          Click "Run Code" above to execute all test cases and compare with expected outputs.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. SHARED NOTES / SCRATCHPAD VIEW */}
        {viewMode === "notes" && (
          <div className="flex-1 flex flex-col bg-slate-900/50">
            <div className="h-9 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-2 font-medium text-slate-200">
                <FileText className="w-4 h-4 text-indigo-400" />
                Collaborative Study Notes
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span>{notes.length} characters</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Auto-saved
                </span>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto select-text">
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder="Start typing your shared lecture notes, formulas, or study topics here..."
                className="w-full h-full bg-transparent text-slate-100 placeholder-slate-600 font-mono text-sm leading-relaxed focus:outline-none resize-none"
              />
            </div>
          </div>
        )}

        {/* 3. CHAT FEED */}
        {(viewMode === "split" || viewMode === "chat") && (
          <div
            className={`flex flex-col bg-slate-950 ${
              viewMode === "split" ? "w-full md:w-2/5 lg:w-1/3" : "w-full"
            }`}
          >
            {/* Online Peers Roster Strip */}
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-400 shrink-0 text-[11px] font-medium uppercase tracking-wider">
                Online ({onlineUsers.length}):
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {onlineUsers.map((u) => (
                  <span
                    key={u.userId}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-slate-200 whitespace-nowrap border border-slate-700/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {u.name} {u.userId === user?._id && "(You)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 select-text">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 py-8">
                  <Sparkles className="w-8 h-8 mb-2 text-indigo-400/40" />
                  <p className="text-sm font-semibold text-slate-300">Welcome to {room?.name}!</p>
                  <p className="text-xs text-slate-500 max-w-xs mt-1">
                    Code together on the left, and chat with your study group right here.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender?._id === user?._id;
                  const senderName = msg.sender?.name || "Unknown";
                  const timeStr = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg._id || idx}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-medium text-slate-400">
                          {isMe ? "You" : senderName}
                        </span>
                        <span className="text-[10px] text-slate-600">{timeStr}</span>
                      </div>

                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-tr-xs shadow-md shadow-indigo-600/10"
                            : "bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-xs"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Chat Input Bar */}
            <div className="p-3 bg-slate-900/60 border-t border-slate-800 shrink-0">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Chat in #${room?.name}...`}
                  className="flex-1 bg-slate-800 border border-slate-700/80 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: 🏆 LeetCode Problem Search Explorer */}
      {showLeetCodeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">LeetCode Problem Explorer</h3>
                  <p className="text-xs text-slate-400">Search and solve any of 3,000+ real LeetCode problems together</p>
                </div>
              </div>
              <button
                onClick={() => setShowLeetCodeModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input Bar */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search by problem name or keyword (e.g. Two Sum, LRU Cache, Tree, Graph)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {searching ? (
                <div className="py-12 text-center text-slate-400 text-xs">Searching LeetCode API...</div>
              ) : searchResults.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  {searchQuery ? "No matching LeetCode problems found." : "Type a keyword above to find problems."}
                </div>
              ) : (
                searchResults.map((prob) => (
                  <button
                    key={prob.titleSlug}
                    onClick={() => handleSelectProblem(prob.titleSlug)}
                    disabled={loadingProblem}
                    className="w-full text-left p-3.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-xl transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-slate-500">#{prob.questionFrontendId}</span>
                        <h4 className="text-sm font-semibold text-slate-200 group-hover:text-amber-400 transition">
                          {prob.title}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            prob.difficulty === "Easy"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : prob.difficulty === "Medium"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {prob.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {prob.topicTags?.slice(0, 3).map((tag) => (
                          <span key={tag.name} className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite Peer by Email */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-slate-100">Invite a Peer to {room?.name}</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              We'll send an invitation email containing the direct join link and code.
            </p>

            {inviteStatus.error && (
              <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg">
                {inviteStatus.error}
              </div>
            )}

            {inviteStatus.success && (
              <div className="mb-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg">
                {inviteStatus.success}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Peer's Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="classmate@university.edu"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={inviteStatus.loading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition"
                >
                  {inviteStatus.loading ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}