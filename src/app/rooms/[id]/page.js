"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast, Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext";

// 🚀 Performance: Lazy-load heavy Monaco Editor (client-only, dynamic chunk)
const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs gap-3">
      <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <span>Loading collaborative editor...</span>
    </div>
  ),
});
import Whiteboard from "@/components/Whiteboard";
import FormattedAIMessage from "@/components/FormattedAIMessage";
import InterviewTimer from "@/components/InterviewTimer";
import { fireAcceptedConfetti } from "@/lib/confetti";
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
  AlertTriangle,
  RotateCcw,
  AlignLeft,
  GripVertical,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  ScreenShare,
  Minimize2,
  Maximize2,
  Download,
  CheckCheck,
  FileCode,
  Move,
  Expand,
  Shrink,
  GripHorizontal,
  Pin,
  PinOff,
  Bot,
  Lightbulb,
  Bug,
  Gauge,
  Palette,
} from "lucide-react";

// Google Public STUN Configuration for WebRTC NAT Traversal
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
};

// Peer Video / Audio Tile Component
function PeerVideoTile({ peer, isPinned = false, onTogglePin }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const setVideoRef = (el) => {
    videoRef.current = el;
    if (el && peer.stream) {
      if (el.srcObject !== peer.stream) {
        el.srcObject = peer.stream;
      }
      el.play().catch(() => {});
    }
  };

  const setAudioRef = (el) => {
    audioRef.current = el;
    if (el && peer.stream) {
      if (el.srcObject !== peer.stream) {
        el.srcObject = peer.stream;
      }
      el.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      if (videoRef.current.srcObject !== peer.stream) {
        videoRef.current.srcObject = peer.stream;
      }
      videoRef.current.play().catch(() => {});
    }
    if (audioRef.current && peer.stream) {
      if (audioRef.current.srcObject !== peer.stream) {
        audioRef.current.srcObject = peer.stream;
      }
      audioRef.current.play().catch(() => {});
    }
  }, [peer.stream, peer.camOff]);

  // Keep media playback in sync as RTP packets begin arriving and unmute
  useEffect(() => {
    if (!peer.stream) return;
    const handleTrackUpdate = () => {
      if (videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    };
    peer.stream.getTracks().forEach((track) => {
      track.addEventListener("unmute", handleTrackUpdate);
      track.addEventListener("ended", handleTrackUpdate);
    });
    return () => {
      if (peer.stream) {
        peer.stream.getTracks().forEach((track) => {
          track.removeEventListener("unmute", handleTrackUpdate);
          track.removeEventListener("ended", handleTrackUpdate);
        });
      }
    };
  }, [peer.stream]);

  const hasActiveVideo =
    peer.stream &&
    !peer.camOff &&
    peer.stream.getVideoTracks().length > 0 &&
    peer.stream.getVideoTracks().some((t) => t.enabled);

  return (
    <div className="relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden w-full h-full min-h-0 flex items-center justify-center shadow-md group">
      {/* Pin / Spotlight toggle button */}
      {onTogglePin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md shadow-md transition z-20 ${
            isPinned
              ? "bg-indigo-600/90 text-white border-indigo-500 opacity-100"
              : "bg-slate-950/70 hover:bg-slate-900 text-slate-300 hover:text-white border-slate-700/60 opacity-0 group-hover:opacity-100"
          }`}
          title={isPinned ? "Unpin video (restore grid)" : "Pin video to fill window"}
        >
          {isPinned ? <PinOff className="w-3.5 h-3.5 text-white" /> : <Pin className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Video element is permanently mounted to prevent decoder pipeline disconnection. Muted ensures 100% reliable autoplay across all browsers without policy rejection. */}
      <video
        ref={setVideoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={(e) => e.target.play().catch(() => {})}
        className={`w-full h-full object-cover ${hasActiveVideo ? "block" : "hidden"}`}
      />

      {/* Fallback avatar if peer camera is turned off */}
      {!hasActiveVideo && (
        <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-2 w-full h-full">
          <div className="w-12 h-12 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-base shadow-inner">
            {peer.name ? peer.name[0].toUpperCase() : "P"}
          </div>
          <span className="text-xs text-slate-400 font-medium truncate max-w-[120px]">
            {peer.name || "Peer"}
          </span>
        </div>
      )}

      {/* Peer audio element */}
      <audio ref={setAudioRef} autoPlay playsInline />

      {/* Peer Name & Mic Status */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
        <span className="bg-slate-950/80 backdrop-blur-xs text-[10px] font-medium text-slate-200 px-1.5 py-0.5 rounded truncate max-w-[130px]">
          {peer.name} {isPinned ? "(Pinned)" : ""}
        </span>
        <span
          className={`p-1 rounded text-[10px] ${
            peer.micMuted
              ? "bg-rose-500/90 text-white"
              : "bg-slate-950/80 text-emerald-400"
          }`}
        >
          {peer.micMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
        </span>
      </div>
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'code' | 'notes' | 'chat' | 'whiteboard'
  const [isMobile, setIsMobile] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Responsive screen detection for mobile devices
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && viewMode === "split") {
        setViewMode("code");
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // 📏 Resizable Split Panes & Editor Options State
  const [splitPercent, setSplitPercent] = useState(65);
  const [problemSplitPercent, setProblemSplitPercent] = useState(45);
  const [consoleHeight, setConsoleHeight] = useState(250);
  const [fontSize, setFontSize] = useState(14);
  const [typingPeer, setTypingPeer] = useState("");

  // 🎙️ WebRTC Voice & Video Mesh State
  const [isInCall, setIsInCall] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [callPeers, setCallPeers] = useState({}); // { [socketId]: { socketId, userId, name, stream, micMuted, camOff } }
  const [callTrayMinimized, setCallTrayMinimized] = useState(false);
  const [callPos, setCallPos] = useState({ x: null, y: null }); // Drag coordinates: null = default fixed bottom-right
  const [callCustomSize, setCallCustomSize] = useState({ width: 520, height: 380 }); // Custom resizable width & height
  const [isCallMaximized, setIsCallMaximized] = useState(false); // Maximize mesh toggle
  const [pinnedPeerId, setPinnedPeerId] = useState(null); // Pinned/Spotlight peer socketId

  // 💾 Submissions & Session Export State
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🤖 AI Coding Coach (Gemini 3.8 Flash) State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([]);
  const [aiQuestion, setAiQuestion] = useState("");
  const [hintLevel, setHintLevel] = useState(1);
  const [copiedAIId, setCopiedAIId] = useState(null);

  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);
  const editorRef = useRef(null);
  const workspaceRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // WebRTC Refs
  const localStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const screenTrackRef = useRef(null);
  const peerConnectionsRef = useRef(new Map()); // socketId -> RTCPeerConnection
  const pendingIceCandidatesRef = useRef(new Map()); // socketId -> RTCIceCandidate[]
  const callCardRef = useRef(null);

  // Helper to create an RTCPeerConnection for a remote peer
  const createPeerConnection = (targetSocketId) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionsRef.current.set(targetSocketId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("webrtc_ice_candidate", {
          targetSocketId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setCallPeers((prev) => {
        const current = prev[targetSocketId] || {};
        let combinedStream;
        if (event.streams && event.streams[0]) {
          // Wrap all incoming tracks in a new MediaStream instance so React state recognizes the reference change
          combinedStream = new MediaStream(event.streams[0].getTracks());
        } else {
          const existingTracks = current.stream ? current.stream.getTracks() : [];
          if (!existingTracks.some((t) => t.id === event.track.id)) {
            combinedStream = new MediaStream([...existingTracks, event.track]);
          } else {
            combinedStream = new MediaStream(existingTracks);
          }
        }

        const hasVideo = combinedStream.getVideoTracks().some((t) => t.enabled);

        return {
          ...prev,
          [targetSocketId]: {
            ...current,
            socketId: targetSocketId,
            stream: combinedStream,
            camOff: hasVideo ? false : (current.camOff ?? false),
          },
        };
      });
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        try {
          pc.close();
        } catch (e) {}
        peerConnectionsRef.current.delete(targetSocketId);
        setCallPeers((prev) => {
          const next = { ...prev };
          delete next[targetSocketId];
          return next;
        });
      }
    };

    // Attach current local tracks to connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  };

  // Helper to flush pending ICE candidates after remote description is set
  const processPendingIceCandidates = async (socketId, pc) => {
    const queued = pendingIceCandidatesRef.current.get(socketId) || [];
    for (const cand of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(cand));
      } catch (err) {
        console.warn("Error adding queued ICE candidate:", err);
      }
    }
    pendingIceCandidatesRef.current.delete(socketId);
  };

  // Synchronize local video element whenever call state or camera state changes
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      if (localVideoRef.current.srcObject !== localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }
      localVideoRef.current.play().catch(() => {});
    }
  }, [isInCall, camOff, isScreenSharing]);

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

        // Sync active LeetCode problem if session already has one loaded
        if (roomData.room.activeProblem) {
          setActiveProblem(roomData.room.activeProblem);
          setShowProblemPanel(true);
          if (roomData.room.activeProblem.exampleTestcaseList?.length > 0) {
            setTestcases(roomData.room.activeProblem.exampleTestcaseList);
            setActiveCaseIndex(0);
          }
          setExpectedOutputs(roomData.room.activeProblem.expectedOutputs || []);
        }

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

    socket.on("peer_typing_update", ({ name, isTyping }) => {
      if (isTyping) {
        setTypingPeer(name);
      } else {
        setTypingPeer("");
      }
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

    // 🎉 When any peer in the room gets their solution Accepted!
    socket.on("peer_celebrate_accepted", ({ userName, problemTitle }) => {
      fireAcceptedConfetti();
      playNotificationSound("join");
      toast.success(`🎉 ${userName} solved ${problemTitle || "the problem"}! 🏆`, {
        duration: 5000,
      });
    });

    // ==========================================
    // 🎙️ WEBRTC MESH EVENTS
    // ==========================================

    // 1. We receive the list of existing peers in the call
    socket.on("webrtc_existing_peers", async ({ peers }) => {
      for (const peer of peers) {
        setCallPeers((prev) => ({
          ...prev,
          [peer.socketId]: {
            socketId: peer.socketId,
            userId: peer.userId,
            name: peer.name,
            micMuted: peer.micMuted,
            camOff: peer.camOff,
            stream: null,
          },
        }));

        try {
          const pc = createPeerConnection(peer.socketId);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);

          socket.emit("webrtc_signal_offer", {
            targetSocketId: peer.socketId,
            offer,
          });
        } catch (err) {
          console.error("Failed to create offer for peer:", peer.socketId, err);
        }
      }
    });

    // 2. A newcomer joined the call
    socket.on("webrtc_peer_joined", ({ socketId, userId, name, micMuted, camOff }) => {
      if (!localStreamRef.current) return;

      setCallPeers((prev) => ({
        ...prev,
        [socketId]: {
          socketId,
          userId,
          name,
          micMuted,
          camOff,
          stream: null,
        },
      }));
      toast.info(`${name} joined voice & video call 🎙️`);
    });

    // 3. We received an SDP Offer from a peer
    socket.on("webrtc_receive_offer", async ({ callerSocketId, callerName, callerUserId, offer }) => {
      if (!localStreamRef.current) return;

      try {
        let pc = peerConnectionsRef.current.get(callerSocketId);
        if (!pc) {
          pc = createPeerConnection(callerSocketId);
        }

        setCallPeers((prev) => ({
          ...prev,
          [callerSocketId]: {
            ...(prev[callerSocketId] || {}),
            socketId: callerSocketId,
            userId: callerUserId,
            name: callerName,
          },
        }));

        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await processPendingIceCandidates(callerSocketId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("webrtc_signal_answer", {
          targetSocketId: callerSocketId,
          answer,
        });
      } catch (err) {
        console.error("Error handling SDP offer:", err);
      }
    });

    // 4. We received an SDP Answer from a peer
    socket.on("webrtc_receive_answer", async ({ senderSocketId, answer }) => {
      try {
        const pc = peerConnectionsRef.current.get(senderSocketId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          await processPendingIceCandidates(senderSocketId, pc);
        }
      } catch (err) {
        console.error("Error handling SDP answer:", err);
      }
    });

    // 5. We received an ICE candidate
    socket.on("webrtc_ice_candidate", async ({ senderSocketId, candidate }) => {
      if (!candidate) return;
      const pc = peerConnectionsRef.current.get(senderSocketId);
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("Failed to add ICE candidate:", err);
        }
      } else {
        if (!pendingIceCandidatesRef.current.has(senderSocketId)) {
          pendingIceCandidatesRef.current.set(senderSocketId, []);
        }
        pendingIceCandidatesRef.current.get(senderSocketId).push(candidate);
      }
    });

    // 6. Peer updated mic / camera status
    socket.on("webrtc_peer_status_changed", ({ socketId, micMuted, camOff }) => {
      setCallPeers((prev) => {
        if (!prev[socketId]) return prev;
        return {
          ...prev,
          [socketId]: {
            ...prev[socketId],
            micMuted,
            camOff,
          },
        };
      });
    });

    // 7. Peer left the call
    socket.on("webrtc_peer_left", ({ socketId, name }) => {
      const pc = peerConnectionsRef.current.get(socketId);
      if (pc) {
        try {
          pc.close();
        } catch (e) {}
        peerConnectionsRef.current.delete(socketId);
      }
      pendingIceCandidatesRef.current.delete(socketId);
      setCallPeers((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
      if (name) {
        toast.info(`${name} left the voice & video call`);
      }
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      peerConnectionsRef.current.forEach((pc) => {
        try {
          pc.close();
        } catch (e) {}
      });
      peerConnectionsRef.current.clear();
      pendingIceCandidatesRef.current.clear();

      socket.emit("webrtc_leave_call", { roomId });
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

  // 6. Bind local video element to local stream
  useEffect(() => {
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = isScreenSharing
        ? (screenTrackRef.current ? new MediaStream([screenTrackRef.current]) : localStreamRef.current)
        : localStreamRef.current;
    }
  }, [isInCall, camOff, isScreenSharing]);

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
        fireAcceptedConfetti();
        playNotificationSound("join");
        toast.success(`Accepted! All ${result.totalCount} test cases passed!`, { icon: "🎉" });
        socketRef.current?.emit("celebrate_accepted", {
          roomId,
          problemTitle: activeProblem?.title || "Test Cases",
        });
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

  // 🚀 Submit Solution & Save to Database
  const handleSubmitSolution = async () => {
    if (!code || !code.trim()) {
      toast.error("Code editor is empty!");
      return;
    }

    setIsSubmitting(true);
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

      // Map compiler status to submission status
      const submissionStatus = result.success
        ? "Accepted"
        : result.status === "Compilation Error"
        ? "Compile Error"
        : result.status === "Runtime Error"
        ? "Runtime Error"
        : "Wrong Answer";

      await apiRequest("/submissions", {
        method: "POST",
        body: JSON.stringify({
          room: roomId,
          problemFrontendId: activeProblem?.questionFrontendId || "",
          problemTitle: activeProblem?.title || (activeProblem ? "Custom Problem" : "Free Code Session"),
          problemTitleSlug: activeProblem?.titleSlug || "",
          difficulty: activeProblem?.difficulty || "Custom",
          language,
          code,
          status: submissionStatus,
          passedCases: result.passedCount || 0,
          totalCases: result.totalCount || testInputs.length,
          executionTime: result.time || "",
        }),
      });

      if (result.success) {
        fireAcceptedConfetti();
        playNotificationSound("join");
        toast.success(`🎉 Solution Accepted! Saved to your submission history.`, { duration: 5000 });
        socketRef.current?.emit("celebrate_accepted", {
          roomId,
          problemTitle: activeProblem?.title || "Solution Submission",
        });
      } else {
        playNotificationSound("message");
        toast.error(`Solution Submitted: ${submissionStatus} (${result.passedCount}/${result.totalCount} passed). Saved to history.`, { duration: 5000 });
      }
    } catch (err) {
      toast.error(err.message || "Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🤖 Ask AI Coding Coach (Gemini 3.8 Flash)
  const handleAskAICoach = async (action, customQuestion = "") => {
    setAiLoading(true);
    setShowConsole(true);
    setConsoleTab("ai");

    const requestedHintLevel = action === "hint" ? hintLevel : undefined;

    try {
      const data = await apiRequest("/ai/coach", {
        method: "POST",
        body: JSON.stringify({
          action,
          code,
          language,
          problem: activeProblem,
          errorContext: executionResult,
          hintLevel: requestedHintLevel,
          question: customQuestion || aiQuestion,
        }),
      });

      if (data.reply) {
        const titleMap = {
          hint: `Hint Level ${requestedHintLevel || 1}`,
          explain_bug: "Bug & Logical Error Analysis",
          complexity: "Time & Space Complexity",
          chat: customQuestion || aiQuestion || "AI Coach Query",
        };

        const newEntry = {
          id: Date.now(),
          type: action,
          title: titleMap[action] || "AI Response",
          content: data.reply,
          source: data.source || "gemini-3.8-flash",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setAiHistory((prev) => [newEntry, ...prev]);

        if (action === "hint") {
          setHintLevel((prev) => (prev >= 3 ? 1 : prev + 1));
          toast.success(`Generated Hint Level ${requestedHintLevel || 1}!`, { icon: "💡" });
        } else if (action === "explain_bug") {
          toast.info("Bug explanation generated!", { icon: "🔍" });
        } else if (action === "complexity") {
          toast.info("Complexity evaluated!", { icon: "⏱️" });
        } else {
          toast.success("AI Coach responded!", { icon: "🤖" });
        }

        if (customQuestion || aiQuestion) {
          setAiQuestion("");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to get AI Coach feedback");
    } finally {
      setAiLoading(false);
    }
  };

  // 📥 Export Study Session (Markdown, Code File, Notes)
  const handleExportSession = (type = "markdown") => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const roomTitle = (room?.name || "study-room").replace(/\s+/g, "_");
    const langExtMap = {
      javascript: "js",
      python: "py",
      cpp: "cpp",
      java: "java",
      typescript: "ts",
    };
    const ext = langExtMap[language] || "txt";

    if (type === "code") {
      const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeProblem?.titleSlug || "solution"}_${timestamp}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Downloaded solution.${ext}!`);
    } else if (type === "notes") {
      const blob = new Blob([notes], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomTitle}_notes_${timestamp}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded study notes!");
    } else {
      // Full Markdown Bundle
      const content = [
        `# 📚 Study Room Session: ${room?.name || "Study Session"}`,
        `**Date:** ${new Date().toLocaleString()}`,
        `**Room Join Code:** \`${room?.joinCode || "N/A"}\``,
        `**Language:** ${language}`,
        "",
        activeProblem
          ? [
              `## 🏆 LeetCode Problem: #${activeProblem.questionFrontendId} - ${activeProblem.title}`,
              `- **Difficulty:** ${activeProblem.difficulty}`,
              `- **LeetCode URL:** https://leetcode.com/problems/${activeProblem.titleSlug}/`,
              "",
            ].join("\n")
          : "",
        `## 💻 Code Solution`,
        `\`\`\`${language}`,
        code,
        `\`\`\``,
        "",
        `## 📝 Collaborative Notes`,
        notes || "_No notes recorded in this session._",
        "",
        `## 💬 Chat Discussion Summary`,
        messages.length > 0
          ? messages
              .map(
                (m) =>
                  `- **${m.sender?.name || "Peer"}** (${new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}): ${m.content}`
              )
              .join("\n")
          : "_No chat messages._",
      ]
        .filter(Boolean)
        .join("\n\n");

      const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${roomTitle}_Session_Export_${timestamp}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Exported full study session as Markdown (.md)!");
    }
  };

  // ⌨️ Handle Code Editor Keystrokes & Peer Typing
  const handleCodeChange = (newCode) => {
    const updated = newCode || "";
    setCode(updated);
    if (socketRef.current) {
      socketRef.current.emit("code_change", { roomId, code: updated });
      socketRef.current.emit("peer_typing", { roomId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit("peer_typing", { roomId, isTyping: false });
      }, 1500);
    }
  };

  // 📏 Resizing Handlers (Bars move all the way smoothly)
  const handleStartSplitResize = (e) => {
    e.preventDefault();
    const handleMove = (moveEvent) => {
      if (!workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const newPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setSplitPercent(Math.max(5, Math.min(95, newPercent)));
    };
    const handleUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const handleStartProblemResize = (e) => {
    e.preventDefault();
    const leftPane = e.currentTarget.parentElement;
    const handleMove = (moveEvent) => {
      if (!leftPane) return;
      const rect = leftPane.getBoundingClientRect();
      const newPercent = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      setProblemSplitPercent(Math.max(5, Math.min(95, newPercent)));
    };
    const handleUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  const handleStartConsoleResize = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;
    const handleMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY;
      setConsoleHeight(Math.max(140, Math.min(650, startHeight + deltaY)));
    };
    const handleUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    document.body.style.userSelect = "none";
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  // 🖐️ Draggable Floating Video Call Handler
  const handleStartCallDrag = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    if (isCallMaximized) return; // Dragging is disabled when maximized
    if (e.target.closest("button") || e.target.closest("input") || e.target.closest("select")) return;

    const cardEl = callCardRef.current;
    if (!cardEl) return;

    e.preventDefault();
    const rect = cardEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    // Prevent text selection inside Monaco editor or page during drag
    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent) => {
      const cardWidth = rect.width;
      const cardHeight = rect.height;
      const maxX = Math.max(10, window.innerWidth - cardWidth - 10);
      const maxY = Math.max(10, window.innerHeight - cardHeight - 10);

      const nextX = Math.min(Math.max(10, moveEvent.clientX - offsetX), maxX);
      const nextY = Math.min(Math.max(10, moveEvent.clientY - offsetY), maxY);

      setCallPos({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // 📐 Freeform Drag-to-Resize Handler for Video Call Window
  const handleStartCallResize = (e) => {
    if (e.button !== 0) return; // Only primary mouse button
    if (isCallMaximized) return; // Resizing is disabled when maximized
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = callCustomSize.width;
    const startHeight = callCustomSize.height;

    document.body.style.userSelect = "none";

    const handlePointerMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      const maxWidth = Math.max(360, window.innerWidth - 30);
      const maxHeight = Math.max(240, window.innerHeight - 30);

      const newWidth = Math.min(Math.max(340, startWidth + deltaX), maxWidth);
      const newHeight = Math.min(Math.max(240, startHeight + deltaY), maxHeight);

      setCallCustomSize({ width: newWidth, height: newHeight });
    };

    const handlePointerUp = () => {
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // 🧹 Editor Toolbar Actions
  const handleFormatCode = () => {
    if (!editorRef.current) return;
    try {
      editorRef.current.getAction("editor.action.formatDocument")?.run();
      toast.success("Code formatted ✨");
    } catch {
      toast.error("Formatting not available for this language");
    }
  };

  const handleResetCode = () => {
    if (!confirm("Reset editor to original starter code? Any changes will be lost.")) return;
    let starterCode = "";
    if (activeProblem?.codeSnippets) {
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === language) || SUPPORTED_LANGUAGES[0];
      const snippet = activeProblem.codeSnippets.find(
        (s) => s.langSlug === langConfig.lcSlug || s.lang.toLowerCase().includes(langConfig.id)
      );
      starterCode = snippet?.code || "";
    }
    if (!starterCode) {
      starterCode = `// Write code collaboratively in real-time\n`;
    }
    setCode(starterCode);
    socketRef.current?.emit("code_change", { roomId, code: starterCode });
    toast.info("Editor reset to starter code");
  };

  const handleCopyEditorCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  // ==========================================
  // 🎙️ WebRTC Voice & Video Actions
  // ==========================================
  const handleJoinCall = async () => {
    if (isJoiningCall || isInCall) return;
    setIsJoiningCall(true);

    try {
      let stream = null;
      let videoAvailable = true;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: { ideal: 640 }, height: { ideal: 360 } },
        });
      } catch (err) {
        console.warn("Could not acquire video+audio, falling back to audio only:", err.message);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        videoAvailable = false;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsInCall(true);
      setMicMuted(false);
      setCamOff(!videoAvailable);
      setCallTrayMinimized(false);

      if (socketRef.current) {
        socketRef.current.emit("webrtc_join_call", {
          roomId,
          micMuted: false,
          camOff: !videoAvailable,
        });
      }

      toast.success(
        videoAvailable
          ? "Joined voice & video call!"
          : "Joined voice call (audio only)!",
        { icon: "🎙️" }
      );
    } catch (err) {
      console.error("Failed to access media devices:", err);
      toast.error("Could not access microphone or camera. Please check browser permissions.");
    } finally {
      setIsJoiningCall(false);
    }
  };

  const handleLeaveCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    peerConnectionsRef.current.forEach((pc) => {
      try {
        pc.close();
      } catch (e) {}
    });
    peerConnectionsRef.current.clear();
    pendingIceCandidatesRef.current.clear();

    setIsInCall(false);
    setIsJoiningCall(false);
    setIsScreenSharing(false);
    setCallPeers({});

    if (socketRef.current) {
      socketRef.current.emit("webrtc_leave_call", { roomId });
    }
    toast.info("Left voice & video call");
  };

  const handleToggleMic = () => {
    if (!localStreamRef.current) return;
    const audioTrack = localStreamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      const newMuted = !audioTrack.enabled;
      setMicMuted(newMuted);

      if (socketRef.current) {
        socketRef.current.emit("webrtc_media_status", {
          roomId,
          micMuted: newMuted,
          camOff,
        });
      }
      toast.info(newMuted ? "Microphone muted" : "Microphone unmuted");
    }
  };

  const handleToggleCam = async () => {
    if (!localStreamRef.current) return;
    const videoTrack = localStreamRef.current.getVideoTracks()[0];

    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      const newCamOff = !videoTrack.enabled;
      setCamOff(newCamOff);

      if (socketRef.current) {
        socketRef.current.emit("webrtc_media_status", {
          roomId,
          micMuted,
          camOff: newCamOff,
        });
      }
      toast.info(newCamOff ? "Camera turned off" : "Camera turned on");
    } else {
      // User initially joined audio-only, try acquiring camera now
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 } },
        });
        const newTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(newTrack);

        peerConnectionsRef.current.forEach((pc) => {
          pc.addTrack(newTrack, localStreamRef.current);
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }

        setCamOff(false);
        if (socketRef.current) {
          socketRef.current.emit("webrtc_media_status", {
            roomId,
            micMuted,
            camOff: false,
          });
        }
        toast.success("Camera enabled!");
      } catch (err) {
        toast.error("Could not enable camera: " + err.message);
      }
    }
  };

  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }

      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        });
      }

      if (localVideoRef.current && localStreamRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setIsScreenSharing(false);
      toast.info("Screen sharing ended");
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false,
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        screenTrack.onended = () => {
          handleToggleScreenShare();
        };

        peerConnectionsRef.current.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === "video");
          if (sender) {
            sender.replaceTrack(screenTrack);
          } else {
            pc.addTrack(screenTrack, localStreamRef.current);
          }
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        setIsScreenSharing(true);
        toast.success("Screen sharing started!");
      } catch (err) {
        if (err.name !== "NotAllowedError") {
          toast.error("Screen sharing error: " + err.message);
        }
      }
    }
  };

  // 🌐 Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);

    if (activeProblem?.codeSnippets && activeProblem.codeSnippets.length > 0) {
      const langConfig = SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
      const snippet = activeProblem.codeSnippets.find(
        (s) =>
          s.langSlug === langConfig?.lcSlug ||
          s.langSlug === newLang ||
          s.lang?.toLowerCase().includes(newLang.toLowerCase())
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
      handleLeaveCall();
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

      {/* Top Navigation Bar (Mobile-friendly horizontal scrollbar-none) */}
      <header className="min-h-14 h-auto py-2 sm:py-0 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between shrink-0 z-40 gap-2 overflow-x-auto scrollbar-none">
        {/* Left: Room Title & Live Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <Link
            href="/dashboard"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="font-bold text-xs sm:text-sm md:text-base text-slate-100 truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[180px] md:max-w-xs">
              {room?.name}
            </h1>
            <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden xs:inline">Live</span>
            </span>
          </div>
        </div>

        {/* Center: LeetCode Trigger, View Switcher & Language Selector */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* 🏆 LeetCode Explorer Button (Hidden if room is a Mock Interview session) */}
          {!room?.name?.toLowerCase().includes("mock") && (
            <button
              onClick={() => setShowLeetCodeModal(true)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-lg transition shrink-0"
              title="Search LeetCode problems"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">LeetCode</span>
            </button>
          )}

          {/* Toggle Problem Description Panel */}
          {activeProblem && (
            <button
              onClick={() => setShowProblemPanel(!showProblemPanel)}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1.5 text-xs rounded-lg border transition shrink-0 ${
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
              className="bg-slate-800 border border-slate-700 text-xs text-indigo-300 font-medium rounded-lg px-2 sm:px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shrink-0"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-slate-900 text-slate-200">
                  {lang.label}
                </option>
              ))}
            </select>
          )}

          {/* View Mode Tabs (Single view buttons for mobile, Split for tablet/desktop) */}
          <div className="flex items-center bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/80 text-xs shrink-0">
            <button
              onClick={() => setViewMode("code")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition ${
                viewMode === "code"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Code Editor full view"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Editor</span>
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition ${
                isMobile ? "hidden" : "flex"
              } ${
                viewMode === "split"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Split view (Editor + Chat)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("notes")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition ${
                viewMode === "notes"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Collaborative notes view"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Notes</span>
            </button>
            <button
              onClick={() => {
                setViewMode("chat");
                setUnreadChatCount(0);
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md relative transition ${
                viewMode === "chat"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Chat view"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chat</span>
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[9px] text-white flex items-center justify-center font-bold">
                  {unreadChatCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setViewMode("whiteboard")}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md transition ${
                viewMode === "whiteboard"
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Collaborative Whiteboard view"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Board</span>
            </button>
          </div>
        </div>

        {/* Right: Join Code, Video Call, Invite, Export & Leave */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Join Code */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-lg text-xs font-mono transition shrink-0"
            title="Click to copy join code"
          >
            <span className="text-slate-400 font-sans hidden xl:inline">Code:</span>
            <span className="font-bold text-indigo-400 tracking-wider">
              {room?.joinCode}
            </span>
            {copiedCode ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {/* Mock Interview Countdown Timer */}
          <InterviewTimer
            socket={socketRef.current}
            roomId={roomId}
            userName={user?.name || "Candidate"}
          />

          {/* Interview Prep Hub Link */}
          <Link
            href="/interview-prep"
            target="_blank"
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 rounded-lg text-xs font-medium transition shrink-0"
            title="Open Interview Prep Hub (Blind 75 & STAR Guide)"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xl:inline">Prep Hub</span>
          </Link>

          {/* Voice & Video Call Header Action */}
          {!isInCall ? (
            <button
              onClick={handleJoinCall}
              disabled={isJoiningCall}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-medium transition shrink-0"
              title="Join Room Voice & Video Call"
            >
              <Video className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">
                {isJoiningCall ? "Joining..." : "Join Call"}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-1 rounded-lg text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-semibold hidden md:inline">In Call</span>
              <span className="text-slate-400 text-[11px]">
                ({Object.keys(callPeers).length + 1})
              </span>
              <button
                onClick={() => setCallTrayMinimized(!callTrayMinimized)}
                className="p-0.5 text-slate-400 hover:text-slate-200 transition"
                title={callTrayMinimized ? "Expand call window" : "Minimize call window"}
              >
                {callTrayMinimized ? (
                  <Maximize2 className="w-3 h-3" />
                ) : (
                  <Minimize2 className="w-3 h-3" />
                )}
              </button>
            </div>
          )}

          {/* Invite Button */}
          <button
            onClick={() => {
              setShowInviteModal(true);
              setInviteStatus({ loading: false, success: "", error: "" });
            }}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-lg text-xs font-medium transition shrink-0"
            title="Invite by email"
          >
            <Mail className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Invite</span>
          </button>

          {/* Export Session Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 rounded-lg text-xs font-medium transition shrink-0"
              title="Export session code and notes"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {showExportMenu && (
              <>
                {/* Backdrop to close on outside click */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      handleExportSession("markdown");
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                  >
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Full Session (.md)</div>
                      <div className="text-[10px] text-slate-400">Problem, code, notes & chat</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleExportSession("code");
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                  >
                    <Code2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Source Code File</div>
                      <div className="text-[10px] text-slate-400">
                        Raw .{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "java" ? "java" : "js"} file
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      handleExportSession("notes");
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-800 rounded-lg text-left transition"
                  >
                    <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Shared Notes Only</div>
                      <div className="text-[10px] text-slate-400">Markdown notes file</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

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
      <div ref={workspaceRef} className="flex-1 flex overflow-hidden">
        {/* 1. MONACO CODE EDITOR + LEETCODE PANEL + TESTCASES CONSOLE */}
        {(viewMode === "split" || viewMode === "code") && (
          <div
            style={{ width: viewMode === "split" ? `${splitPercent}%` : "100%" }}
            className="flex flex-col border-r border-slate-800 bg-[#1e1e1e] h-full overflow-hidden min-w-0"
          >
            {/* Split row: Problem Panel (Left) & Editor Pane (Right) */}
            <div className="flex-1 flex min-h-0 overflow-hidden min-w-0">
              {/* Collapsible LeetCode Problem Statement Panel (Overlay or full-width on mobile, split on desktop) */}
              {activeProblem && showProblemPanel && (
                <div
                  style={{ width: isMobile ? "100%" : `${problemSplitPercent}%` }}
                  className={`border-r border-slate-800 bg-slate-900/95 flex flex-col overflow-hidden min-w-0 ${
                    isMobile ? "absolute inset-0 z-30" : "shrink-0"
                  }`}
                >
                  <div className="h-9 bg-slate-900 border-b border-slate-800 px-3 flex items-center justify-between text-xs shrink-0">
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-bold text-slate-100 truncate">
                        #{activeProblem.questionFrontendId} {activeProblem.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
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
                      className="p-1 text-slate-400 hover:text-white rounded transition shrink-0 ml-1 bg-slate-800 sm:bg-transparent"
                      title="Close problem panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Formatted HTML Problem Statement with Margins & Testcase Borders */}
                  <div className="flex-1 p-3.5 sm:p-5 overflow-y-auto select-text custom-scrollbar">
                    <div
                      dangerouslySetInnerHTML={{ __html: activeProblem.content }}
                      className="leetcode-content max-w-none"
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

              {/* Resizable Divider between Problem & Editor (Hidden on mobile) */}
              {activeProblem && showProblemPanel && !isMobile && (
                <div
                  onPointerDown={handleStartProblemResize}
                  className="w-1.5 hover:w-2 bg-slate-800 hover:bg-indigo-500/80 active:bg-indigo-500 cursor-col-resize transition-all shrink-0 select-none z-10 flex items-center justify-center group"
                  title="Drag to resize problem description and editor"
                >
                  <div className="w-0.5 h-6 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
                </div>
              )}

              {/* Editor Workspace */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Responsive Editor Header Bar with Run & Submit Always Visible */}
                <div className="min-h-[40px] bg-slate-900 border-b border-slate-800 px-2 sm:px-3 py-1 flex items-center justify-between text-xs text-slate-400 shrink-0 gap-1.5 overflow-x-auto scrollbar-none">
                  {/* Left: File name */}
                  <div className="flex items-center gap-1.5 shrink min-w-0">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-300 truncate">
                      <Code2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                        solution.{language === "python" ? "py" : language === "cpp" ? "cpp" : language === "java" ? "java" : "js"}
                      </span>
                    </span>

                    {/* Peer Typing Presence Pill */}
                    {typingPeer && (
                      <span className="hidden xl:inline-flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-pulse font-medium shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {typingPeer} is typing...
                      </span>
                    )}
                  </div>

                  {/* Right Actions: Clean toolbar with Run & Submit */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {/* Reset starter code button */}
                    <button
                      onClick={handleResetCode}
                      className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700/60 shrink-0"
                      title="Reset to starter code"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Reset</span>
                    </button>

                    {/* 🚀 RUN CODE BUTTON */}
                    <button
                      onClick={handleRunCode}
                      disabled={isRunning || isSubmitting}
                      className="flex items-center gap-1 sm:gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 disabled:opacity-50 text-slate-200 border border-slate-700 font-semibold text-xs rounded-lg shadow-sm transition shrink-0"
                      title="Run code against test cases"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-200" />
                      <span>{isRunning ? "Running..." : "Run"}</span>
                    </button>

                    {/* 🏆 SUBMIT SOLUTION BUTTON */}
                    <button
                      onClick={handleSubmitSolution}
                      disabled={isRunning || isSubmitting}
                      className="flex items-center gap-1 sm:gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs rounded-lg shadow-sm transition shadow-emerald-600/20 shrink-0"
                      title="Run all testcases and submit to history"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
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
                    onMount={(editor, monaco) => {
                      editorRef.current = editor;

                      // Support Ctrl + / Cmd + and Ctrl - / Cmd - zoom
                      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Equal, () => {
                        setFontSize((s) => Math.min(26, s + 1));
                      });
                      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Minus, () => {
                        setFontSize((s) => Math.max(10, s - 1));
                      });
                    }}
                    onChange={handleCodeChange}
                    options={{
                      fontSize,
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
              {/* Drag Handle for Console Height */}
              {showConsole && (
                <div
                  onPointerDown={handleStartConsoleResize}
                  className="h-1.5 hover:h-2 bg-slate-800 hover:bg-indigo-500/80 active:bg-indigo-500 cursor-row-resize transition-all shrink-0 select-none flex items-center justify-center group"
                  title="Drag to resize console drawer height"
                >
                  <div className="h-0.5 w-10 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
                </div>
              )}

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

                  <button
                    onClick={() => {
                      setConsoleTab("ai");
                      setShowConsole(true);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition ${
                      consoleTab === "ai" && showConsole
                        ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>AI Coach</span>
                    {aiHistory.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
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
                <div
                  style={{ height: `${consoleHeight}px` }}
                  className="p-3 bg-slate-950/90 overflow-y-auto select-text custom-scrollbar"
                >
                  {/* TAB 1: TESTCASE (Prefilled from LeetCode) */}
                  {consoleTab === "testcase" && (
                    <div className="h-full flex flex-col">
                      {/* Case Tabs: Case 1, Case 2, Case 3, + */}
                      <div className="flex items-center gap-2 mb-2 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
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
                              ) : executionResult.status === "Compilation Error" || executionResult.compileError ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Compile Error</span>
                                </span>
                              ) : executionResult.status === "Wrong Answer" ? (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Wrong Answer</span>
                                </span>
                              ) : (
                                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>{executionResult.status}</span>
                                </span>
                              )}

                              {executionResult.passedCount !== undefined && !executionResult.compileError && executionResult.status !== "Compilation Error" && (
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

                          {/* 1. COMPILATION ERROR VIEW */}
                          {executionResult.compileError || executionResult.status === "Compilation Error" ? (
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>Compiler Error Diagnostics:</span>
                              </div>
                              <pre className="bg-slate-950 border border-rose-500/30 rounded-xl p-3.5 font-mono text-xs text-rose-300 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto select-text shadow-inner">
                                {executionResult.compileError || executionResult.output}
                              </pre>
                            </div>
                          ) : executionResult.runtimeError && executionResult.passedCount === 0 ? (
                            /* 2. RUNTIME ERROR CRASH VIEW */
                            <div className="space-y-2 mt-2">
                              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
                                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                                <span>Runtime Error / Stack Trace:</span>
                              </div>
                              <pre className="bg-slate-950 border border-rose-500/30 rounded-xl p-3.5 font-mono text-xs text-rose-300 leading-relaxed whitespace-pre-wrap max-h-52 overflow-y-auto select-text shadow-inner">
                                {executionResult.runtimeError || executionResult.output}
                              </pre>
                            </div>
                          ) : executionResult.results && executionResult.results.length > 0 ? (
                            /* 3. NORMAL TEST CASES BREAKDOWN */
                            <div className="space-y-2.5">
                              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 shrink-0">
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

                  {/* TAB 3: AI COACH (Gemini 3.8 Flash) */}
                  {consoleTab === "ai" && (
                    <div className="h-full flex flex-col justify-between space-y-2.5">
                      {/* Top Action Buttons Bar */}
                      <div className="flex items-center gap-1.5 flex-wrap shrink-0 pb-2 border-b border-slate-800/80">
                        <button
                          onClick={() => handleAskAICoach("hint")}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium rounded-lg transition disabled:opacity-50"
                          title="Get progressive hints (1: Intuition -> 2: Algorithm -> 3: Edge cases)"
                        >
                          <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                          <span>Get Hint ({hintLevel}/3)</span>
                        </button>

                        <button
                          onClick={() => handleAskAICoach("explain_bug")}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium rounded-lg transition disabled:opacity-50"
                          title="Explain errors or failed test cases"
                        >
                          <Bug className="w-3.5 h-3.5 text-rose-400" />
                          <span>Explain Bug</span>
                        </button>

                        <button
                          onClick={() => handleAskAICoach("complexity")}
                          disabled={aiLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium rounded-lg transition disabled:opacity-50"
                          title="Analyze Time and Space Big-O complexity"
                        >
                          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Analyze Complexity</span>
                        </button>

                        {aiHistory.length > 0 && (
                          <button
                            onClick={() => setAiHistory([])}
                            className="ml-auto text-[10px] text-slate-500 hover:text-slate-300 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {/* AI Response Display Area */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs text-slate-200 select-text custom-scrollbar">
                        {aiLoading && (
                          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-indigo-500/30 text-indigo-300 animate-pulse">
                            <Bot className="w-4 h-4 animate-spin" />
                            <span>Gemini AI is analyzing your code and problem...</span>
                          </div>
                        )}

                        {aiHistory.length === 0 && !aiLoading && (
                          <div className="text-center py-6 text-slate-500 space-y-1">
                            <Bot className="w-8 h-8 text-indigo-400/60 mx-auto mb-2" />
                            <p className="font-medium text-slate-400">Your AI Coding Coach is ready</p>
                            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                              Click a button above for progressive hints, bug explanations, and complexity analysis, or ask any question below.
                            </p>
                          </div>
                        )}

                        {aiHistory.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 shadow-sm"
                          >
                            <div className="flex items-center justify-between text-[11px] pb-1.5 border-b border-slate-800/60">
                              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" />
                                {entry.title}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(entry.content);
                                    setCopiedAIId(entry.id);
                                    toast.success("AI Coach response copied! 📋");
                                    setTimeout(() => setCopiedAIId(null), 2000);
                                  }}
                                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] transition"
                                  title="Copy response"
                                >
                                  {copiedAIId === entry.id ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                                  {entry.source}
                                </span>
                                <span className="text-slate-500 text-[10px]">{entry.timestamp}</span>
                              </div>
                            </div>
                            <FormattedAIMessage content={entry.content} />
                          </div>
                        ))}
                      </div>

                      {/* Interactive Prompt Input */}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!aiQuestion.trim() || aiLoading) return;
                          handleAskAICoach("chat", aiQuestion.trim());
                        }}
                        className="flex items-center gap-2 pt-2 border-t border-slate-800 shrink-0"
                      >
                        <input
                          type="text"
                          value={aiQuestion}
                          onChange={(e) => setAiQuestion(e.target.value)}
                          placeholder="Ask AI Coach a question about this problem or code..."
                          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          disabled={!aiQuestion.trim() || aiLoading}
                          className="p-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-medium flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3" />
                          <span>Ask</span>
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Draggable Divider between Editor and Chat in Split Mode */}
        {viewMode === "split" && (
          <div
            onPointerDown={handleStartSplitResize}
            className="w-1.5 hover:w-2 bg-slate-800 hover:bg-indigo-500/80 active:bg-indigo-500 cursor-col-resize transition-all shrink-0 select-none z-10 flex items-center justify-center group hidden md:flex"
            title="Drag to resize editor and chat panes"
          >
            <div className="w-0.5 h-8 bg-slate-600 group-hover:bg-white rounded-full transition-colors" />
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
            style={{ width: viewMode === "split" ? `${100 - splitPercent}%` : "100%" }}
            className="flex flex-col bg-slate-950 h-full overflow-hidden min-w-0"
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

        {/* 4. COLLABORATIVE WHITEBOARD VIEW */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${viewMode === "whiteboard" ? "flex" : "hidden"}`}>
          <Whiteboard socket={socketRef.current} roomId={roomId} initialElements={room?.whiteboard || []} />
        </div>
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

      {/* 📹 WEBRTC VOICE & VIDEO CALL MESH TRAY / DOCK */}
      {isInCall && (
        <div
          ref={callCardRef}
          style={
            !isCallMaximized
              ? {
                  ...(callPos.x !== null && callPos.y !== null
                    ? { left: `${callPos.x}px`, top: `${callPos.y}px` }
                    : {}),
                  width: `${Math.min(callCustomSize.width, typeof window !== "undefined" ? window.innerWidth - 24 : 960)}px`,
                  height: `${Math.min(callCustomSize.height, typeof window !== "undefined" ? window.innerHeight - 24 : 640)}px`,
                  maxWidth: "calc(100vw - 24px)",
                  maxHeight: "calc(100vh - 24px)",
                }
              : undefined
          }
          className={`${
            isCallMaximized
              ? "fixed inset-2 sm:inset-4 z-50"
              : callPos.x !== null
              ? "fixed z-50"
              : "fixed bottom-4 right-4 z-50"
          }`}
        >
          {callTrayMinimized ? (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-2 shadow-2xl flex items-center gap-2">
              <div
                onPointerDown={handleStartCallDrag}
                className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold px-2 cursor-grab active:cursor-grabbing select-none"
                title="Drag to reposition call pill"
              >
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Call ({Object.keys(callPeers).length + 1})</span>
              </div>

              <button
                onClick={handleToggleMic}
                className={`p-2 rounded-full transition ${
                  micMuted
                    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title={micMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={handleToggleCam}
                className={`p-2 rounded-full transition ${
                  camOff
                    ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700"
                }`}
                title={camOff ? "Turn On Camera" : "Turn Off Camera"}
              >
                {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCallTrayMinimized(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 transition"
                title="Expand video call window"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              <button
                onClick={handleLeaveCall}
                className="p-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition ml-1"
                title="Leave voice & video call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              className={`w-full h-full bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3.5 shadow-2xl flex flex-col justify-between relative transition-shadow ${
                isCallMaximized ? "border-indigo-500/40 shadow-indigo-950/40" : ""
              }`}
            >
              {/* Draggable Header */}
              <div
                onPointerDown={!isCallMaximized ? handleStartCallDrag : undefined}
                className={`flex items-center justify-between border-b border-slate-800 pb-2.5 select-none shrink-0 ${
                  !isCallMaximized ? "cursor-grab active:cursor-grabbing" : ""
                }`}
                title={!isCallMaximized ? "Click and drag to move video mesh anywhere" : ""}
              >
                <div className="flex items-center gap-2">
                  {!isCallMaximized && (
                    <div className="flex items-center gap-1 text-slate-400 bg-slate-800/90 px-1.5 py-0.5 rounded cursor-grab active:cursor-grabbing border border-slate-700/60 shadow-xs">
                      <Move className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-[10px] font-medium text-slate-300">Move</span>
                    </div>
                  )}
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Study Call Mesh
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full font-mono">
                    {Object.keys(callPeers).length + 1} {Object.keys(callPeers).length === 0 ? "peer" : "peers"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Reset Position (if moved from corner) */}
                  {callPos.x !== null && !isCallMaximized && (
                    <button
                      onClick={() => setCallPos({ x: null, y: null })}
                      className="px-2 py-1 text-[10px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition border border-slate-800 font-medium"
                      title="Reset position to bottom-right corner"
                    >
                      Reset Pos
                    </button>
                  )}

                  {/* Size Presets (Compact, Medium, Large) */}
                  {!isCallMaximized && (
                    <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => {
                          setCallCustomSize({ width: 440, height: 320 });
                        }}
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition ${
                          callCustomSize.width <= 480
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Compact size (440x320)"
                      >
                        Sm
                      </button>
                      <button
                        onClick={() => {
                          setCallCustomSize({ width: 620, height: 440 });
                        }}
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition ${
                          callCustomSize.width > 480 && callCustomSize.width < 760
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Medium size (620x440)"
                      >
                        Md
                      </button>
                      <button
                        onClick={() => {
                          setCallCustomSize({ width: 880, height: 580 });
                        }}
                        className={`px-1.5 py-0.5 text-[10px] font-medium rounded transition ${
                          callCustomSize.width >= 760
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                        title="Large size (880x580)"
                      >
                        Lg
                      </button>
                    </div>
                  )}

                  {/* 🖥️ Dedicated Maximize / Restore Button */}
                  <button
                    onClick={() => setIsCallMaximized((prev) => !prev)}
                    className={`p-1.5 rounded-lg transition border ${
                      isCallMaximized
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800 border-slate-800"
                    }`}
                    title={isCallMaximized ? "Restore down to floating window" : "Maximize mesh to full screen"}
                  >
                    {isCallMaximized ? (
                      <Shrink className="w-3.5 h-3.5" />
                    ) : (
                      <Maximize2 className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* Minimize to Pill Button */}
                  <button
                    onClick={() => {
                      setIsCallMaximized(false);
                      setCallTrayMinimized(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
                    title="Minimize to floating pill"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Video Grid or Pinned Spotlight View */}
              {pinnedPeerId && callPeers[pinnedPeerId] ? (
                <div className="flex-1 min-h-0 relative w-full h-full rounded-xl overflow-hidden py-1">
                  {/* Spotlight Pinned Peer Video */}
                  <PeerVideoTile
                    peer={callPeers[pinnedPeerId]}
                    isPinned={true}
                    onTogglePin={() => setPinnedPeerId(null)}
                  />

                  {/* Picture-in-Picture Floating Overlay */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 z-20 max-w-[60%]">
                    {/* Local Camera Tile PiP */}
                    <div className="w-28 sm:w-36 aspect-video bg-slate-900 border-2 border-indigo-500/80 rounded-lg overflow-hidden shadow-2xl relative">
                      <video
                        ref={(el) => {
                          localVideoRef.current = el;
                          if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                            el.srcObject = localStreamRef.current;
                            el.play().catch(() => {});
                          }
                        }}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${isScreenSharing ? "" : "-scale-x-100"} ${
                          !camOff ? "block" : "hidden"
                        }`}
                      />
                      {camOff && (
                        <div className="w-full h-full flex items-center justify-center bg-slate-900 text-[10px] text-slate-400 font-medium">
                          You (Cam off)
                        </div>
                      )}
                      <span className="absolute bottom-1 left-1 bg-slate-950/80 text-white text-[9px] px-1 rounded truncate max-w-[80px]">
                        You
                      </span>
                    </div>

                    {/* Other unpinned peers if any */}
                    {Object.values(callPeers)
                      .filter((p) => p.socketId !== pinnedPeerId)
                      .map((otherPeer) => (
                        <div key={otherPeer.socketId} className="w-28 sm:w-36 aspect-video shadow-2xl">
                          <PeerVideoTile
                            peer={otherPeer}
                            isPinned={false}
                            onTogglePin={() => setPinnedPeerId(otherPeer.socketId)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className={`flex-1 min-h-0 w-full h-full grid gap-2.5 overflow-hidden py-1 ${
                    Object.keys(callPeers).length === 0
                      ? "grid-cols-1 grid-rows-1 max-w-2xl mx-auto"
                      : Object.keys(callPeers).length === 1
                      ? "grid-cols-1 sm:grid-cols-2 grid-rows-1"
                      : Object.keys(callPeers).length <= 3
                      ? "grid-cols-2 grid-rows-2"
                      : isCallMaximized
                      ? "grid-cols-2 md:grid-cols-3 xl:grid-cols-4 auto-rows-fr"
                      : "grid-cols-2 sm:grid-cols-3 auto-rows-fr"
                  }`}
                >
                  {/* Local Video Tile */}
                  <div className="relative bg-slate-900 border border-indigo-500/30 rounded-xl overflow-hidden w-full h-full min-h-0 flex items-center justify-center shadow-md">
                    <video
                      ref={(el) => {
                        localVideoRef.current = el;
                        if (el && localStreamRef.current && el.srcObject !== localStreamRef.current) {
                          el.srcObject = localStreamRef.current;
                          el.play().catch(() => {});
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${isScreenSharing ? "" : "-scale-x-100"} ${
                        !camOff ? "block" : "hidden"
                      }`}
                    />
                    {camOff && (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-2 w-full h-full">
                        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-sm shadow-inner">
                          {user?.name ? user.name[0].toUpperCase() : "Y"}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">You (Camera off)</span>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
                      <span className="bg-indigo-600/90 text-white text-[10px] font-medium px-1.5 py-0.5 rounded truncate max-w-[120px]">
                        You {isScreenSharing ? "(Screen)" : ""}
                      </span>
                      <span
                        className={`p-1 rounded text-[10px] ${
                          micMuted ? "bg-rose-500/90 text-white" : "bg-slate-950/80 text-emerald-400"
                        }`}
                      >
                        {micMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                      </span>
                    </div>
                  </div>

                  {/* Remote Peers Video Tiles */}
                  {Object.values(callPeers).map((peer) => (
                    <PeerVideoTile
                      key={peer.socketId}
                      peer={peer}
                      isPinned={false}
                      onTogglePin={() => setPinnedPeerId(peer.socketId)}
                    />
                  ))}
                </div>
              )}

              {/* Action Controls Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleToggleMic}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                      micMuted
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                    title={micMuted ? "Unmute Mic" : "Mute Mic"}
                  >
                    {micMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span className="hidden sm:inline">{micMuted ? "Unmute" : "Mute"}</span>
                  </button>

                  <button
                    onClick={handleToggleCam}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                      camOff
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                    title={camOff ? "Turn On Camera" : "Turn Off Camera"}
                  >
                    {camOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span className="hidden sm:inline">{camOff ? "Camera" : "Stop Cam"}</span>
                  </button>

                  <button
                    onClick={handleToggleScreenShare}
                    className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition ${
                      isScreenSharing
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    }`}
                    title={isScreenSharing ? "Stop Sharing Screen" : "Share Screen"}
                  >
                    <ScreenShare className="w-4 h-4" />
                    <span className="hidden sm:inline">{isScreenSharing ? "Stop Share" : "Share"}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLeaveCall}
                    className="p-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                    title="Leave Call"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Leave</span>
                  </button>
                </div>
              </div>

              {/* 📐 Freeform Resize Grip Handle (Bottom-Right Corner) */}
              {!isCallMaximized && (
                <div
                  onPointerDown={handleStartCallResize}
                  className="absolute bottom-1 right-1 w-5 h-5 cursor-se-resize flex items-center justify-center text-slate-500 hover:text-indigo-400 active:text-indigo-300 transition group select-none z-20"
                  title="Click and drag corner to customize window size"
                >
                  <svg
                    className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <circle cx="19" cy="19" r="2" />
                    <circle cx="19" cy="13" r="2" />
                    <circle cx="13" cy="19" r="2" />
                    <circle cx="19" cy="7" r="2" />
                    <circle cx="13" cy="13" r="2" />
                    <circle cx="7" cy="19" r="2" />
                  </svg>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}