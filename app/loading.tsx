export default function HomeLoading() {
  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header skeleton */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div className="flex-1">
            <div className="skeleton skeleton-title" style={{ width: '14rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '9rem' }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton" style={{ width: '5.5rem', height: '2.25rem' }} />
            ))}
          </div>
        </div>

        {/* Leaderboard skeleton */}
        <div className="panel overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/70">
            <div className="skeleton skeleton-heading" style={{ width: '10rem' }} />
          </div>
          <div className="divide-y divide-slate-700/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton" style={{ width: '2rem', height: '1.25rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: `${7 + (i % 3) * 2}rem` }} />
                </div>
                <div className="skeleton" style={{ width: '3rem', height: '1.5rem' }} />
              </div>
            ))}
          </div>
        </div>

        {/* My Rooms skeleton */}
        <div className="panel overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/70 flex items-center justify-between">
            <div className="skeleton skeleton-heading" style={{ width: '7rem' }} />
            <div className="skeleton" style={{ width: '7rem', height: '2rem' }} />
          </div>
          <div className="divide-y divide-slate-700/40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="skeleton skeleton-text" style={{ width: `${8 + i * 2}rem`, height: '1.1rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '11rem', marginTop: '0.5rem' }} />
                </div>
                <div className="text-right">
                  <div className="skeleton skeleton-text" style={{ width: '5rem' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
