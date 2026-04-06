export default function RoomsLoading() {
  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-5xl">

        {/* Header skeleton */}
        <div className="mb-8 panel p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="skeleton skeleton-title" style={{ width: '8rem' }} />
              <div className="skeleton skeleton-text" style={{ width: '22rem' }} />
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton" style={{ width: '6rem', height: '2.25rem' }} />
              <div className="skeleton" style={{ width: '7.5rem', height: '2.25rem' }} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signed-in card */}
          <section className="panel p-5">
            <div className="skeleton skeleton-heading" style={{ width: '7rem' }} />
            <div className="skeleton" style={{ width: '10rem', height: '1.4rem', marginTop: '0.75rem' }} />
            <div className="skeleton skeleton-text" style={{ width: '14rem', marginTop: '0.75rem' }} />
            <div className="skeleton" style={{ width: '10rem', height: '2rem', marginTop: '1rem' }} />
            <div className="skeleton" style={{ width: '100%', height: '5rem', marginTop: '1rem' }} />
          </section>

          {/* Create room form */}
          <section className="panel p-5">
            <div className="skeleton skeleton-heading" style={{ width: '7rem' }} />
            <div className="space-y-3 mt-4">
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
            </div>
          </section>
        </div>

        {/* Room list */}
        <section className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <div className="skeleton skeleton-heading" style={{ width: '7rem' }} />
            <div className="skeleton" style={{ width: '4.5rem', height: '1.5rem' }} />
          </div>
          <div className="divide-y divide-slate-700/40">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="skeleton" style={{ width: `${7 + i * 2}rem`, height: '1.2rem' }} />
                  <div className="skeleton skeleton-text" style={{ width: '16rem', marginTop: '0.5rem' }} />
                </div>
                <div className="skeleton" style={{ width: '6rem', height: '2.25rem' }} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
