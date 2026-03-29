import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authUser = await getCurrentUser();
  if (!authUser) {
    redirect('/auth');
  }

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      snapshots: {
        orderBy: { recordedAt: 'desc' },
      },
      submissions: {
        orderBy: { solvedAt: 'desc' },
        take: 20,
      },
    },
  });

  if (!user) {
    notFound();
  }

  const latestLeetCode = user.snapshots.find((s) => s.platform === 'LEETCODE');
  const latestCodeforces = user.snapshots.find((s) => s.platform === 'CODEFORCES');

  return (
    <main className="site-shell text-slate-100 p-6 md:p-10">
      <div className="site-container max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
            {user.name}
          </h1>
          <Link href="/" className="btn-ghost px-3 py-1.5 text-sm">
            Back
          </Link>
        </div>

        <div className="panel p-5 mb-6">
          <h2 className="section-title mb-3">Platform Handles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded p-3">
              <div className="text-slate-400 text-xs mb-1">GitHub</div>
              <div>{user.githubHandle || 'Not set'}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded p-3">
              <div className="text-slate-400 text-xs mb-1">LeetCode</div>
              <div>{user.leetcodeHandle || 'Not set'}</div>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded p-3">
              <div className="text-slate-400 text-xs mb-1">Codeforces</div>
              <div>{user.codeforcesHandle || 'Not set'}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="panel p-4">
            <h3 className="text-sm uppercase tracking-widest text-orange-400 mb-2">LeetCode Snapshot</h3>
            {latestLeetCode ? (
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Total: {latestLeetCode.totalSolved}</li>
                <li>Easy: {latestLeetCode.easySolved || 0}</li>
                <li>Medium: {latestLeetCode.mediumSolved || 0}</li>
                <li>Hard: {latestLeetCode.hardSolved || 0}</li>
              </ul>
            ) : (
              <div className="text-sm text-slate-500">No LeetCode data yet.</div>
            )}
          </div>

          <div className="panel p-4">
            <h3 className="text-sm uppercase tracking-widest text-zinc-300 mb-2">Codeforces Snapshot</h3>
            {latestCodeforces ? (
              <ul className="text-sm text-slate-300 space-y-1">
                <li>Total Solved: {latestCodeforces.totalSolved}</li>
                <li>Rating: {latestCodeforces.rating || 'N/A'}</li>
                <li>Peak Rating: {latestCodeforces.maxRating || 'N/A'}</li>
                <li>Rank: {latestCodeforces.rank || 'N/A'}</li>
              </ul>
            ) : (
              <div className="text-sm text-slate-500">No Codeforces data yet.</div>
            )}
          </div>
        </div>

        <div className="panel p-4">
          <h2 className="section-title mb-3">Recent Solves</h2>
          {user.submissions.length === 0 ? (
            <div className="text-sm text-slate-500">No submissions yet.</div>
          ) : (
            <div className="space-y-2">
              {user.submissions.map((sub) => (
                <div key={sub.id} className="text-sm bg-slate-800/40 border border-slate-700/50 rounded p-2">
                  <span className="font-semibold">{sub.problemName}</span> <span className="text-slate-400">({sub.platform})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
