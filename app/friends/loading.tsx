export default function FriendsLoading() {
  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-4xl">

        {/* Header skeleton */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-8 gap-4 p-6">
          <div>
            <div className="skeleton skeleton-title" style={{ width: '8rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '18rem' }} />
          </div>
          <div className="skeleton" style={{ width: '6.5rem', height: '2.25rem' }} />
        </div>

        {/* Search section */}
        <div className="panel p-6 mb-8">
          <div className="skeleton skeleton-heading" style={{ width: '7rem' }} />
          <div className="flex gap-3 mt-4">
            <div className="skeleton flex-1" style={{ height: '2.5rem' }} />
            <div className="skeleton" style={{ width: '5rem', height: '2.5rem' }} />
          </div>
        </div>

        {/* Friends list */}
        <div className="panel p-6 mb-8">
          <div className="skeleton skeleton-heading" style={{ width: '8rem' }} />
          <div className="mt-4 divide-y divide-slate-700/40 border border-slate-700/40 rounded-lg overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between px-4 py-4">
                <div>
                  <div className="skeleton" style={{ width: `${6 + i * 2}rem`, height: '1.1rem' }} />
                  <div className="flex gap-3 mt-2">
                    <div className="skeleton skeleton-text" style={{ width: '4rem' }} />
                    <div className="skeleton skeleton-text" style={{ width: '4rem' }} />
                  </div>
                </div>
                <div className="skeleton" style={{ width: '7rem', height: '1.75rem' }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
