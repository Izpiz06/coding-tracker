export default function PlayerLoading() {
  return (
    <main className="site-shell text-slate-100 p-6 md:p-10">
      <div className="site-container max-w-4xl">

        {/* Header skeleton */}
        <div className="mb-6 flex items-center justify-between">
          <div className="skeleton skeleton-title" style={{ width: '12rem' }} />
          <div className="skeleton" style={{ width: '4rem', height: '2rem' }} />
        </div>

        {/* Platform handles */}
        <div className="panel p-5 mb-6">
          <div className="skeleton skeleton-heading" style={{ width: '10rem' }} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-slate-800/60 border border-slate-700/60 rounded p-3">
                <div className="skeleton skeleton-text" style={{ width: '3.5rem' }} />
                <div className="skeleton" style={{ width: '6rem', height: '1rem', marginTop: '0.4rem' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="panel p-4">
              <div className="skeleton skeleton-heading" style={{ width: '9rem' }} />
              <div className="space-y-2 mt-3">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="skeleton skeleton-text" style={{ width: `${5 + j * 2}rem` }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent solves */}
        <div className="panel p-4">
          <div className="skeleton skeleton-heading" style={{ width: '8rem' }} />
          <div className="space-y-2 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton" style={{ width: '100%', height: '2.25rem' }} />
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
