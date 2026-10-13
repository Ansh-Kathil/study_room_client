"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Plus,
  ChevronDown,
  Sparkles,
  Users,
  AlertCircle,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/sound";

const PRESETS = [
  { label: "15 min", seconds: 15 * 60, desc: "Speed / Debug" },
  { label: "30 min", seconds: 30 * 60, desc: "Phone Screen" },
  { label: "45 min", seconds: 45 * 60, desc: "FAANG Standard", default: true },
  { label: "60 min", seconds: 60 * 60, desc: "System / Deep Dive" },
];

export default function InterviewTimer({ socket, roomId, userName = "You" }) {
  const [totalTime, setTotalTime] = useState(45 * 60);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [activePreset, setActivePreset] = useState("45 min");
  const [isOpen, setIsOpen] = useState(false);
  const [syncWithRoom, setSyncWithRoom] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const timerRef = useRef(null);
  const popoverRef = useRef(null);
  const warned5MinRef = useRef(false);

  // Format MM:SS or HH:MM:SS
  const formatTime = (secs) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const seconds = secs % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Broadcast timer actions over socket
  const broadcastAction = useCallback(
    (action, customTimeLeft, customTotal, customRunning, customPreset) => {
      if (!socket || !roomId || !syncWithRoom) return;

      socket.emit("mock_timer_action", {
        roomId,
        action,
        timeLeft: customTimeLeft ?? timeLeft,
        totalTime: customTotal ?? totalTime,
        isRunning: customRunning ?? isRunning,
        presetName: customPreset ?? activePreset,
      });
    },
    [socket, roomId, syncWithRoom, timeLeft, totalTime, isRunning, activePreset]
  );

  // Handle incoming timer sync from peers
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleTimerSync = (data) => {
      if (!syncWithRoom) return;

      const { action, timeLeft: syncTimeLeft, totalTime: syncTotal, isRunning: syncRunning, presetName, senderName } = data;

      setTimeLeft(syncTimeLeft);
      setTotalTime(syncTotal);
      setIsRunning(syncRunning);
      if (presetName) setActivePreset(presetName);

      if (action === "start") {
        toast.info(`⏱️ ${senderName} started the interview timer (${Math.round(syncTimeLeft / 60)}m)`);
      } else if (action === "pause") {
        toast.info(`⏸️ ${senderName} paused the interview timer`);
      } else if (action === "reset") {
        warned5MinRef.current = false;
        toast.info(`🔄 ${senderName} reset the interview timer to ${presetName || "preset"}`);
      } else if (action === "add_time") {
        toast.info(`⏳ ${senderName} added +5 minutes to the interview!`);
      }
    };

    socket.on("mock_timer_sync", handleTimerSync);

    return () => {
      socket.off("mock_timer_sync", handleTimerSync);
    };
  }, [socket, roomId, syncWithRoom]);

  // Local ticker countdown
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (soundEnabled) {
              try {
                playNotificationSound("message");
              } catch (e) {}
            }
            toast.error("⏰ Time's Up! Wrap up your solution and explain Big-O complexity.", {
              duration: 8000,
            });
            return 0;
          }

          // 5-minute warning alert
          if (prev === 300 && !warned5MinRef.current) {
            warned5MinRef.current = true;
            if (soundEnabled) {
              try {
                playNotificationSound("message");
              } catch (e) {}
            }
            toast.warning("⚠️ 5 Minutes Remaining! Start testing edge cases and concluding.", {
              duration: 6000,
            });
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  // Outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  // Controls
  const handleTogglePlay = () => {
    const nextRunning = !isRunning;
    setIsRunning(nextRunning);
    broadcastAction(nextRunning ? "start" : "pause", timeLeft, totalTime, nextRunning, activePreset);
  };

  const handleReset = (preset = null) => {
    const targetPreset = preset || PRESETS.find((p) => p.label === activePreset) || PRESETS[2];
    warned5MinRef.current = false;
    setTimeLeft(targetPreset.seconds);
    setTotalTime(targetPreset.seconds);
    setIsRunning(false);
    setActivePreset(targetPreset.label);
    broadcastAction("reset", targetPreset.seconds, targetPreset.seconds, false, targetPreset.label);
  };

  const handleAddFiveMinutes = () => {
    const newTime = timeLeft + 5 * 60;
    const newTotal = Math.max(totalTime, newTime);
    setTimeLeft(newTime);
    setTotalTime(newTotal);
    broadcastAction("add_time", newTime, newTotal, isRunning, activePreset);
    toast.success("+5 Minutes added to the interview clock! ⏱️");
  };

  // State colors
  const isCritical = timeLeft > 0 && timeLeft <= 5 * 60;
  const isWarning = timeLeft > 5 * 60 && timeLeft <= 10 * 60;
  const progressPercent = Math.max(0, Math.min(100, ((totalTime - timeLeft) / totalTime) * 100));

  let pillClasses = "bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600";
  if (isRunning) {
    if (isCritical) {
      pillClasses = "bg-rose-500/15 text-rose-300 border-rose-500/40 animate-pulse";
    } else if (isWarning) {
      pillClasses = "bg-amber-500/15 text-amber-300 border-amber-500/40";
    } else {
      pillClasses = "bg-indigo-600/15 text-indigo-300 border-indigo-500/30";
    }
  } else if (timeLeft === 0) {
    pillClasses = "bg-rose-500/20 text-rose-300 border-rose-500/50";
  }

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      {/* Pill Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono font-medium transition ${pillClasses}`}
        title="Mock Interview Countdown Timer"
      >
        <Timer
          className={`w-3.5 h-3.5 ${
            isRunning ? (isCritical ? "text-rose-400 animate-spin" : "text-indigo-400") : "text-slate-400"
          }`}
        />
        <span>{formatTime(timeLeft)}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-4 space-y-4 text-xs text-slate-200 animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-100">Mock Interview Timer</div>
                <div className="text-[10px] text-slate-400">FAANG-style technical interview clock</div>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 transition"
              title={soundEnabled ? "Mute Timer Chimes" : "Unmute Timer Chimes"}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Big Digital Display & Progress Ring */}
          <div className="flex flex-col items-center justify-center py-2 bg-slate-950/70 border border-slate-800/80 rounded-xl relative overflow-hidden">
            <span
              className={`text-3xl font-mono font-extrabold tracking-wider ${
                isCritical
                  ? "text-rose-400 animate-pulse"
                  : isWarning
                  ? "text-amber-400"
                  : isRunning
                  ? "text-indigo-300"
                  : "text-slate-200"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">
              {isRunning ? "Time Remaining" : timeLeft === 0 ? "Interview Over" : "Timer Paused"}
            </span>

            {/* Bottom mini progress bar */}
            <div className="w-full h-1 bg-slate-800 absolute bottom-0 left-0">
              <div
                className={`h-full transition-all duration-300 ${
                  isCritical ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-indigo-500"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePlay}
              className={`flex-1 py-2 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-xs shadow-md ${
                isRunning
                  ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20"
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{timeLeft === 0 ? "Restart" : "Start Clock"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleAddFiveMinutes}
              className="px-2.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl font-medium flex items-center gap-1 transition text-xs"
              title="Add 5 extra minutes"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+5m</span>
            </button>

            <button
              onClick={() => handleReset()}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 rounded-xl transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Preset Selector */}
          <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
            <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              Select Preset Duration
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESETS.map((preset) => {
                const isSelected = activePreset === preset.label;
                return (
                  <button
                    key={preset.label}
                    onClick={() => handleReset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-left border transition flex flex-col ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-200"
                        : "bg-slate-800/60 border-slate-800 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span className="font-semibold text-xs">{preset.label}</span>
                    <span className="text-[9px] text-slate-400">{preset.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Room Sync Setting */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Sync with Room</span>
            </span>
            <input
              type="checkbox"
              checked={syncWithRoom}
              onChange={(e) => setSyncWithRoom(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
