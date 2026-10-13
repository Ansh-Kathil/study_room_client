export default function RoomLoading() {
  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden select-none animate-pulse">
      {/* Top Navigation Bar Skeleton */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/90 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-5 w-14 bg-emerald-500/20 rounded-full" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-amber-500/10 rounded-lg" />
          <div className="h-8 w-44 bg-slate-800 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-24 bg-slate-800 rounded-lg" />
          <div className="h-8 w-20 bg-indigo-600/20 rounded-lg" />
          <div className="h-8 w-8 bg-rose-500/20 rounded-lg" />
        </div>
      </header>

      {/* Main Split Workspace Skeleton */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Code Editor Skeleton */}
        <div className="flex-1 flex flex-col border-r border-slate-800">
          {/* Subheader / Tabs */}
          <div className="h-10 border-b border-slate-800 bg-slate-900/50 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-28 bg-slate-800 rounded" />
              <div className="h-4 w-16 bg-slate-800/60 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-16 bg-emerald-600/20 rounded" />
              <div className="h-6 w-16 bg-indigo-600/20 rounded" />
            </div>
          </div>

          {/* Monaco Lines Skeleton */}
          <div className="flex-1 p-6 space-y-3 font-mono bg-slate-950">
            <div className="h-4 w-1/3 bg-slate-800/80 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/60 rounded" />
            <div className="h-4 w-2/3 bg-slate-800/40 rounded" />
            <div className="h-4 w-1/4 bg-slate-800/70 rounded" />
            <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
            <div className="h-4 w-1/2 bg-slate-800/50 rounded" />
            <div className="h-4 w-5/12 bg-slate-800/40 rounded" />
          </div>

          {/* Console Drawer Skeleton */}
          <div className="h-44 border-t border-slate-800 bg-slate-900/70 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-6 w-20 bg-slate-800 rounded" />
              <div className="h-6 w-24 bg-slate-800/60 rounded" />
            </div>
            <div className="h-20 bg-slate-950/80 rounded-xl border border-slate-800/80" />
          </div>
        </div>

        {/* Right: Notes / Problem / Chat Pane Skeleton */}
        <div className="w-[380px] hidden md:flex flex-col bg-slate-900/60 p-4 space-y-4">
          <div className="h-8 w-full bg-slate-800/80 rounded-lg" />
          <div className="h-24 bg-slate-800/40 rounded-xl" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
            <div className="h-4 w-full bg-slate-800/50 rounded" />
            <div className="h-4 w-5/6 bg-slate-800/40 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
