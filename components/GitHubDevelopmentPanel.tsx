import type { GitHubStats } from '../lib/github';
import GitHubActivityHeatmap from './GitHubActivityHeatmap';
import GitHubLanguagePieChart from './GitHubLanguagePieChart';

export default function GitHubDevelopmentPanel({
  githubHandle,
  stats,
  loading,
}: {
  githubHandle: string | null;
  stats: GitHubStats | null;
  loading?: boolean;
}) {
  if (!githubHandle) {
    return (
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5 text-sm text-zinc-400">
        GitHub handle is not set. Add it in profile setup to unlock the Development section.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5 text-sm text-zinc-400 animate-pulse">
        Loading GitHub development stats...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5 text-sm text-zinc-400">
        Could not fetch GitHub stats for @{githubHandle}. Check the handle and try again.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 p-4">
          <div className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-1">GitHub</div>
          <a
            href={`https://github.com/${stats.username}`}
            target="_blank"
            rel="noreferrer"
            className="text-lg font-bold text-zinc-100 hover:text-zinc-300 transition-colors"
          >
            @{stats.username}
          </a>
        </div>
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 p-4">
          <div className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-1">Total Contributions</div>
          <div className="text-2xl font-black text-zinc-100">{stats.totalContributions}</div>
          <div className="text-xs text-zinc-500 mt-1">Last 12 months</div>
        </div>
        <div className="rounded-lg border border-zinc-700/60 bg-zinc-950/60 p-4">
          <div className="text-xs uppercase tracking-[0.15em] text-zinc-500 mb-1">Public Repos</div>
          <div className="text-2xl font-black text-zinc-100">{stats.publicRepos}</div>
          <div className="text-xs text-zinc-500 mt-1">
            {stats.followers} followers • {stats.following} following
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <GitHubLanguagePieChart data={stats.languages} />
        <GitHubActivityHeatmap data={stats.heatmap} totalContributions={stats.totalContributions} />
      </div>
    </div>
  );
}
