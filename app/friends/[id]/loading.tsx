export default function FriendDetailLoading() {
  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-4xl">

        {/* Header skeleton */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-8 gap-4 p-6">
          <div>
            <div className="skeleton skeleton-title" style={{ width: '14rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '10rem' }} />
          </div>
          <div className="skeleton" style={{ width: '6.5rem', height: '2.25rem' }} />
        </div>

        {/* Table skeleton */}
        <div className="panel overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-900/70 flex items-center gap-6">
            <div className="skeleton" style={{ width: '4rem', height: '0.75rem' }} />
            <div className="skeleton flex-1" style={{ height: '0.75rem' }} />
            <div className="skeleton" style={{ width: '5rem', height: '0.75rem' }} />
            <div className="skeleton" style={{ width: '5rem', height: '0.75rem' }} />
          </div>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="px-5 py-3 border-b border-slate-700/30 flex items-center gap-6">
              <div className="skeleton" style={{ width: '4rem', height: '0.75rem' }} />
              <div className="skeleton flex-1" style={{ height: '0.75rem' }} />
              <div className="skeleton" style={{ width: `${3 + (i % 3)}rem`, height: '0.75rem' }} />
              <div className="skeleton" style={{ width: '5rem', height: '0.75rem' }} />
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
