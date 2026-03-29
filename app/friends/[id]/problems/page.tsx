'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { RiArrowLeftLine } from 'react-icons/ri';

interface Submission {
    id: number;
    platform: string;
    problemId: string;
    problemName: string;
    language: string | null;
    tags: string[];
    solvedAt: string | Date;
    user?: { name: string };
}

function getProblemUrl(platform: string, problemId?: string): string | null {
    if (!problemId) return null;
    if (platform === 'LEETCODE') {
        return `https://leetcode.com/problems/${problemId}/`;
    }
    if (platform === 'CODEFORCES') {
        const parts = problemId.split('-');
        if (parts.length >= 2) {
            return `https://codeforces.com/problemset/problem/${parts[0]}/${parts.slice(1).join('')}`;
        }
    }
    return null;
}

export default function FriendProblemsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [friendName, setFriendName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('LEETCODE');
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch(`/api/friends/${id}/submissions`)
            .then(async (res) => {
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || 'Failed to load');
                    return;
                }
                const data = await res.json();
                setSubmissions(data.submissions || []);
                if (data.submissions?.length > 0 && data.submissions[0].user?.name) {
                    setFriendName(data.submissions[0].user.name);
                }
            })
            .catch(() => setError('Failed to load submissions'))
            .finally(() => setLoading(false));
    }, [id]);

    const filteredSubmissions = submissions.filter((sub) => {
        const matchesPlatform = sub.platform === activeTab;
        const matchesSearch = sub.problemName.toLowerCase().includes(search.toLowerCase()) ||
            (sub.language && sub.language.toLowerCase().includes(search.toLowerCase()));
        return matchesPlatform && matchesSearch;
    });

    if (loading) {
        return (
            <main className="site-shell text-slate-100 flex items-center justify-center">
                <div className="text-zinc-400 text-lg animate-pulse">Loading...</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="site-shell text-slate-100 flex items-center justify-center">
                <div className="panel p-6 text-center">
                    <p className="text-rose-300 mb-4">{error}</p>
                    <Link href="/friends" className="btn-ghost px-4 py-2 text-sm">
                        ← Back to Friends
                    </Link>
                </div>
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
                            {friendName ? `${friendName}'s Problems` : 'Friend\'s Problems'}
                        </h1>
                        <p className="text-sm text-slate-400 mt-1">
                            {submissions.length} total submissions
                        </p>
                    </div>
                    <Link
                        href="/friends"
                        className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
                    >
                        <RiArrowLeftLine className="text-zinc-300" />
                        Back to Friends
                    </Link>
                </div>

                {/* Platform Tabs + Search */}
                <div className="panel p-6">
                    <div className="flex bg-slate-950/70 border border-slate-700/60 rounded-lg p-1 mb-4">
                        <button
                            onClick={() => setActiveTab('LEETCODE')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'LEETCODE'
                                ? 'bg-slate-700/40 text-slate-100 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            LeetCode ({submissions.filter((s) => s.platform === 'LEETCODE').length})
                        </button>
                        <button
                            onClick={() => setActiveTab('CODEFORCES')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'CODEFORCES'
                                ? 'bg-slate-700/40 text-slate-100 shadow-sm'
                                : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Codeforces ({submissions.filter((s) => s.platform === 'CODEFORCES').length})
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder={`Search ${activeTab} problems...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full input-dark px-4 py-2 transition-colors mb-4 text-sm"
                    />

                    {/* Submissions Table */}
                    <div className="max-h-[600px] overflow-y-auto rounded-lg border border-slate-700/40">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-950/80 sticky top-0 text-slate-400 uppercase tracking-wider text-xs z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Problem</th>
                                    <th className="px-4 py-3 font-medium">Lang</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/40">
                                {filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((sub) => {
                                        const url = getProblemUrl(sub.platform, sub.problemId);
                                        return (
                                            <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-4 py-3 text-slate-400 whitespace-nowrap text-xs">
                                                    {new Date(sub.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 font-medium">
                                                    {url ? (
                                                        <a
                                                            href={url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-slate-200 hover:text-emerald-300 transition-colors underline underline-offset-2 decoration-slate-600 hover:decoration-emerald-400"
                                                        >
                                                            {sub.problemName}
                                                        </a>
                                                    ) : (
                                                        <span className="text-slate-200">{sub.problemName}</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-slate-400 text-xs">
                                                    {sub.language || '-'}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-8 text-center text-slate-500 italic">
                                            No {activeTab} problems found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </main>
    );
}
