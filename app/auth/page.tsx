'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Mode = 'login' | 'register';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload = mode === 'register'
        ? { name, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Authentication failed');
        return;
      }

      setMessage('Success! Redirecting...');
      setTimeout(() => {
        router.push('/profile/setup');
      }, 600);
    } catch {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            {mode === 'login' ? 'Login' : 'Register'}
          </h1>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setMessage('');
            }}
            className="text-xs px-3 py-1 border border-neutral-700 rounded-lg bg-neutral-800 hover:bg-neutral-700"
          >
            {mode === 'login' ? 'Need account?' : 'Have account?'}
          </button>
        </div>

        <p className="text-sm text-neutral-400 mb-5">
          Sign in to access the global leaderboard and room comparisons.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 py-2.5 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-sm p-3 rounded-lg ${message.includes('Success') ? 'bg-green-900/30 border border-green-800/50 text-green-400' : 'bg-red-900/30 border border-red-800/50 text-red-400'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
