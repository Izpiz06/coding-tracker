// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import SyncButton from '../../components/SyncButton';
import ProgressChart from '../../components/ProgressChart';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import LanguagePieChart from '../../components/LanguagePieChart';
import TopicRadarChart from '../../components/TopicRadarChart';
import LogoutButton from '../../components/LogoutButton';
import { getCurrentUser } from '../../lib/auth';

export const revalidate = 0;

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth');
  }

  const user = await prisma.user.findUnique({
    where: { id: currentUser.id },
    select: {
      id: true,
      name: true,
      leetcodeHandle: true,
      codeforcesHandle: true,
      snapshots: {
        orderBy: { recordedAt: 'desc' },
      },
      submissions: true,
    },
  });

  if (!user) {
    redirect('/auth');
  }

  const latestLeetCode = user.snapshots.find(s => s.platform === 'LEETCODE');
  const latestCodeforces = user.snapshots.find(s => s.platform === 'CODEFORCES');

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              📊 Your Dashboard
            </h1>
            <p className="text-sm text-neutral-400 mt-1">{user.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              ← Back Home
            </Link>
            <SyncButton />
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* LeetCode Card */}
          {latestLeetCode ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">LeetCode</h2>
                <span className="text-3xl font-black text-orange-400">{latestLeetCode.totalSolved}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-green-500/10 text-green-400 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{latestLeetCode.easySolved}</div>
                  <div className="text-xs uppercase tracking-wider text-green-300 mt-1">Easy</div>
                </div>
                <div className="bg-yellow-500/10 text-yellow-400 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{latestLeetCode.mediumSolved}</div>
                  <div className="text-xs uppercase tracking-wider text-yellow-300 mt-1">Medium</div>
                </div>
                <div className="bg-red-500/10 text-red-400 p-4 rounded-lg">
                  <div className="text-2xl font-bold">{latestLeetCode.hardSolved}</div>
                  <div className="text-xs uppercase tracking-wider text-red-300 mt-1">Hard</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl text-neutral-500 italic">
              No LeetCode data yet. Hit sync to get started!
            </div>
          )}

          {/* Codeforces Card */}
          {latestCodeforces ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Codeforces</h2>
                <span className="text-3xl font-black text-blue-400">{latestCodeforces.totalSolved}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <div className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Current Rating</div>
                  <div className="text-3xl font-bold">{latestCodeforces.rating || 'N/A'}</div>
                </div>
                <div className="bg-neutral-800 p-4 rounded-lg">
                  <div className="text-neutral-400 text-xs uppercase tracking-wider mb-2">Peak Rating</div>
                  <div className="text-3xl font-bold">{latestCodeforces.maxRating || 'N/A'}</div>
                </div>
              </div>
              {latestCodeforces.rank && (
                <p className="text-sm text-neutral-400 mt-4">
                  Rank: <span className="text-white font-semibold">{latestCodeforces.rank}</span>
                </p>
              )}
            </div>
          ) : (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl text-neutral-500 italic">
              No Codeforces data yet. Hit sync to get started!
            </div>
          )}

        </div>

        {/* Charts */}
        <div className="space-y-8">

          {/* Progress Chart */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">📈 Growth Over Time</h3>
            <ProgressChart snapshots={user.snapshots} />
          </div>

          {/* Language & Topic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">💻 Languages</h3>
              <LanguagePieChart submissions={user.submissions} />
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4">🎯 Topics</h3>
              <TopicRadarChart submissions={user.submissions} />
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-xl font-bold mb-4">🔥 Activity Heatmap</h3>
            <ActivityHeatmap submissions={user.submissions} />
          </div>

        </div>

      </div>
    </main>
  );
}
