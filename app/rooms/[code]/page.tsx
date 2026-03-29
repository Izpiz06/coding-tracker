// app/rooms/[code]/page.tsx — Room Dashboard
'use client';

import Link from 'next/link';
import { useState, useEffect, use } from 'react';
import ActivityHeatmap from '../../../components/ActivityHeatmap';
import LanguagePieChart from '../../../components/LanguagePieChart';
import TopicRadarChart from '../../../components/TopicRadarChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
    RiArrowLeftLine,
    RiArrowDownLine,
    RiArrowUpLine,
    RiBarChartBoxLine,
    RiCalendarEventLine,
    RiCheckboxCircleLine,
    RiCloseLine,
    RiGroupLine,
    RiMedalLine,
    RiRefreshLine,
    RiShareForwardLine,
    RiShieldUserLine,
    RiSwordLine,
    RiTrophyLine,
    RiUser3Line,
} from 'react-icons/ri';

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
    languageData?: { name: string; value: number }[];
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
    const medalTone =
        rank === 1 ? 'text-amber-300' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-300' : 'text-slate-500';

    return (
        <span className="inline-flex items-center gap-1">
            {rank <= 3 ? <RiMedalLine className={`text-lg ${medalTone}`} /> : <RiUser3Line className="text-base text-slate-500" />}
            <span className="text-xs font-semibold text-slate-300">#{rank}</span>
        </span>
    );
}

function getDeltaDisplay(delta: number) {
    if (delta > 0) {
        return (
            <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                <RiArrowUpLine className="text-sm" />+{delta}
            </span>
        );
    }
    if (delta < 0) {
        return (
            <span className="inline-flex items-center gap-1 text-rose-300 font-semibold">
                <RiArrowDownLine className="text-sm" />{delta}
            </span>
        );
    }
    return <span className="text-slate-500">0</span>;
}

