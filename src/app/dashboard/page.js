"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
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
} from "lucide-react";

function DashboardContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [rooms, setRooms] = useState([]);
  const [fetchingRooms, setFetchingRooms] = useState(true);

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

  // Fetch rooms on mount
  useEffect(() => {
    if (user) {
      loadRooms();
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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">Study Room</h1>
              <p className="text-xs text-slate-400">
                Logged in as <span className="text-indigo-400 font-medium">{user.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 text-sm text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8">
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