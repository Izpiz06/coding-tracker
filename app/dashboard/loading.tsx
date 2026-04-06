export default function DashboardLoading() {
  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header skeleton */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div className="flex-1">
            <div className="skeleton skeleton-title" style={{ width: '16rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '8rem' }} />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton" style={{ width: '5.5rem', height: '2.25rem' }} />
            ))}
          </div>
        </div>

        {/* CP / Dev Card skeleton */}
        <div className="panel p-6 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-zinc-900/50 border border-zinc-700/40 rounded-lg p-4">
                <div className="skeleton skeleton-text" style={{ width: '4rem' }} />
                <div className="skeleton" style={{ width: '3rem', height: '1.8rem', marginTop: '0.5rem' }} />
              </div>
            ))}
          </div>
          <div className="skeleton" style={{ width: '100%', height: '3rem' }} />
        </div>

        {/* Charts section */}
        <div className="space-y-8">
          {/* Progress chart */}
          <div className="panel p-6">
            <div className="skeleton skeleton-heading" style={{ width: '10rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '14rem', marginTop: '1rem' }} />
          </div>

          {/* Language & Topic charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="panel p-6">
              <div className="skeleton skeleton-heading" style={{ width: '12rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '14rem', marginTop: '1rem' }} />
            </div>
            <div className="panel p-6">
              <div className="skeleton skeleton-heading" style={{ width: '6rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '14rem', marginTop: '1rem' }} />
            </div>
          </div>

          {/* Heatmap */}
          <div className="panel p-6">
            <div className="skeleton skeleton-heading" style={{ width: '10rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '9rem', marginTop: '1rem' }} />
          </div>
        </div>

      </div>
    </main>
  );
}
