// app/rooms/join/page.tsx — Room Invite / Join Page
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function JoinRoomForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const prefilledCode = searchParams.get('code') || '';

    const [joinCode, setJoinCode] = useState(prefilledCode);
    const [roomPasscode, setRoomPasscode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [roomPreview, setRoomPreview] = useState<{
        name: string;
        memberCount: number;
        createdBy: string;
    } | null>(null);

    useEffect(() => {
        fetch('/api/auth/me').then((res) => {
            if (!res.ok) {
                router.push('/auth');
            }
        }).catch(() => router.push('/auth'));
    }, [router]);

    // If code is provided, fetch room preview
    useEffect(() => {
        if (prefilledCode) {
            fetch(`/api/rooms/preview/${prefilledCode}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.room) {
                        setRoomPreview({
                            name: data.room.name,
                            memberCount: data.room.memberCount,
                            createdBy: data.room.createdBy,
                        });
                    }
                })
                .catch(() => { }); // silently fail preview
        }
    }, [prefilledCode]);

    async function handleJoin(e: React.FormEvent) {
        e.preventDefault();

        if (!roomPasscode) {
            setMessage('Enter room password');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/rooms/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    joinCode: joinCode.toUpperCase(),
                    roomPasscode,
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                setMessage(result.error || 'Failed to join room');
            } else {
                setMessage('Joined! Redirecting to room...');
                setTimeout(
                    () => router.push(`/rooms/${result.room.joinCode}`),
                    1500
                );
            }
        } catch {
            setMessage('Network error. Try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 text-neutral-50">
            <div className="max-w-md w-full">
                {/* Room Preview Card */}
                {roomPreview && (
                    <div className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border border-emerald-800/50 rounded-xl p-6 mb-6 text-center backdrop-blur-sm">
                        <div className="text-xs uppercase tracking-widest text-emerald-400/70 mb-2">
                            You&apos;re invited to
                        </div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                            {roomPreview.name}
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
                            <span>👥 {roomPreview.memberCount} members</span>
                            <span>•</span>
                            <span>Created by {roomPreview.createdBy}</span>
                        </div>
                    </div>
                )}

                {/* Join Form */}
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl">
                    <h1 className="text-2xl font-bold mb-2 text-center text-emerald-400">
                        {prefilledCode ? 'Join Room' : 'Enter Room Code'}
                    </h1>
                    <p className="text-neutral-400 text-sm text-center mb-6">
                        Enter the 6-character room code and room password to join.
                    </p>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                                Room Code
                            </label>
                            <input
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                                placeholder="ABC123"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded p-3 text-white text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-emerald-500 uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-neutral-500 mb-1">
                                Room Password
                            </label>
                            <input
                                value={roomPasscode}
                                onChange={(e) => setRoomPasscode(e.target.value)}
                                type="password"
                                required
                                placeholder="Enter room password"
                                className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || joinCode.length !== 6}
                            className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-3 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
                        >
                            {loading ? 'Joining...' : '🚀 Join Room'}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-4 text-center text-sm p-3 rounded-lg ${message.includes('Joined')
                                    ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                                    : 'bg-red-900/30 text-red-400 border border-red-800/50'
                                }`}
                        >
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function JoinRoomPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
                    Loading...
                </div>
            }
        >
            <JoinRoomForm />
        </Suspense>
    );
}
