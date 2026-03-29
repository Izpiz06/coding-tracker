// app/rooms/[code]/page.tsx — Room Dashboard
'use client';

import { useState, useEffect, use } from 'react';
import ActivityHeatmap from '../../../components/ActivityHeatmap';
import LanguagePieChart from '../../../components/LanguagePieChart';
import TopicRadarChart from '../../../components/TopicRadarChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Submission {
    id: number;
    platform: string;
    problemId: string;
    problemName: string;
    language: string | null;
    tags: string[];
    solvedAt: string | Date;
}

interface LeaderboardEntry {
    rank: number;
    userId: number;
    name: string;
    role: string;
    score: number;
    lcScore: number;
    cfScore: number;
    delta24h: number;
    breakdown: {
        lcEasy: number;
        lcMedium: number;
        lcHard: number;
        cfProblems: number;
        cfRatingBonus: number;
    };
    stats: {
        leetcode: { easy: number; medium: number; hard: number; total: number } | null;
        codeforces: { total: number; rating: number; maxRating: number; rank: string | null } | null;
    };
    periodSubmissions: { leetcode: number; codeforces: number; total: number };
    submissions: Submission[];
}

interface RoomData {
    room: {
        id: number;
        name: string;
        joinCode: string;
        periodMode: string;
        periodStart: string;
        createdBy: string;
        memberCount: number;
    };
    leaderboard: LeaderboardEntry[];
}

function getRankBadge(rank: number) {
    switch (rank) {
        case 1: return '🥇';
        case 2: return '🥈';
        case 3: return '🥉';
        default: return `#${rank}`;
    }
}

function getDeltaDisplay(delta: number) {
    if (delta > 0) return <span className="text-emerald-400 font-bold">↑ +{delta}</span>;
    if (delta < 0) return <span className="text-red-400 font-bold">↓ {delta}</span>;
    return <span className="text-neutral-500">—</span>;
}

const SCORE_COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#3b82f6'];