const SCORE_COLORS = ['#f4f4f5', '#d4d4d8', '#a1a1aa', '#71717a', '#52525b', '#3f3f46', '#27272a', '#18181b'];

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
    const [syncError, setSyncError] = useState(false);
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
        setSyncError(false);
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
                setSyncError(true);
                setSyncMessage(result.error || 'Sync failed');
            } else {
                setSyncMessage(
                    `Synced ${result.membersSynced} members, ${result.activitiesCreated} new activities`
                );
                // Refresh data
                const refreshed = await fetch(`/api/rooms/${code}`).then((r) => r.json());
                if (!refreshed.error) setData(refreshed);
            }
        } catch {
            setSyncError(true);
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
            <div className="min-h-screen bg-[#040506] flex items-center justify-center text-rose-300 text-lg">
                {error}
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-[#040506] flex items-center justify-center">
                <div className="text-zinc-400 text-lg animate-pulse">Loading room...</div>
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
        <main className="site-shell text-zinc-100">
            <div className="site-container max-w-7xl">

                {/* ═══ Room Header ═══ */}
                <div className="panel p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-zinc-100">
                                    {room.name}
                                </h1>
                                <span className="px-3 py-1 bg-zinc-900/80 border border-zinc-700/60 rounded-full text-xs text-zinc-300 font-mono">
                                    {room.joinCode}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                                <span className="inline-flex items-center gap-1.5"><RiGroupLine className="text-zinc-300" /> {room.memberCount} members</span>
                                <span className="inline-flex items-center gap-1.5"><RiCalendarEventLine className="text-zinc-300" /> {room.periodMode.toLowerCase()} reset</span>
                                <span className="inline-flex items-center gap-1.5"><RiShieldUserLine className="text-zinc-300" /> {room.createdBy}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                href="/rooms"
                                className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                <RiArrowLeftLine className="text-zinc-300" />
                                Back
                            </Link>
                            <button
                                onClick={copyInviteLink}
                                className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                            >
                                {showInvite ? <RiCheckboxCircleLine className="text-zinc-300" /> : <RiShareForwardLine className="text-zinc-300" />}
                                {showInvite ? 'Copied' : 'Invite'}
                            </button>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-50"
                            >
                                <RiRefreshLine className={syncing ? 'animate-spin' : ''} />
                                {syncing ? 'Syncing...' : 'Sync Room'}
                            </button>
                        </div>
                    </div>
                    {syncMessage && (
                        <div className={`mt-4 text-sm p-3 rounded-lg ${syncError
                                ? 'bg-rose-900/25 text-rose-300 border border-rose-700/50'
                                : 'bg-emerald-900/25 text-emerald-300 border border-emerald-700/50'
                            }`}>
                            {syncMessage}
                        </div>
                    )}
                </div>

                {/* ═══ Main Grid: Leaderboard + Competitive Snapshot ═══ */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Leaderboard — 2/3 width */}
                    <div className="lg:col-span-2">
                        <div className="panel overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-700/60 bg-zinc-950/60">
                                <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em]">
                                    <RiTrophyLine className="text-zinc-300" /> Leaderboard
                                </h2>
                            </div>

                            <div className="divide-y divide-zinc-700/40">
                                {leaderboard.map((entry) => (
                                    <div
                                        key={entry.userId}
                                        onClick={() => toggleComparison(entry.userId)}
                                        className={`flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/25 cursor-pointer transition-all ${selectedUsers.includes(entry.userId)
                                                ? 'bg-zinc-900/40 border-l-2 border-zinc-400'
                                                : ''
                                            } ${entry.rank === 1 ? 'bg-gradient-to-r from-zinc-900/40 to-transparent' : ''}`}
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
                                                    <span className="text-xs px-2 py-0.5 bg-zinc-900/60 text-zinc-300 rounded-full border border-zinc-700/50">
                                                        COMPARE
                                                    </span>
                                                )}
                                                {entry.role === 'OWNER' && (
                                                    <span className="text-xs px-2 py-0.5 bg-zinc-900/60 text-zinc-300 rounded-full border border-zinc-700/50">
                                                        OWNER
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                                {entry.stats.leetcode && (
                                                    <span className="text-zinc-300/80">
                                                        LC: {entry.stats.leetcode.total} solved
                                                    </span>
                                                )}
                                                {entry.stats.codeforces && (
                                                    <span className="text-zinc-300/80">
                                                        CF: {entry.stats.codeforces.total} solved • {entry.stats.codeforces.rating} rating
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delta */}
                                        <div className="text-center px-4">
                                            <div className="text-xs text-zinc-500 mb-1">24h</div>
                                            {getDeltaDisplay(entry.delta24h)}
                                        </div>

                                        {/* Score */}
                                        <div className="text-right min-w-[80px]">
                                            <div className="text-2xl font-black text-zinc-100">
                                                {entry.score}
                                            </div>
                                            <div className="text-xs text-zinc-500">pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Competitive Snapshot — 1/3 width */}
                    <div>
                        <div className="panel">
                            <div className="px-6 py-4 border-b border-zinc-700/60">
                                <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-200 uppercase tracking-[0.15em]">
                                    <RiBarChartBoxLine className="text-zinc-300" /> Comparison Setup
                                </h2>
                            </div>
                            <div className="p-4">
                                <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                                    Click up to 2 members in the leaderboard to compare language mix, topics, and solve consistency.
                                </p>
                                <div className="bg-zinc-900/40 border border-zinc-700/50 rounded-lg p-3 mb-4">
                                    <div className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-2">Selected</div>
                                    {selectedEntries.length === 0 ? (
                                        <div className="text-sm text-zinc-500">No member selected yet</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {selectedEntries.map((entry) => (
                                                <div key={entry.userId} className="flex items-center justify-between text-sm">
                                                    <span className="font-semibold text-zinc-200">{entry.name}</span>
                                                    <span className="text-zinc-100 font-bold">{entry.score} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="h-56 bg-zinc-950/70 border border-zinc-700/60 rounded-lg p-3">
                                    <div className="text-xs text-zinc-500 uppercase tracking-[0.15em] mb-2">Score Share</div>
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
                                                contentStyle={{ backgroundColor: '#0c0c0d', borderColor: '#3f3f46', borderRadius: '8px' }}
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
                <div className="panel p-6 mb-8">
                    <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 uppercase tracking-[0.15em] mb-4">
                        <RiBarChartBoxLine className="text-zinc-300" /> Team Activity Heatmap
                    </h2>
                    <ActivityHeatmap submissions={allSubmissions} />
                </div>

                {/* ═══ Member Comparison View ═══ */}
                {selectedEntries.length > 0 && (
                    <div className="panel p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="inline-flex items-center gap-2 text-sm font-bold text-zinc-300 uppercase tracking-[0.15em]">
                                <RiSwordLine className="text-zinc-300" />
                                {selectedEntries.length === 2
                                    ? `${selectedEntries[0].name} vs ${selectedEntries[1].name}`
                                    : `${selectedEntries[0].name} Performance Profile`}
                            </h2>
                            <button
                                onClick={() => setSelectedUsers([])}
                                className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                            >
                                <RiCloseLine />
                                Clear
                            </button>
                        </div>

                        <div className={`grid grid-cols-1 ${selectedEntries.length === 2 ? 'xl:grid-cols-2' : ''} gap-6`}>
                            {selectedEntries.map((entry) => (
                                <section key={entry.userId} className="bg-zinc-950/60 border border-zinc-700/60 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-zinc-100">{entry.name}</h3>
                                            <p className="text-xs text-zinc-500">Rank #{entry.rank} • {entry.periodSubmissions.total} solves this period</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-zinc-100">{entry.score}</div>
                                            <div className="text-xs text-zinc-500">score</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-zinc-700/40">
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">LC Easy</div>
                                            <div className="text-base font-bold text-zinc-200">{entry.stats.leetcode?.easy ?? 0}</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-zinc-700/40">
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">LC Medium</div>
                                            <div className="text-base font-bold text-zinc-200">{entry.stats.leetcode?.medium ?? 0}</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-zinc-700/40">
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">LC Hard</div>
                                            <div className="text-base font-bold text-zinc-200">{entry.stats.leetcode?.hard ?? 0}</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-zinc-700/40">
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">CF Problems</div>
                                            <div className="text-base font-bold text-zinc-200">{entry.stats.codeforces?.total ?? 0}</div>
                                        </div>
                                        <div className="bg-zinc-900/50 rounded-lg p-2 text-center border border-zinc-700/40">
                                            <div className="text-xs text-zinc-400 uppercase tracking-wider mb-1">24h Delta</div>
                                            <div className="text-base font-bold text-zinc-200">{entry.delta24h > 0 ? `+${entry.delta24h}` : entry.delta24h}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-4">
                                        <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl p-3">
                                            <LanguagePieChart submissions={entry.submissions} languageData={entry.languageData} />
                                        </div>
                                        <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl p-3">
                                            <TopicRadarChart submissions={entry.submissions} />
                                        </div>
                                    </div>

                                    <div className="bg-zinc-900/60 border border-zinc-700/60 rounded-xl p-4">
                                        <ActivityHeatmap submissions={entry.submissions} />
                                    </div>
                                </section>
                            ))}

                            {selectedEntries.length === 1 && (
                                <div className="bg-zinc-900/40 border border-dashed border-zinc-700 rounded-xl p-6 flex items-center justify-center text-center text-zinc-500 text-sm">
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
