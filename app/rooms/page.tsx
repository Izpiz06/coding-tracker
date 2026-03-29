'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

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
  const [authName, setAuthName] = useState('');
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
        setProfileComplete(Boolean(data.profileComplete));
      })
      .catch(() => {
        window.location.href = '/auth';
      });

    loadRooms();
  }, []);

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
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Rooms
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Create a room, join by code, and track leaderboard progress together.
              </p>
            </div>
            <Link
              href="/rooms/join"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-bold"
            >
              Join With Code
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-2">Signed In As</h2>
            <div className="text-lg font-semibold text-neutral-100">{authName || 'Loading...'}</div>
            <p className="text-xs text-neutral-500 mt-2">Identity is automatic. No user ID needed.</p>
            {!profileComplete && (
              <div className="mt-4 p-3 rounded-lg border border-amber-800/50 bg-amber-900/20 text-amber-300 text-sm">
                Complete your profile handles before creating or joining rooms.
                <div className="mt-2">
                  <Link href="/profile/setup" className="underline underline-offset-2">
                    Go to profile setup
                  </Link>
                </div>
              </div>
            )}
          </section>

          <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">Create Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-3">
              <input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
                placeholder="Room name"
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={periodMode}
                onChange={(e) => setPeriodMode(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
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
                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg font-bold text-sm disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Room'}
              </button>
            </form>
          </section>
        </div>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
            <h2 className="text-sm uppercase tracking-widest text-neutral-400">Your Rooms</h2>
            <button
              onClick={() => loadRooms()}
              disabled={loading}
              className="text-xs px-3 py-1 rounded border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {hasRooms ? (
            <div className="divide-y divide-neutral-800/60">
              {rooms.map((room) => (
                <div key={room.id} className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-bold text-lg text-neutral-100">{room.name}</div>
                    <div className="text-sm text-neutral-400">
                      Code: <span className="font-mono text-neutral-300">{room.joinCode}</span> • {room._count.members} members • Created by {room.createdBy.name}
                    </div>
                  </div>
                  <Link
                    href={`/rooms/${room.joinCode}`}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-bold text-white text-center"
                  >
                    Open Room
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-sm text-neutral-500 text-center">
              {loading ? 'Loading rooms...' : 'No rooms found yet.'}
            </div>
          )}
        </section>

        {message && (
          <div className={`mt-6 p-3 rounded-lg text-sm ${message.includes('created') ? 'bg-green-900/30 text-green-400 border border-green-800/50' : 'bg-red-900/30 text-red-400 border border-red-800/50'}`}>
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
