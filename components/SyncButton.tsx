'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSync() {
    // 1. Ask for the admin passcode
    const passcode = window.prompt("Enter Admin Passcode to force sync:");
    
    if (!passcode) return; // Cancel if they click outside or leave it blank

    setLoading(true);
    
    try {
      // 2. Send the passcode in the URL just like our backend expects
      const res = await fetch(`/api/sync?passcode=${passcode}`);
      const data = await res.json();
      
      if (res.ok) {
        alert("Sync complete! Data is fresh.");
        router.refresh(); // This tells Next.js to reload the charts with new data
      } else {
        alert(data.error || "Failed to sync. Wrong passcode?");
      }
    } catch (error) {
      alert("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button 
      onClick={handleSync}
      disabled={loading}
      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
    >
      {loading ? 'Syncing Stats...' : 'Force Sync'}
    </button>
  );
}