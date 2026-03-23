// app/invite/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      leetcodeHandle: formData.get('leetcodeHandle'),
      codeforcesHandle: formData.get('codeforcesHandle'),
      passcode: formData.get('passcode'),
    };

    try {
      const res = await fetch('/api/add-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setMessage(result.error || 'Something went wrong');
      } else {
        setMessage('Welcome to the roster! Redirecting...');
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (error) {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-neutral-50">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 text-center text-emerald-400">Join the Tracker</h1>
        <p className="text-neutral-400 text-sm text-center mb-6">Enter the admin passcode to claim a slot.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Display Name</label>
            <input name="name" required className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">LeetCode Handle</label>
            <input name="leetcodeHandle" className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Codeforces Handle</label>
            <input name="codeforcesHandle" className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-emerald-500/70 mb-1">Secret Passcode</label>
            <input name="passcode" type="password" required className="w-full bg-neutral-800 border border-emerald-900/50 rounded p-2 text-white focus:outline-none focus:border-emerald-500" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-all disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Claim Slot'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-center text-sm p-2 rounded ${message.includes('Welcome') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}