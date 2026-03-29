'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine, RiUserAddLine, RiCheckLine, RiCloseLine, RiSearchLine, RiUserHeartLine, RiTimeLine, RiExternalLinkLine } from 'react-icons/ri';

interface Friend {
    friendshipId: number;
    id: number;
    name: string;
    email: string | null;
    leetcodeHandle: string | null;
    codeforcesHandle: string | null;
    githubHandle: string | null;
}

interface PendingRequest {
    id: number;
    sender: { id: number; name: string; email: string | null };
}

interface SentRequest {
    id: number;
    receiver: { id: number; name: string; email: string | null };
}

interface SearchUser {
    id: number;
    name: string;
    email: string | null;
}

export default function FriendsPage() {
    const [friends, setFriends] = useState<Friend[]>([]);
    const [pendingReceived, setPendingReceived] = useState<PendingRequest[]>([]);
    const [pendingSent, setPendingSent] = useState<SentRequest[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');

    async function loadFriends() {
        try {
            const res = await fetch('/api/friends');
            if (!res.ok) return;
            const data = await res.json();
            setFriends(data.friends || []);
            setPendingReceived(data.pendingReceived || []);
            setPendingSent(data.pendingSent || []);
        } catch {
            console.error('Failed to load friends');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadFriends();
    }, []);

    async function searchUsers() {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.users || []);
            }
        } catch {
            console.error('Search failed');
        }
    }

    async function sendRequest(receiverId: number) {
        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiverId }),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage('Friend request sent!', 'success');
                setSearchResults((prev) => prev.filter((u) => u.id !== receiverId));
                loadFriends();
            } else {
                showMessage(data.error || 'Failed to send request', 'error');
            }
        } catch {
            showMessage('Network error', 'error');
        }
    }

    async function respondToRequest(friendshipId: number, action: 'accept' | 'reject') {
        try {
            const res = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friendshipId, action }),
            });
            const data = await res.json();
            if (res.ok) {
                showMessage(action === 'accept' ? 'Friend request accepted!' : 'Request rejected', 'success');
                loadFriends();
            } else {
                showMessage(data.error || 'Failed', 'error');
            }
        } catch {
            showMessage('Network error', 'error');
        }
    }

    function showMessage(text: string, type: 'success' | 'error') {
        setMessage(text);
        setMessageType(type);
        setTimeout(() => setMessage(''), 3000);
    }

    if (loading) {
        return (
            <main className="site-shell text-slate-100 flex items-center justify-center">
                <div className="text-zinc-400 text-lg animate-pulse">Loading friends...</div>
            </main>
        );
    }

    return (
        <main className="site-shell text-slate-100">
            <div className="site-container max-w-4xl">

                {/* Header */}
                <div className="panel flex flex-col md:flex-row items-center justify-between mb-8 gap-4 p-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
                            Friends
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage your friends and view their solved problems.
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                    >
                        <RiArrowLeftLine className="text-zinc-300" />
                        Dashboard
                    </Link>
                </div>

                {/* Status message */}
                {message && (
                    <div className={`mb-6 text-sm p-3 rounded-lg ${messageType === 'success'
                        ? 'bg-emerald-900/30 border border-emerald-700/50 text-emerald-300'
                        : 'bg-rose-900/30 border border-rose-700/50 text-rose-300'
                        }`}>
                        {message}
                    </div>
                )}

                {/* ═══ Search & Add Friends ═══ */}
                <div className="panel p-6 mb-8">
                    <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em] mb-4">
                        <RiSearchLine className="text-zinc-300" /> Find Users
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchUsers()}
                            placeholder="Search by name or email..."
                            className="flex-1 input-dark px-4 py-2 text-sm"
                        />
                        <button
                            onClick={searchUsers}
                            className="btn-primary px-4 py-2 text-sm"
                        >
                            Search
                        </button>
                    </div>

                    {searchResults.length > 0 && (
                        <div className="mt-4 divide-y divide-slate-700/40 border border-slate-700/40 rounded-lg overflow-hidden">
                            {searchResults.map((user) => {
                                const alreadyFriend = friends.some((f) => f.id === user.id);
                                const alreadySent = pendingSent.some((p) => p.receiver.id === user.id);
                                const alreadyReceived = pendingReceived.some((p) => p.sender.id === user.id);
                                return (
                                    <div key={user.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/25">
                                        <div>
                                            <span className="font-semibold text-slate-200">{user.name}</span>
                                            {user.email && <span className="ml-2 text-xs text-slate-500">{user.email}</span>}
                                        </div>
                                        {alreadyFriend ? (
                                            <span className="text-xs text-emerald-400 px-3 py-1 bg-emerald-900/30 rounded-full">Already friends</span>
                                        ) : alreadySent ? (
                                            <span className="text-xs text-amber-400 px-3 py-1 bg-amber-900/30 rounded-full">Request sent</span>
                                        ) : alreadyReceived ? (
                                            <span className="text-xs text-blue-400 px-3 py-1 bg-blue-900/30 rounded-full">Sent you a request</span>
                                        ) : (
                                            <button
                                                onClick={() => sendRequest(user.id)}
                                                className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                                            >
                                                <RiUserAddLine /> Add Friend
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ═══ Pending Requests ═══ */}
                {pendingReceived.length > 0 && (
                    <div className="panel p-6 mb-8">
                        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em] mb-4">
                            <RiTimeLine className="text-zinc-300" /> Pending Requests ({pendingReceived.length})
                        </h2>
                        <div className="divide-y divide-slate-700/40 border border-slate-700/40 rounded-lg overflow-hidden">
                            {pendingReceived.map((req) => (
                                <div key={req.id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <span className="font-semibold text-slate-200">{req.sender.name}</span>
                                        {req.sender.email && <span className="ml-2 text-xs text-slate-500">{req.sender.email}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => respondToRequest(req.id, 'accept')}
                                            className="btn-primary inline-flex items-center gap-1 px-3 py-1.5 text-xs"
                                        >
                                            <RiCheckLine /> Accept
                                        </button>
                                        <button
                                            onClick={() => respondToRequest(req.id, 'reject')}
                                            className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300"
                                        >
                                            <RiCloseLine /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ═══ Friends List ═══ */}
                <div className="panel p-6 mb-8">
                    <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em] mb-4">
                        <RiUserHeartLine className="text-zinc-300" /> Friends ({friends.length})
                    </h2>

                    {friends.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No friends yet. Search for users above to add friends!
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/40 border border-slate-700/40 rounded-lg overflow-hidden">
                            {friends.map((friend) => (
                                <div key={friend.id} className="flex items-center justify-between px-4 py-4 hover:bg-slate-800/25 transition-colors">
                                    <div>
                                        <span className="font-bold text-lg text-slate-200">{friend.name}</span>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                            {friend.leetcodeHandle && <span>LC: {friend.leetcodeHandle}</span>}
                                            {friend.codeforcesHandle && <span>CF: {friend.codeforcesHandle}</span>}
                                            {friend.githubHandle && <span>GH: @{friend.githubHandle}</span>}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/friends/${friend.id}/problems`}
                                        className="btn-ghost inline-flex items-center gap-1.5 px-3 py-1.5 text-xs"
                                    >
                                        <RiExternalLinkLine /> View Problems
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ Sent Requests ═══ */}
                {pendingSent.length > 0 && (
                    <div className="panel p-6">
                        <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em] mb-4">
                            <RiTimeLine className="text-zinc-300" /> Sent Requests ({pendingSent.length})
                        </h2>
                        <div className="divide-y divide-slate-700/40 border border-slate-700/40 rounded-lg overflow-hidden">
                            {pendingSent.map((req) => (
                                <div key={req.id} className="flex items-center justify-between px-4 py-3">
                                    <div>
                                        <span className="font-semibold text-slate-200">{req.receiver.name}</span>
                                        {req.receiver.email && <span className="ml-2 text-xs text-slate-500">{req.receiver.email}</span>}
                                    </div>
                                    <span className="text-xs text-amber-400 px-3 py-1 bg-amber-900/30 rounded-full">Pending</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
