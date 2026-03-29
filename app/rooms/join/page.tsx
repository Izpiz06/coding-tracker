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
        <div className="site-shell flex flex-col items-center justify-center text-slate-100">
            <div className="max-w-md w-full">
                {/* Room Preview Card */}
                {roomPreview && (
                    <div className="panel p-6 mb-6 text-center">
                        <div className="text-xs uppercase tracking-widest text-sky-300/70 mb-2">
                            You&apos;re invited to
                        </div>
                        <h2 className="text-2xl font-bold text-slate-100 mb-3">
                            {roomPreview.name}
                        </h2>
                        <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                            <span>{roomPreview.memberCount} members</span>
                            <span>•</span>
                            <span>Created by {roomPreview.createdBy}</span>
                        </div>
                    </div>
                )}

                {/* Join Form */}
                <div className="panel p-8">
                    <h1 className="text-2xl font-bold mb-2 text-center text-emerald-400">
                        {prefilledCode ? 'Join Room' : 'Enter Room Code'}
                    </h1>
                    <p className="text-slate-400 text-sm text-center mb-6">
                        Enter the 6-character room code and room password to join.
                    </p>

                    <form onSubmit={handleJoin} className="space-y-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                                Room Code
                            </label>
                            <input
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                maxLength={6}
                                required
                                placeholder="ABC123"
                                className="w-full input-dark p-3 text-center text-2xl font-mono tracking-[0.5em] uppercase"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">
                                Room Password
                            </label>
                            <input
                                value={roomPasscode}
                                onChange={(e) => setRoomPasscode(e.target.value)}
                                type="password"
                                required
                                placeholder="Enter room password"
                                className="w-full input-dark p-2"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || joinCode.length !== 6}
                            className="w-full btn-primary py-3 disabled:opacity-50"
                        >
                            {loading ? 'Joining...' : 'Join Room'}
                        </button>
                    </form>

                    {message && (
                        <div
                            className={`mt-4 text-center text-sm p-3 rounded-lg ${message.includes('Joined')
                                    ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/50'
                                    : 'bg-rose-900/30 text-rose-300 border border-rose-700/50'
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
                <div className="site-shell flex items-center justify-center text-slate-400">
                    Loading...
                </div>
            }
        >
            <JoinRoomForm />
        </Suspense>
    );
}
