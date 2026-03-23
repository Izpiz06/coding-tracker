// components/ProblemsTable.tsx
'use client';

import { useState } from 'react';

// 1. We create a smaller component to handle the UI for a single user
function UserColumn({ userName, userSubmissions }: { userName: string, userSubmissions: any[] }) {
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
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col h-[700px]">
      <h2 className="text-2xl font-bold mb-4 text-white border-b border-neutral-800 pb-4">
        {userName}'s Log
      </h2>

      {/* Platform Tabs */}
      <div className="flex bg-neutral-950 border border-neutral-800 rounded-lg p-1 mb-4">
        <button
          onClick={() => setActiveTab('LEETCODE')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'LEETCODE'
              ? 'bg-orange-500/20 text-orange-400 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
            }`}
        >
          LeetCode
        </button>
        <button
          onClick={() => setActiveTab('CODEFORCES')}
          className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'CODEFORCES'
              ? 'bg-blue-500/20 text-blue-400 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-300'
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
        className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-emerald-500 transition-colors mb-4 text-sm"
      />

      {/* Scrolling Table Area */}
      <div className="flex-grow overflow-y-auto pr-2 rounded-lg border border-neutral-800/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-950 sticky top-0 text-neutral-400 uppercase tracking-wider text-xs z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Problem</th>
              <th className="px-4 py-3 font-medium">Lang</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/50">
            {filteredSubmissions.length > 0 ? (
              filteredSubmissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="px-4 py-3 text-neutral-400 whitespace-nowrap text-xs">
                    {new Date(sub.solvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-emerald-400 font-medium">
                    {sub.problemName}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {sub.language || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-neutral-500 italic">
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
export default function ProblemsTable({ submissions = [] }: { submissions?: any[] }) {

  // 1. Safety check! If there are no submissions, stop right here.
  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center text-neutral-500 italic mt-10">
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
  }, {} as Record<string, any[]>);

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