export default function RoomDashboardLoading() {
  return (
    <main className="site-shell text-zinc-100">
      <div className="site-container max-w-7xl">

        {/* Room header skeleton */}
        <div className="panel p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="skeleton skeleton-title" style={{ width: '14rem' }} />
                <div className="skeleton" style={{ width: '5rem', height: '1.5rem', borderRadius: '9999px' }} />
              </div>
              <div className="flex items-center gap-4">
                <div className="skeleton skeleton-text" style={{ width: '7rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '7rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '6rem' }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ width: '5.5rem', height: '2.25rem' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="panel overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-700/60 bg-zinc-950/60">
                <div className="skeleton skeleton-heading" style={{ width: '8rem' }} />
              </div>
              <div className="divide-y divide-zinc-700/40">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <div className="skeleton" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.5rem' }} />
                    <div className="flex-grow">
                      <div className="skeleton" style={{ width: `${6 + (i % 3) * 3}rem`, height: '1.1rem' }} />
                      <div className="flex gap-3 mt-2">
                        <div className="skeleton skeleton-text" style={{ width: '5rem' }} />
                        <div className="skeleton skeleton-text" style={{ width: '6rem' }} />
                      </div>
                    </div>
                    <div className="skeleton" style={{ width: '2.5rem', height: '1rem' }} />
                    <div className="skeleton" style={{ width: '3.5rem', height: '1.8rem' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comparison sidebar */}
          <div>
            <div className="panel">
              <div className="px-6 py-4 border-b border-zinc-700/60">
                <div className="skeleton skeleton-heading" style={{ width: '10rem' }} />
              </div>
              <div className="p-4">
                <div className="skeleton skeleton-text" style={{ width: '100%' }} />
                <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                <div className="skeleton" style={{ width: '100%', height: '12rem', marginTop: '1rem' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Team heatmap */}
        <div className="panel p-6 mb-8">
          <div className="skeleton skeleton-heading" style={{ width: '12rem' }} />
          <div className="skeleton" style={{ width: '100%', height: '9rem', marginTop: '1rem' }} />
        </div>

        {/* Development section */}
        <div className="panel p-6 mb-8">
          <div className="skeleton skeleton-heading" style={{ width: '8rem' }} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-zinc-950/60 border border-zinc-700/60 rounded-lg p-3">
                <div className="skeleton" style={{ width: '6rem', height: '0.9rem' }} />
                <div className="skeleton skeleton-text" style={{ width: '8rem', marginTop: '0.5rem' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
