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
import { RiArrowLeftLine, RiBarChartLine, RiFireLine, RiLineChartLine, RiPieChart2Line } from 'react-icons/ri';

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
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100 inline-flex items-center gap-2">
              <RiBarChartLine className="text-zinc-300" /> Your Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">{user.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/"
              className="btn-ghost inline-flex items-center gap-1 px-4 py-2 text-sm"
            >
              <RiArrowLeftLine /> Back Home
            </Link>
            <SyncButton />
            <LogoutButton />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">

          {/* LeetCode Card */}
          {latestLeetCode ? (
            <div className="panel p-6">
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
            <div className="panel p-6 text-slate-500 italic">
              No LeetCode data yet. Hit sync to get started!
            </div>
          )}

          {/* Codeforces Card */}
          {latestCodeforces ? (
            <div className="panel p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Codeforces</h2>
                <span className="text-3xl font-black text-zinc-100">{latestCodeforces.totalSolved}</span>
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
            <div className="panel p-6 text-slate-500 italic">
              No Codeforces data yet. Hit sync to get started!
            </div>
          )}

        </div>

        {/* Charts */}
        <div className="space-y-8">

          {/* Progress Chart */}
          <div className="panel p-6">
            <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2"><RiLineChartLine className="text-zinc-300" /> Growth Over Time</h3>
            <ProgressChart snapshots={user.snapshots} />
          </div>

          {/* Language & Topic Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="panel p-6">
              <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2"><RiPieChart2Line className="text-zinc-300" /> Languages</h3>
              <LanguagePieChart submissions={user.submissions} />
            </div>
            <div className="panel p-6">
              <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2"><RiPieChart2Line className="text-zinc-300" /> Topics</h3>
              <TopicRadarChart submissions={user.submissions} />
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="panel p-6">
            <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2"><RiFireLine className="text-zinc-300" /> Activity Heatmap</h3>
            <ActivityHeatmap submissions={user.submissions} />
          </div>

        </div>

      </div>
    </main>
  );
}
