'use client';

import { useAutoSync } from '@/lib/useAutoSync';

/**
 * Invisible component that auto-syncs user data at intervals
 * Place anywhere in your app that you want auto-sync enabled
 */
export default function AutoSyncProvider() {
  // Auto-sync every 1 hour (3600000 ms)
  useAutoSync(60 * 60 * 1000);

  return null;
}
