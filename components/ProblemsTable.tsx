// components/ProblemsTable.tsx
'use client';

import { useState } from 'react';

interface Submission {
  id: number;
  platform: string;
  problemId?: string;
  problemName: string;
  language?: string | null;
  solvedAt: Date | string;
  user?: {
    name: string;
  };
}

function getProblemUrl(platform: string, problemId?: string): string | null {
  if (!problemId) return null;
  if (platform === 'LEETCODE') {
    return `https://leetcode.com/problems/${problemId}/`;
  }
  if (platform === 'CODEFORCES') {
    // problemId format: "contestId-index", e.g. "1234-A"
    const parts = problemId.split('-');
    if (parts.length >= 2) {
      return `https://codeforces.com/problemset/problem/${parts[0]}/${parts.slice(1).join('')}`;
    }
  }
  return null;
}

// 1. We create a smaller component to handle the UI for a single user
function UserColumn({ userName, userSubmissions }: { userName: string, userSubmissions: Submission[] }) {
  const [activeTab, setActiveTab] = useState('LEETCODE');
  const [search, setSearch] = useState('');

  // Filter this specific user's submissions by the active tab and search text
  const filteredSubmissions = userSubmissions.filter((sub) => {
    const matchesPlatform = sub.platform === activeTab;
    const matchesSearch = sub.problemName.toLowerCase().includes(search.toLowerCase()) ||
      (sub.language && sub.language.toLowerCase().includes(search.toLowerCase()));
    return matchesPlatform && matchesSearch;
  });

  return (
    <div className="panel p-6 flex flex-col h-[700px]">
      <h2 className="text-2xl font-bold mb-4 text-slate-100 border-b border-slate-700/50 pb-4">
        {userName}&apos;s Log
      </h2>

      {/* Platform Tabs */}
      <div className="flex bg-slate-950/70 border border-slate-700/60 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('LEETCODE')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'LEETCODE'
            ? 'bg-slate-700/40 text-slate-100 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          LeetCode
        </button>
        <button
          onClick={() => setActiveTab('CODEFORCES')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'CODEFORCES'
            ? 'bg-slate-700/40 text-slate-100 shadow-sm'
            : 'text-slate-500 hover:text-slate-300'
            }`}
        >
          Codeforces
        </button>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        placeholder={`Search ${activeTab} problems...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full input-dark px-4 py-2 transition-colors mb-4 text-sm"
      />

      {/* Scrolling Table Area */}
      <div className="flex-grow overflow-y-auto pr-2 rounded-lg border border-slate-700/40">
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
                      {new Date(sub.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
  );
}

// 2. The Main Component that groups the data and renders the columns side-by-side
export default function ProblemsTable({ submissions = [] }: { submissions?: Submission[] }) {

  // 1. Safety check! If there are no submissions, stop right here.
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center text-slate-500 italic mt-10">
        No problem data available. Sync to fetch data.
      </div>
    );
  }

  // 2. Group all submissions by the user's name
  const groupedByUser = submissions.reduce((acc, sub) => {
    // Fallback to 'Unknown User' just in case a relation didn't load properly
    const userName = sub.user?.name || 'Unknown User';
    if (!acc[userName]) acc[userName] = [];
    acc[userName].push(sub);
    return acc;
  }, {} as Record<string, Submission[]>);

  const userNames = Object.keys(groupedByUser);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {userNames.map(userName => (
        <UserColumn
          key={userName}
          userName={userName}
          userSubmissions={groupedByUser[userName]}
        />
      ))}
    </div>
  );
}