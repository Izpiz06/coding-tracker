export default function ProfileSetupLoading() {
  return (
    <main className="site-shell text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-xl panel p-7">
        <div className="skeleton skeleton-title" style={{ width: '14rem' }} />
        <div className="skeleton skeleton-text" style={{ width: '22rem', marginBottom: '1.5rem' }} />

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="skeleton skeleton-text" style={{ width: '3rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
            </div>
            <div>
              <div className="skeleton skeleton-text" style={{ width: '3rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
            </div>
          </div>

          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton skeleton-text" style={{ width: `${6 + i * 2}rem` }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
            </div>
          ))}

          <div className="skeleton" style={{ width: '100%', height: '2.75rem' }} />
        </div>
      </div>
    </main>
  );
}
