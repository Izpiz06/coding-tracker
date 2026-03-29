'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { GitHubStats } from '../../lib/github';
import GitHubDevelopmentPanel from '../../components/GitHubDevelopmentPanel';

interface RoomSummary {
  id: number;
  name: string;
  joinCode: string;
  periodMode: string;
  createdAt: string;
  _count: { members: number };
  createdBy: { name: string };
}

export default function RoomsHubPage() {
  const [activeSection, setActiveSection] = useState<'CP' | 'DEVELOPMENT'>('CP');
  const [authName, setAuthName] = useState('');
  const [githubHandle, setGithubHandle] = useState<string | null>(null);
  const [leetcodeHandle, setLeetcodeHandle] = useState<string | null>(null);
  const [codeforcesHandle, setCodeforcesHandle] = useState<string | null>(null);
  const [githubStats, setGithubStats] = useState<GitHubStats | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [roomName, setRoomName] = useState('');
  const [periodMode, setPeriodMode] = useState('WEEKLY');
  const [roomPasscode, setRoomPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState('');

  async function loadRooms() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/auth';
          return;
        }
        setMessage(data.error || 'Failed to load rooms');
        return;
      }

      setRooms(data.rooms || []);
    } catch {
      setMessage('Network error while loading rooms');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) {
          window.location.href = '/auth';
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.user) return;
        setAuthName(data.user.name);
        setGithubHandle(data.user.githubHandle ?? null);
        setLeetcodeHandle(data.user.leetcodeHandle ?? null);
        setCodeforcesHandle(data.user.codeforcesHandle ?? null);
        setProfileComplete(Boolean(data.profileComplete));
      })
      .catch(() => {
        window.location.href = '/auth';
      });

    loadRooms();
  }, []);

  useEffect(() => {
    if (!githubHandle) {
      setGithubStats(null);
      return;
    }

    setGithubLoading(true);
    fetch(`/api/github/${encodeURIComponent(githubHandle)}`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        setGithubStats(data?.stats ?? null);
      })
      .catch(() => {
        setGithubStats(null);
      })
      .finally(() => {
        setGithubLoading(false);
      });
  }, [githubHandle]);

  async function handleCreateRoom(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!profileComplete) {
      setMessage('Complete your profile before creating a room');
      return;
    }

    if (!roomPasscode) {
      setMessage('Enter a room password');
      return;
    }

    setCreating(true);
    setMessage('');

    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: roomName,
          periodMode,
          roomPasscode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to create room');
        return;
      }

      setRoomName('');
        setRoomPasscode('');
      setMessage(`Room created! Invite code: ${data.room.joinCode}`);
      await loadRooms();
    } catch {
      setMessage('Network error while creating room');
    } finally {
      setCreating(false);
    }
  }

  const hasRooms = useMemo(() => rooms.length > 0, [rooms]);

  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-5xl">
        <div className="mb-8 panel p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
                Rooms
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Create a room, join by code, and track leaderboard progress together.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="btn-ghost px-4 py-2 text-sm"
              >
                Back Home
              </Link>
              <Link
                href="/rooms/join"
                className="btn-ghost px-4 py-2 text-sm"
              >
                Join With Code
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="panel p-5">
            <h2 className="section-title mb-2">Signed In As</h2>
            <div className="text-lg font-semibold text-slate-100">{authName || 'Loading...'}</div>
            <p className="text-xs text-slate-500 mt-2">Identity is automatic. No user ID needed.</p>

            <div className="mt-4 inline-flex rounded-lg border border-zinc-700/60 bg-zinc-950/70 p-1">
              <button
                type="button"
                onClick={() => setActiveSection('CP')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
                  activeSection === 'CP' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                CP
              </button>
              <button
                type="button"
                onClick={() => setActiveSection('DEVELOPMENT')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
                  activeSection === 'DEVELOPMENT' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                DEVELOPMENT
              </button>
            </div>

            <div className="mt-3 flip-scene">
              <div className={`flip-card ${activeSection === 'DEVELOPMENT' ? 'is-flipped' : ''}`}>
                <div className="flip-face flip-front rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Competitive Programming</div>
                  <div className="space-y-1 text-sm">
                    <div className="text-slate-100">LeetCode: <span className="text-zinc-300">{leetcodeHandle || 'Not set'}</span></div>
                    <div className="text-slate-100">Codeforces: <span className="text-zinc-300">{codeforcesHandle || 'Not set'}</span></div>
                  </div>
                </div>

                <div className="flip-face flip-back rounded-lg border border-slate-700/50 bg-slate-900/40 p-3">
                  <GitHubDevelopmentPanel
                    githubHandle={githubHandle}
                    stats={githubStats}
                    loading={githubLoading}
                  />
                </div>
              </div>
            </div>

            {!profileComplete && (
              <div className="mt-4 p-3 rounded-lg border border-amber-700/50 bg-amber-900/20 text-amber-300 text-sm">
                Complete your profile handles before creating or joining rooms.
                <div className="mt-2">
                  <Link href="/profile/setup" className="underline underline-offset-2">
                    Go to profile setup
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="panel p-5">
            <h2 className="section-title mb-4">Create Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                placeholder="Room name"
                className="w-full input-dark p-2"
              />
              <select
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value)}
                className="w-full input-dark p-2"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="ALL_TIME">All Time</option>
              </select>
              <input
                value={roomPasscode}
                onChange={(e) => setRoomPasscode(e.target.value)}
                type="password"
                required
                placeholder="Room password"
                className="w-full input-dark p-2"
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full btn-primary px-4 py-2 text-sm disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </section>
        </div>

        <section className="panel overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
            <h2 className="section-title">Your Rooms</h2>
            <button
              onClick={() => loadRooms()}
              disabled={loading}
              className="btn-ghost text-xs px-3 py-1 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {hasRooms ? (
            <div className="divide-y divide-slate-700/40">
              {rooms.map((room) => (
                <div key={room.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-bold text-lg text-slate-100">{room.name}</div>
                    <div className="text-sm text-slate-400">
                      Code: <span className="font-mono text-slate-300">{room.joinCode}</span> • {room._count.members} members • Created by {room.createdBy.name}
                    </div>
                  </div>
                  <Link
                    href={`/rooms/${room.joinCode}`}
                    className="btn-primary px-4 py-2 text-sm text-center"
                  >
                    Open Room
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-sm text-slate-500 text-center">
              {loading ? 'Loading rooms...' : 'No rooms found yet.'}
            </div>
          )}
        </section>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-sm ${message.includes('created') ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/50' : 'bg-rose-900/30 text-rose-300 border border-rose-700/50'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
