"use client";

import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Bot,
  User,
  Sparkles,
  Send,
  Timer,
  Award,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  Loader2,
  Volume1,
  RotateCcw,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import InterviewReportView from "./InterviewReportView";

// 📚 Smart technical vocabulary dictionary and auto-capitalizer for cleaner speech-to-text
const TECH_DICTIONARY = [
  // Languages
  [/\bjavascript\b/gi, "JavaScript"],
  [/\btypescript\b/gi, "TypeScript"],
  [/\bpython\b/gi, "Python"],
  [/\bgolang\b/gi, "Golang"],
  [/\bruby\b/gi, "Ruby"],
  [/\brust\b/gi, "Rust"],
  [/\bphp\b/gi, "PHP"],
  [/\bc\s*\+\+/gi, "C++"],
  [/\bc\s*sharp\b/gi, "C#"],

  // Frontend frameworks & libs
  [/\breact\s*native\b/gi, "React Native"],
  [/\breact\s*js\b/gi, "React"],
  [/\breact\b/gi, "React"],
  [/\bnext\s*js\b/gi, "Next.js"],
  [/\bnextjs\b/gi, "Next.js"],
  [/\bvue\s*js\b/gi, "Vue"],
  [/\bvue\b/gi, "Vue"],
  [/\bangular\b/gi, "Angular"],
  [/\bsvelte\b/gi, "Svelte"],
  [/\btailwind\s*css\b/gi, "Tailwind CSS"],
  [/\btailwind\b/gi, "Tailwind"],
  [/\bbootstrap\b/gi, "Bootstrap"],

  // Backend & Servers
  [/\bnode\s*js\b/gi, "Node.js"],
  [/\bnodejs\b/gi, "Node.js"],
  [/\bexpress\s*js\b/gi, "Express"],
  [/\bexpress\b/gi, "Express"],
  [/\bnest\s*js\b/gi, "NestJS"],
  [/\bdjango\b/gi, "Django"],
  [/\bflask\b/gi, "Flask"],
  [/\bfast\s*api\b/gi, "FastAPI"],
  [/\bspring\s*boot\b/gi, "Spring Boot"],

  // Web & Protocols
  [/\bhtml\s*5\b/gi, "HTML5"],
  [/\bhtml\b/gi, "HTML"],
  [/\bcss\s*3\b/gi, "CSS3"],
  [/\bcss\b/gi, "CSS"],
  [/\brest\s*apis?\b/gi, "REST API"],
  [/\brestful\s*apis?\b/gi, "RESTful API"],
  [/\bgraphql\b/gi, "GraphQL"],
  [/\bgrpc\b/gi, "gRPC"],
  [/\bweb\s*sockets?\b/gi, "WebSocket"],
  [/\bhttp\b/gi, "HTTP"],
  [/\bhttps\b/gi, "HTTPS"],
  [/\btcp\b/gi, "TCP"],
  [/\budp\b/gi, "UDP"],
  [/\bdns\b/gi, "DNS"],
  [/\burl\b/gi, "URL"],
  [/\burls\b/gi, "URLs"],
  [/\bjson\b/gi, "JSON"],
  [/\bjwt\b/gi, "JWT"],
  [/\bcors\b/gi, "CORS"],

  // Databases & Storage
  [/\bsql\b/gi, "SQL"],
  [/\bnosql\b/gi, "NoSQL"],
  [/\bmongodb\b/gi, "MongoDB"],
  [/\bpostgres(ql)?\b/gi, "PostgreSQL"],
  [/\bmysql\b/gi, "MySQL"],
  [/\bsqlite\b/gi, "SQLite"],
  [/\bredis\b/gi, "Redis"],
  [/\bprisma\b/gi, "Prisma"],

  // Concepts & Architecture
  [/\bdom\b/gi, "DOM"],
  [/\bvdom\b/gi, "Virtual DOM"],
  [/\boops?\b/gi, "OOP"],
  [/\bsolid\b/gi, "SOLID"],
  [/\bmvc\b/gi, "MVC"],
  [/\bcrud\b/gi, "CRUD"],
  [/\bacid\b/gi, "ACID"],
  [/\bci\s*\/\s*cd\b/gi, "CI/CD"],
  [/\bfront\s*end\b/gi, "frontend"],
  [/\bback\s*end\b/gi, "backend"],
  [/\bfull\s*stack\b/gi, "fullstack"],

  // React specific
  [/\buse\s*state\b/gi, "useState"],
  [/\buse\s*effect\b/gi, "useEffect"],
  [/\buse\s*context\b/gi, "useContext"],
  [/\buse\s*memo\b/gi, "useMemo"],
  [/\buse\s*callback\b/gi, "useCallback"],
  [/\buse\s*ref\b/gi, "useRef"],
  [/\bprops\b/gi, "props"],

  // Tools & Cloud
  [/\bgit\s*hub\b/gi, "GitHub"],
  [/\bgit\s*lab\b/gi, "GitLab"],
  [/\bgit\b/gi, "Git"],
  [/\bdocker\b/gi, "Docker"],
  [/\bkubernetes\b/gi, "Kubernetes"],
  [/\bk8s\b/gi, "K8s"],
  [/\baws\b/gi, "AWS"],
  [/\bgcp\b/gi, "GCP"],
  [/\bazure\b/gi, "Azure"],
  [/\brag\b/gi, "RAG"],
  [/\bllms?\b/gi, "LLM"],
  [/\bgemini\b/gi, "Gemini"],
];

