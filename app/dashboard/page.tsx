// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import SyncButton from '../../components/SyncButton';
import ProgressChart from '../../components/ProgressChart';
import ActivityHeatmap from '../../components/ActivityHeatmap';
import LanguagePieChart from '../../components/LanguagePieChart';
import TopicRadarChart from '../../components/TopicRadarChart';
import DashboardCpDevCard from '../../components/DashboardCpDevCard';
import LogoutButton from '../../components/LogoutButton';
import { getCurrentUser } from '../../lib/auth';
import { getLanguageDistributionForUser } from '../../lib/languageDistribution';
import { getGitHubStats } from '../../lib/github';
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
      githubHandle: true,
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
  const githubStats = await getGitHubStats(user.githubHandle);

  const languageData = await getLanguageDistributionForUser({
    leetcodeHandle: user.leetcodeHandle,
    codeforcesHandle: user.codeforcesHandle,
    fallbackSubmissions: user.submissions.map((sub) => ({
      platform: sub.platform,
      language: sub.language,
    })),
  });

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

        <DashboardCpDevCard
          latestLeetCode={latestLeetCode || null}
          latestCodeforces={latestCodeforces || null}
          githubHandle={user.githubHandle}
          githubStats={githubStats}
        />

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
              <h3 className="text-xl font-bold mb-4 inline-flex items-center gap-2"><RiPieChart2Line className="text-zinc-300" /> Languages (Your Lifetime from Coding Sites)</h3>
              <LanguagePieChart submissions={user.submissions} languageData={languageData} />
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
