'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={onLogout}
      disabled={loading}
      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all disabled:opacity-50"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
