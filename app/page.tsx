// app/page.tsx
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import SyncButton from '../components/SyncButton';
import ProgressChart from '../components/ProgressChart';
import ActivityHeatmap from '../components/ActivityHeatmap';
import LanguagePieChart from '../components/LanguagePieChart';
import TopicRadarChart from '../components/TopicRadarChart';

export const revalidate = 0; 

export default async function Home() {
  const users = await prisma.user.findMany({
    include: {
      snapshots: {
        orderBy: { recordedAt: 'desc' },
      },
      submissions: true,
    },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header containing the Title, Link, and Sync Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Coding Progress Tracker
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/problems" 
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              View All Questions
            </Link>
            <SyncButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {users.map((user) => {
            const latestLeetCode = user.snapshots.find(s => s.platform === 'LEETCODE');
            const latestCodeforces = user.snapshots.find(s => s.platform === 'CODEFORCES');

            return (
              <div key={user.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col">
                <h2 className="text-2xl font-bold mb-6 border-b border-neutral-800 pb-4">
                  {user.name}
                </h2>

                <div className="space-y-6 flex-grow">
                  {/* LeetCode Card */}
                  {latestLeetCode ? (
                    <div className="bg-neutral-800/50 rounded-lg p-5 border border-neutral-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-orange-400">LeetCode</h3>
                        <span className="text-sm text-neutral-400">
                          Total: <span className="text-white font-bold">{latestLeetCode.totalSolved}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-sm">
                        <div className="bg-green-500/10 text-green-400 p-2 rounded">
                          <div className="font-bold text-lg">{latestLeetCode.easySolved}</div>Easy
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-400 p-2 rounded">
                          <div className="font-bold text-lg">{latestLeetCode.mediumSolved}</div>Medium
                        </div>
                        <div className="bg-red-500/10 text-red-400 p-2 rounded">
                          <div className="font-bold text-lg">{latestLeetCode.hardSolved}</div>Hard
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 italic">No LeetCode data found.</div>
                  )}

                  {/* Codeforces Card */}
                  {latestCodeforces ? (
                    <div className="bg-neutral-800/50 rounded-lg p-5 border border-neutral-700/50">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-blue-400">Codeforces</h3>
                        <span className="text-sm text-neutral-400">
                          Total Solved: <span className="text-white font-bold">{latestCodeforces.totalSolved}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-neutral-800 p-3 rounded">
                          <div className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Current Rating</div>
                          <div className="text-xl font-bold">{latestCodeforces.rating || 'N/A'}</div>
                        </div>
                        <div className="bg-neutral-800 p-3 rounded">
                          <div className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Peak Rating</div>
                          <div className="text-xl font-bold">{latestCodeforces.maxRating || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-neutral-500 italic">No Codeforces data found.</div>
                  )}
                </div>

                {/* --- The Stacked Visualizations Layout --- */}
                <div className="mt-8 pt-6 border-t border-neutral-800 space-y-4">
                  
                  {/* 1. Full-width Line Chart on top */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl">
                    <ProgressChart snapshots={user.snapshots} />
                  </div>
                  
                  {/* 2. Donut Chart and Radar Chart side-by-side below it */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <LanguagePieChart submissions={user.submissions} />
                    <TopicRadarChart submissions={user.submissions} />
                  </div>

                </div>

                {/* 3. Heatmap at the bottom */}
                <div className="mt-4">
                  {/* THE FIX IS HERE: Changed snapshots to submissions */}
                  <ActivityHeatmap submissions={user.submissions} />
                </div>
                
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}