export default function RoomDashboard({
    params,
}: {
    params: Promise<{ code: string }>;
}) {
    const { code } = use(params);
    const [data, setData] = useState<RoomData | null>(null);
    const [error, setError] = useState('');
    const [syncing, setSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showInvite, setShowInvite] = useState(false);

    useEffect(() => {
        fetch(`/api/rooms/${code}`)
            .then((res) => res.json())
            .then((d) => {
                if (d.error) setError(d.error);
                else setData(d);
            })
            .catch(() => setError('Failed to load room'));
    }, [code]);

    async function handleSync() {
        setSyncing(true);
        setSyncMessage('');
        const passcode = prompt('Enter admin passcode to sync:');
        if (!passcode) {
            setSyncing(false);
            return;
        }

        try {
            const res = await fetch(`/api/rooms/${code}/sync`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passcode }),
            });
            const result = await res.json();
            if (!res.ok) {
                setSyncMessage(result.error || 'Sync failed');
            } else {
                setSyncMessage(
                    `✅ Synced ${result.membersSynced} members, ${result.activitiesCreated} new activities`
                );
                // Refresh data
                const refreshed = await fetch(`/api/rooms/${code}`).then((r) => r.json());
                if (!refreshed.error) setData(refreshed);
            }
        } catch {
            setSyncMessage('Network error');
        } finally {
            setSyncing(false);
        }
    }

    function copyInviteLink() {
        const url = `${window.location.origin}/rooms/join?code=${data?.room.joinCode}`;
        navigator.clipboard.writeText(url);
        setShowInvite(true);
        setTimeout(() => setShowInvite(false), 2000);
    }

    if (error) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-red-400 text-lg">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="text-neutral-500 text-lg animate-pulse">Loading room...</div>
            </div>
        );
    }

    const { room, leaderboard } = data;

    // Combine all submissions for collective heatmap
    const allSubmissions = leaderboard.flatMap((entry) => entry.submissions);

    const selectedEntries = leaderboard.filter((entry) => selectedUsers.includes(entry.userId));
    const scoreShareData = leaderboard.map((entry) => ({ name: entry.name, value: entry.score }));

    function toggleComparison(userId: number) {
        setSelectedUsers((prev) => {
            if (prev.includes(userId)) {
                return prev.filter((id) => id !== userId);
            }
            if (prev.length < 2) {
                return [...prev, userId];
            }
            return [prev[1], userId];
        });
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-neutral-50 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* ═══ Room Header ═══ */}
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                    {room.name}
                                </h1>
                                <span className="px-3 py-1 bg-neutral-800 border border-neutral-700 rounded-full text-xs text-neutral-400 font-mono">
                                    {room.joinCode}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                                <span>👥 {room.memberCount} members</span>
                                <span>•</span>
                                <span>📅 {room.periodMode.toLowerCase()} reset</span>
                                <span>•</span>
                                <span>Created by {room.createdBy}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={copyInviteLink}
                                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm font-bold transition-all"
                            >
                                {showInvite ? '✅ Copied!' : '🔗 Invite'}
                            </button>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold rounded-lg text-sm transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30"
                            >
                                {syncing ? '⏳ Syncing...' : '🔄 Sync Room'}
                            </button>
                        </div>
                    </div>
                    {syncMessage && (
                        <div className={`mt-4 text-sm p-3 rounded-lg ${syncMessage.includes('✅')
                                ? 'bg-green-900/30 text-green-400 border border-green-800/50'
                                : 'bg-red-900/30 text-red-400 border border-red-800/50'
                            }`}>
                            {syncMessage}
                        </div>
                    )}
                </div>

                {/* ═══ Main Grid: Leaderboard + Competitive Snapshot ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Leaderboard — 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
                            <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
                                <h2 className="text-lg font-bold text-neutral-200 uppercase tracking-widest text-sm">
                                    🏆 Leaderboard
                                </h2>
                            </div>

                            <div className="divide-y divide-neutral-800/50">
                                {leaderboard.map((entry) => (
                                    <div
                                        key={entry.userId}
                                        onClick={() => toggleComparison(entry.userId)}
                                        className={`flex items-center gap-4 px-6 py-4 hover:bg-neutral-800/30 cursor-pointer transition-all ${selectedUsers.includes(entry.userId)
                                                ? 'bg-emerald-900/10 border-l-2 border-emerald-500'
                                                : ''
                                            } ${entry.rank === 1 ? 'bg-gradient-to-r from-yellow-900/10 to-transparent' : ''}`}
                                    >
                                        {/* Rank */}
                                        <div className="text-2xl w-12 text-center">
                                            {getRankBadge(entry.rank)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg">{entry.name}</span>
                                                {selectedUsers.includes(entry.userId) && (
                                                    <span className="text-xs px-2 py-0.5 bg-cyan-900/40 text-cyan-300 rounded-full border border-cyan-700/40">
                                                        COMPARE
                                                    </span>
                                                )}
                                                {entry.role === 'OWNER' && (
                                                    <span className="text-xs px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded-full border border-amber-800/50">
                                                        OWNER
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500">
                                                {entry.stats.leetcode && (
                                                    <span className="text-orange-400/70">
                                                        LC: {entry.stats.leetcode.total} solved
                                                    </span>
                                                )}
                                                {entry.stats.codeforces && (
                                                    <span className="text-blue-400/70">
                                                        CF: {entry.stats.codeforces.total} solved • {entry.stats.codeforces.rating} rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delta */}
                                        <div className="text-center px-4">
                                            <div className="text-xs text-neutral-500 mb-1">24h</div>
                                            {getDeltaDisplay(entry.delta24h)}
                                        </div>

                                        {/* Score */}
                                        <div className="text-right min-w-[80px]">
                                            <div className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                                {entry.score}
                                            </div>
                                            <div className="text-xs text-neutral-500">pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Competitive Snapshot — 1/3 width */}
                    <div>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl">
                            <div className="px-6 py-4 border-b border-neutral-800">
                                <h2 className="text-lg font-bold text-neutral-200 uppercase tracking-widest text-sm">
                                    🎯 Comparison Setup
                                </h2>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-neutral-400 mb-3">
                                    Click up to 2 members in the leaderboard to compare language mix, topics, and solve consistency.
                                </p>
                                <div className="bg-neutral-800/40 border border-neutral-700/50 rounded-lg p-3 mb-4">
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Selected</div>
                                    {selectedEntries.length === 0 ? (
                                        <div className="text-sm text-neutral-500">No member selected yet</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedEntries.map((entry) => (
                                                <div key={entry.userId} className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-neutral-200">{entry.name}</span>
                                                    <span className="text-emerald-400 font-bold">{entry.score} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="h-56 bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                                    <div className="text-xs text-neutral-500 uppercase tracking-wider mb-2">Score Share</div>
                                    <ResponsiveContainer width="100%" height="90%">
                                        <PieChart>
                                            <Pie
                                                data={scoreShareData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={45}
                                                outerRadius={72}
                                                paddingAngle={3}
                                                stroke="none"
                                            >
                                                {scoreShareData.map((_, idx) => (
                                                    <Cell key={`score-slice-${idx}`} fill={SCORE_COLORS[idx % SCORE_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══ Collective Heatmap ═══ */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl mb-8">
                    <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">
                        🔥 Team Activity Heatmap
                    </h2>
                    <ActivityHeatmap submissions={allSubmissions} />
                </div>

                {/* ═══ Member Comparison View ═══ */}
                {selectedEntries.length > 0 && (
                    <div className="bg-neutral-900 border border-emerald-800/30 rounded-xl p-6 shadow-xl mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
                                ⚔️ {selectedEntries.length === 2
                                    ? `${selectedEntries[0].name} vs ${selectedEntries[1].name}`
                                    : `${selectedEntries[0].name} Performance Profile`}
                            </h2>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                            >
                                Clear
                            </button>
                        </div>

                        <div className={`grid grid-cols-1 ${selectedEntries.length === 2 ? 'xl:grid-cols-2' : ''} gap-6`}>
                            {selectedEntries.map((entry) => (
                                <section key={entry.userId} className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-neutral-100">{entry.name}</h3>
                                            <p className="text-xs text-neutral-500">Rank #{entry.rank} • {entry.periodSubmissions.total} solves this period</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-emerald-400">{entry.score}</div>
                                            <div className="text-xs text-neutral-500">score</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                                        <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-green-400/70 uppercase tracking-wider mb-1">LC Easy</div>
                                            <div className="text-base font-bold text-green-400">{entry.breakdown.lcEasy}</div>
                                        </div>
                                        <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-yellow-400/70 uppercase tracking-wider mb-1">LC Medium</div>
                                            <div className="text-base font-bold text-yellow-400">{entry.breakdown.lcMedium}</div>
                                        </div>
                                        <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-red-400/70 uppercase tracking-wider mb-1">LC Hard</div>
                                            <div className="text-base font-bold text-red-400">{entry.breakdown.lcHard}</div>
                                        </div>
                                        <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-blue-400/70 uppercase tracking-wider mb-1">CF Problems</div>
                                            <div className="text-base font-bold text-blue-400">{entry.breakdown.cfProblems}</div>
                                        </div>
                                        <div className="bg-neutral-800/50 rounded-lg p-2 text-center">
                                            <div className="text-xs text-purple-400/70 uppercase tracking-wider mb-1">24h Delta</div>
                                            <div className="text-base font-bold">{entry.delta24h > 0 ? `+${entry.delta24h}` : entry.delta24h}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                                            <LanguagePieChart submissions={entry.submissions} />
                                        </div>
                                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3">
                                            <TopicRadarChart submissions={entry.submissions} />
                                        </div>
                                    </div>

                                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
                                        <ActivityHeatmap submissions={entry.submissions} />
                                    </div>
                                </section>
                            ))}

                            {selectedEntries.length === 1 && (
                                <div className="bg-neutral-900/40 border border-dashed border-neutral-700 rounded-xl p-6 flex items-center justify-center text-center text-neutral-500 text-sm">
                                    Select one more member from leaderboard to unlock side-by-side comparison.
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </main>
    );
}
