'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('/api/profile-sync', {
        method: 'POST',
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessage(`✓ Synced ${data.snapshotsCreated} platform(s)!`);
        setTimeout(() => {
          router.refresh();
          setMessage('');
        }, 1500);
      } else {
        setMessage(data.error || "Failed to sync");
      }
    } catch (err) {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button 
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
      >
        {loading ? 'Syncing Stats...' : 'Force Sync'}
      </button>
      {message && (
        <p className={`text-xs ${message.startsWith('✓') ? 'text-emerald-400' : 'text-red-400'}`}>
          {message}
        </p>
      )}
    </div>
  );
}