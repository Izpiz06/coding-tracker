// components/SyncButton.tsx
'use client'; // This tells Next.js this component runs in the browser

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync');
      const data = await res.json();
      
      if (data.success) {
        // This magical function tells Next.js to refresh the Server Component
        // in the background and update the UI with the fresh database stats!
        router.refresh(); 
      } else {
        alert('Sync failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      alert('Something went wrong checking the APIs.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <button 
      onClick={handleSync} 
      disabled={isSyncing}
      className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2
        ${isSyncing 
          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700' 
          : 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
        }`}
    >
      {isSyncing ? (
        <>
          <span className="animate-spin">⏳</span> Syncing...
        </>
      ) : (
        <>
         Sync Latest Stats
        </>
      )}
    </button>
  );
}