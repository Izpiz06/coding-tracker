'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfileSetupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [githubHandle, setGithubHandle] = useState('');
  const [leetcodeHandle, setLeetcodeHandle] = useState('');
  const [codeforcesHandle, setCodeforcesHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/profile')
      .then(async (res) => {
        if (!res.ok) {
          router.push('/auth');
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.profile) return;
        setName(data.profile.name || '');
        setEmail(data.profile.email || '');
        setGithubHandle(data.profile.githubHandle || '');
        setLeetcodeHandle(data.profile.leetcodeHandle || '');
        setCodeforcesHandle(data.profile.codeforcesHandle || '');
      })
      .catch(() => router.push('/auth'));
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubHandle,
          leetcodeHandle,
          codeforcesHandle,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Failed to save profile');
        return;
      }

      setMessage('Profile saved! Syncing your stats...');
      
      // Trigger initial sync
      try {
        const syncRes = await fetch('/api/profile-sync', {
          method: 'POST',
        });
        if (syncRes.ok) {
          setMessage('Profile saved and data synced! Redirecting...');
        }
      } catch (err) {
        console.log('Background sync triggered');
      }
      
      setTimeout(() => router.push('/'), 1500);
    } catch {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-2xl p-7 shadow-2xl">
        <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Complete Your Profile
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          Fill handles used for comparison. LeetCode and Codeforces are required for room leaderboards.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Name</label>
              <input disabled value={name} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 opacity-75" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Email</label>
              <input disabled value={email} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 opacity-75" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">GitHub Handle (optional)</label>
            <input
              value={githubHandle}
              onChange={(e) => setGithubHandle(e.target.value)}
              placeholder="octocat"
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">LeetCode Handle (required)</label>
            <input
              value={leetcodeHandle}
              onChange={(e) => setLeetcodeHandle(e.target.value)}
              required
              placeholder="your-leetcode"
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Codeforces Handle (required)</label>
            <input
              value={codeforcesHandle}
              onChange={(e) => setCodeforcesHandle(e.target.value)}
              required
              placeholder="your-codeforces"
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 py-2.5 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-sm p-3 rounded-lg ${message.includes('saved') ? 'bg-green-900/30 border border-green-800/50 text-green-400' : 'bg-red-900/30 border border-red-800/50 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
