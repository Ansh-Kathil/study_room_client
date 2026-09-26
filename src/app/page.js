import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl space-y-6">
        <span className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
          Collaborative Study Room
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100">
          Study together, in <span className="text-indigo-400">real time</span>.
        </h1>
        <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto">
          Create rooms, share 6-character codes with your classmates, see who is online, and chat in live study spaces.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/register"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold rounded-xl transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  );
}