const ACCENTS = [
  { code: "en-IN", label: "English (India)" },
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "en-AU", label: "English (Australia)" },
  { code: "en-CA", label: "English (Canada)" },
];

const cleanSpokenText = (raw) => {
  if (!raw) return "";
  let text = raw.trim();

  // 1. Spacing cleanup before punctuation: "hello , world" -> "hello, world"
  text = text.replace(/\s+([,.:;?!])/g, "$1");

  // 2. Ensure single space after punctuation: "hello.world" -> "hello. world"
  text = text.replace(/([.?!])([A-Za-z])/g, "$1 $2");

  // 3. Capitalize first letter of string
  if (text.length > 0) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // 4. Capitalize standalone 'I' and contractions
  text = text
    .replace(/\bi\b/g, "I")
    .replace(/\bi'm\b/g, "I'm")
    .replace(/\bi've\b/g, "I've")
    .replace(/\bi'll\b/g, "I'll")
    .replace(/\bi'd\b/g, "I'd");

  // 5. Capitalize after sentence-ending punctuation (., ?, !)
  text = text.replace(/(^\s*|[.?!]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  // 6. Standardize technical terminology from dictionary
  for (const [pattern, replacement] of TECH_DICTIONARY) {
    text = text.replace(pattern, replacement);
  }

  // 7. Collapse any remaining double spaces
  return text.replace(/\s{2,}/g, " ");
};

export default function AIVoiceInterviewModal({ track, onClose, onInterviewCompleted }) {
  const [transcript, setTranscript] = useState([]);
  const [candidateSpeech, setCandidateSpeech] = useState("");
  const [interimSpeech, setInterimSpeech] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState("connecting"); // 'connecting' | 'speaking' | 'listening' | 'thinking' | 'idle'
  const [isVoiceOutputEnabled, setIsVoiceOutputEnabled] = useState(true);
  const [speechLang, setSpeechLang] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("studyroom_interview_voice_lang");
      if (saved) return saved;
      const navLang = navigator.language || "";
      if (navLang.startsWith("en-IN")) return "en-IN";
      if (navLang.startsWith("en-GB")) return "en-GB";
      if (navLang.startsWith("en-AU")) return "en-AU";
      if (navLang.startsWith("en-CA")) return "en-CA";
    }
    return "en-US";
  });
  const [pauseDetected, setPauseDetected] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [reportData, setReportData] = useState(null);

  const recognitionRef = useRef(null);
  const chatBottomRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const isSpeechActiveRef = useRef(false);
  const manualPrefixRef = useRef("");
  const pauseTimerRef = useRef(null);

  // 1. Initialize Speech Recognition & Start Gemini Interview
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = speechLang;

        // Clean, structured speech capture avoiding duplication across all chunks
        recognition.onresult = (event) => {
          let finalized = "";
          let interim = "";

          for (let i = 0; i < event.results.length; ++i) {
            const part = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalized += part + " ";
            } else {
              interim += part + " ";
            }
          }

          const basePrefix = manualPrefixRef.current;
          // Clean the entire stream continuously (finalized + interim in-flight words)
          const fullRaw = (finalized + interim).trim();
          const cleanedFull = cleanSpokenText(fullRaw);
          const cleanedInterim = cleanSpokenText(interim.trim());

          const combined = (basePrefix ? basePrefix + " " + cleanedFull : cleanedFull)
            .replace(/\s+/g, " ")
            .trim();

          setCandidateSpeech(combined);
          setInterimSpeech(cleanedInterim);

          // Detect natural candidate pause to assist with prompt feedback
          if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
          setPauseDetected(false);
          if (combined.length > 15) {
            pauseTimerRef.current = setTimeout(() => {
              setPauseDetected(true);
            }, 2500);
          }
        };

        recognition.onerror = (err) => {
          console.warn("Speech recognition error:", err.error);
          setIsListening(false);
          isSpeechActiveRef.current = false;
        };

        recognition.onend = () => {
          if (isSpeechActiveRef.current) {
            try {
              recognition.start();
            } catch (e) {}
          } else {
            setIsListening(false);
            setInterimSpeech("");
          }
        };

        recognitionRef.current = recognition;
      }
    }

    // Start Timer
    timerIntervalRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    // Call Backend to Start Interview Session
    const initiateInterview = async () => {
      setGeminiStatus("connecting");
      try {
        const data = await apiRequest("/mock-interview/start", {
          method: "POST",
          body: JSON.stringify({
            trackId: track.id,
            title: track.title,
            topic: track.topic,
            difficulty: track.difficulty,
            focusAreas: track.focusAreas,
          }),
        });

        if (data.greeting) {
          const firstMessage = {
            speaker: "interviewer",
            text: data.greeting,
            timestamp: new Date(),
          };
          setTranscript([firstMessage]);
          speakText(data.greeting);
        }
      } catch (err) {
        toast.error("Failed to connect to AI Interviewer: " + err.message);
        setGeminiStatus("idle");
      }
    };

    initiateInterview();

    return () => {
      clearInterval(timerIntervalRef.current);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        isSpeechActiveRef.current = false;
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [track]);

  // 2. Auto-scroll to latest dialogue
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript, candidateSpeech]);

  // 3. Text-To-Speech (Gemini speaking)
  const speakText = (text) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setGeminiStatus("listening");
      return;
    }

    window.speechSynthesis.cancel();

    if (!isVoiceOutputEnabled) {
      setGeminiStatus("listening");
      return;
    }

    setGeminiStatus("speaking");
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";

    // Prefer high quality English voices if available
    const voices = window.speechSynthesis.getVoices();
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha")))
    );
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }

    utterance.onend = () => {
      setGeminiStatus("listening");
    };

    utterance.onerror = () => {
      setGeminiStatus("listening");
    };

    window.speechSynthesis.speak(utterance);
  };

  // 4. Speech Language Switcher
  const handleLanguageChange = (newLang) => {
    setSpeechLang(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("studyroom_interview_voice_lang", newLang);
    }
    if (recognitionRef.current) {
      recognitionRef.current.lang = newLang;
      if (isListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
    const found = ACCENTS.find((a) => a.code === newLang);
    toast.success(`Voice accent set to ${found ? found.label : newLang}`);
  };

  // 5. Clear / Reset Candidate Input Bar
  const handleClearSpeech = () => {
    setCandidateSpeech("");
    setInterimSpeech("");
    manualPrefixRef.current = "";
    setPauseDetected(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    toast.info("Cleared voice input");
  };

  // 6. Toggle Microphone
  const toggleListening = () => {
    if (!speechSupported) {
      toast.info("Microphone recognition is not supported in this browser. You can type your responses!");
      return;
    }

    if (isListening) {
      isSpeechActiveRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
      setInterimSpeech("");
      setPauseDetected(false);
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    } else {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      try {
        manualPrefixRef.current = candidateSpeech.trim();
        isSpeechActiveRef.current = true;
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info("Microphone listening... Speak clearly", { icon: "🎙️" });
      } catch (err) {
        console.warn("Could not start speech recognition:", err);
        setIsListening(false);
        isSpeechActiveRef.current = false;
      }
    }
  };

  // 7. Send Candidate Answer to Gemini
  const handleSendAnswer = async () => {
    const speech = candidateSpeech.trim();
    if (!speech) {
      toast.error("Please speak or type your answer before sending!");
      return;
    }

    // Stop microphone temporarily while Gemini thinks
    if (isListening) {
      isSpeechActiveRef.current = false;
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      setIsListening(false);
    }

    setInterimSpeech("");
    setPauseDetected(false);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    const candidateMsg = {
      speaker: "candidate",
      text: speech,
      timestamp: new Date(),
    };

    const updatedTranscript = [...transcript, candidateMsg];
    setTranscript(updatedTranscript);
    setCandidateSpeech("");
    manualPrefixRef.current = "";
    setGeminiStatus("thinking");

    try {
      const data = await apiRequest("/mock-interview/turn", {
        method: "POST",
        body: JSON.stringify({
          topic: track.topic,
          difficulty: track.difficulty,
          title: track.title,
          transcript: updatedTranscript,
          candidateSpeech: speech,
          focusAreas: track.focusAreas,
        }),
      });

      if (data.reply) {
        const interviewerMsg = {
          speaker: "interviewer",
          text: data.reply,
          timestamp: new Date(),
        };
        setTranscript([...updatedTranscript, interviewerMsg]);
        speakText(data.reply);
      } else {
        setGeminiStatus("listening");
      }
    } catch (err) {
      toast.error("Error communicating with Gemini: " + err.message);
      setGeminiStatus("listening");
    }
  };

  // 6. End Interview & Request Comprehensive Report
  const handleEndInterview = async () => {
    if (transcript.length < 2) {
      toast.error("Please answer at least one question before ending the interview!");
      setShowEndConfirm(false);
      return;
    }

    setIsEnding(true);
    setShowEndConfirm(false);

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (recognitionRef.current) {
      isSpeechActiveRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    try {
      const data = await apiRequest("/mock-interview/end", {
        method: "POST",
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          topic: track.topic,
          difficulty: track.difficulty,
          transcript,
          duration: elapsedSeconds,
        }),
      });

      if (data.interview) {
        setReportData(data.interview);
        toast.success("Interview finished! Your detailed evaluation report is ready! 🏆", { duration: 5000 });
        if (onInterviewCompleted) {
          onInterviewCompleted(data.interview);
        }
      }
    } catch (err) {
      toast.error("Failed to generate report: " + err.message);
    } finally {
      setIsEnding(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Render Full Detailed Evaluation Report if completed
  if (reportData) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          <InterviewReportView
            interview={reportData}
            onClose={onClose}
            onRetake={() => {
              setReportData(null);
              setTranscript([]);
              setCandidateSpeech("");
              setElapsedSeconds(0);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none">
      <div className="w-full max-w-4xl h-[94vh] max-h-[850px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <div className="h-16 px-4 sm:px-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 truncate">{track.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shrink-0">
                  {track.difficulty}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Topic: <strong className="text-slate-300">{track.topic}</strong> • AI Voice Interviewer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Spoken Accent / Locale Selector for clean voice recognition */}
            {speechSupported && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
                <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select
                  value={speechLang}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
                  title="Select your spoken accent for cleaner voice recognition"
                >
                  {ACCENTS.map((acc) => (
                    <option key={acc.code} value={acc.code} className="bg-slate-900 text-slate-200">
                      {acc.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Live Timer Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono">
              <Timer className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatTimer(elapsedSeconds)}</span>
            </div>

            {/* Toggle AI Speech Audio Output */}
            <button
              onClick={() => {
                if (isVoiceOutputEnabled) {
                  if (typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                  setIsVoiceOutputEnabled(false);
                  toast.info("AI Voice Output Muted");
                } else {
                  setIsVoiceOutputEnabled(true);
                  toast.success("AI Voice Output Enabled");
                }
              }}
              className={`p-2 rounded-xl border transition ${
                isVoiceOutputEnabled
                  ? "bg-slate-800 text-indigo-300 border-slate-700 hover:bg-slate-700"
                  : "bg-slate-950 text-slate-500 border-slate-800 hover:text-slate-300"
              }`}
              title={isVoiceOutputEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
            >
              {isVoiceOutputEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* End Interview Button */}
            <button
              onClick={() => setShowEndConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold transition"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">End & Evaluate</span>
            </button>

            {/* Close without saving */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gemini Interactive Avatar & State Banner */}
        <div className="py-4 px-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Visual Animated Orb */}
            <div className="relative">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  geminiStatus === "speaking"
                    ? "bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/40 animate-pulse scale-105"
                    : geminiStatus === "thinking"
                    ? "bg-gradient-to-tr from-amber-500 to-indigo-600 shadow-md shadow-amber-500/30 animate-spin"
                    : geminiStatus === "listening"
                    ? "bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/30"
                    : "bg-slate-800"
                }`}
              >
                <Bot className="w-6 h-6 text-white" />
              </div>
              {geminiStatus === "speaking" && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-200">Gemini Staff Interviewer</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 ${
                    geminiStatus === "speaking"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : geminiStatus === "thinking"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : geminiStatus === "listening"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {geminiStatus === "speaking"
                    ? "Speaking..."
                    : geminiStatus === "thinking"
                    ? "Evaluating Answer..."
                    : geminiStatus === "listening"
                    ? "Listening for your response..."
                    : "Ready"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Answer verbally using your microphone, or type your response below.
              </p>
            </div>
          </div>

          {/* Sound Wave Animation Visualizer */}
          <div className="flex items-center gap-1 h-6 px-3 py-1 bg-slate-900/80 rounded-full border border-slate-800">
            {[40, 75, 100, 60, 30, 85, 50].map((h, idx) => (
              <span
                key={idx}
                style={{
                  height: geminiStatus === "speaking" || isListening ? `${h}%` : "20%",
                  transition: "height 0.15s ease",
                }}
                className={`w-1 rounded-full ${
                  geminiStatus === "speaking"
                    ? "bg-indigo-400"
                    : isListening
                    ? "bg-emerald-400"
                    : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Live Conversation Dialogue Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar select-text">
          {transcript.map((msg, index) => {
            const isInterviewer = msg.speaker === "interviewer";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isInterviewer ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isInterviewer
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  }`}
                >
                  {isInterviewer ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-1 ${
                    isInterviewer
                      ? "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-sm shadow-md"
                      : "bg-emerald-950/40 text-emerald-100 border border-emerald-500/30 rounded-tr-sm shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 text-[10px] opacity-70">
                    <span className="font-semibold uppercase tracking-wider">
                      {isInterviewer ? "Gemini Interviewer" : "You (Candidate)"}
                    </span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            );
          })}

          {/* Thinking / Evaluating Indicator Bubble */}
          {geminiStatus === "thinking" && (
            <div className="flex items-center gap-3 mr-auto">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Gemini is evaluating your response and preparing follow-up...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Live Speech Recognition Transcript Box (when candidate is talking) */}
        {isListening && (
          <div className="px-4 py-2 bg-emerald-950/40 border-t border-emerald-500/25 flex items-center justify-between text-xs text-emerald-300 shrink-0 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-[11px] font-semibold text-emerald-400 shrink-0">Hearing:</span>
              <span className="italic text-emerald-200 truncate font-mono text-[11px]">
                {interimSpeech ? `"${interimSpeech}"` : "Listening to microphone..."}
              </span>
            </div>
            {pauseDetected ? (
              <span className="text-[10px] text-amber-300 font-medium px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 shrink-0 animate-pulse">
                💡 Paused — Click Send when ready
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
                Click Send Response or press Enter
              </span>
            )}
          </div>
        )}

        {/* Bottom Interaction Area: Mic & Text Submission */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendAnswer();
            }}
            className="flex items-center gap-2"
          >
            {/* Microphone Toggle Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-2xl flex items-center justify-center transition-all ${
                isListening
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 scale-105 animate-pulse"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/25"
              }`}
              title={isListening ? "Stop Microphone" : "Speak via Microphone"}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Input / Live Transcript Bar */}
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={candidateSpeech}
                onChange={(e) => setCandidateSpeech(e.target.value)}
                placeholder={
                  isListening
                    ? "Listening... Speak naturally (words appear here live)"
                    : "Type or speak your answer to Gemini..."
                }
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-4 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
              />
              {candidateSpeech && (
                <button
                  type="button"
                  onClick={handleClearSpeech}
                  className="absolute right-3 p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                  title="Clear speech / reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Send Answer Button */}
            <button
              type="submit"
              disabled={!candidateSpeech.trim() || geminiStatus === "thinking"}
              className="p-2.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send Response</span>
            </button>
          </form>
        </div>

        {/* Confirmation Modal to End Interview */}
        {showEndConfirm && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-100">End & Evaluate Interview?</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Gemini will grade all your answers against senior engineering rubrics and generate your full scorecard report.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEndConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Continue Interview
                </button>
                <button
                  type="button"
                  onClick={handleEndInterview}
                  disabled={isEnding}
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/25 transition"
                >
                  {isEnding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}
                  <span>{isEnding ? "Evaluating..." : "Generate Report"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
