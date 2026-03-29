import { useEffect, useRef } from 'react';

/**
 * Auto-sync hook - syncs user data every interval
 * Default: every 30 minutes
 */
export function useAutoSync(intervalMs: number = 30 * 60 * 1000) {
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  useEffect(() => {
    const performSync = async () => {
      try {
        const now = Date.now();
        // Avoid syncing too frequently
        if (now - lastSyncRef.current < 60000) return;
        
        lastSyncRef.current = now;
        const res = await fetch('/api/profile-sync', {
          method: 'POST',
        });
        
        if (res.ok) {
          console.log('Auto-sync completed');
        }
      } catch (err) {
        console.error('Auto-sync error:', err);
      }
    };

    // Initial sync on mount
    performSync();

    // Set up interval
    syncIntervalRef.current = setInterval(performSync, intervalMs);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [intervalMs]);
}
