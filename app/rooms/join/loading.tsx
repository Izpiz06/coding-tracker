export default function JoinRoomLoading() {
  return (
    <div className="site-shell flex flex-col items-center justify-center text-slate-100">
      <div className="max-w-md w-full">
        <div className="panel p-8">
          <div className="flex justify-end mb-4">
            <div className="skeleton" style={{ width: '6.5rem', height: '1.75rem' }} />
          </div>
          <div className="flex justify-center mb-2">
            <div className="skeleton skeleton-title" style={{ width: '10rem' }} />
          </div>
          <div className="flex justify-center mb-6">
            <div className="skeleton skeleton-text" style={{ width: '20rem' }} />
          </div>
          <div className="space-y-4">
            <div>
              <div className="skeleton skeleton-text" style={{ width: '5rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '3.25rem' }} />
            </div>
            <div>
              <div className="skeleton skeleton-text" style={{ width: '7rem' }} />
              <div className="skeleton" style={{ width: '100%', height: '2.5rem' }} />
            </div>
            <div className="skeleton" style={{ width: '100%', height: '2.75rem' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
