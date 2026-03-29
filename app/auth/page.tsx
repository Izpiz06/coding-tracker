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
      const redirectTo = (mode === 'login' && data.hasHandles) ? '/' : '/profile/setup';
      setTimeout(() => {
        router.push(redirectTo);
      }, 600);
    } catch {
      setMessage('Network error. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-shell text-slate-100 flex items-center justify-center">
      <div className="w-full max-w-md panel p-7">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            {mode === 'login' ? 'Login' : 'Register'}
          </h1>
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setMessage('');
            }}
            className="btn-ghost text-xs px-3 py-1"
          >
            {mode === 'login' ? 'Need account?' : 'Have account?'}
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-5">
          Sign in to access the global leaderboard and room comparisons.
        </p>

        <form className="space-y-4" onSubmit={onSubmit}>
          {mode === 'register' && (
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Display Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full input-dark p-2"
              />
            </div>
          )}

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              className="w-full input-dark p-2"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Password</label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={6}
              required
              className="w-full input-dark p-2"
            />
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full btn-primary py-2.5 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-sm p-3 rounded-lg ${message.includes('Success') ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-300' : 'bg-rose-900/30 border border-rose-700/50 text-rose-300'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
