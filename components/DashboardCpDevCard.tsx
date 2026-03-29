'use client';

import { useState } from 'react';
import { RiCodeSSlashLine, RiGithubFill } from 'react-icons/ri';
import type { GitHubStats } from '../lib/github';
import GitHubDevelopmentPanel from './GitHubDevelopmentPanel';

interface SnapshotLite {
  totalSolved: number;
  easySolved: number | null;
  mediumSolved: number | null;
  hardSolved: number | null;
  rating: number | null;
  maxRating: number | null;
  rank: string | null;
}

type Mode = 'CP' | 'DEVELOPMENT';

export default function DashboardCpDevCard({
  latestLeetCode,
  latestCodeforces,
  githubHandle,
  githubStats,
}: {
  latestLeetCode: SnapshotLite | null;
  latestCodeforces: SnapshotLite | null;
  githubHandle: string | null;
  githubStats: GitHubStats | null;
}) {
  const [mode, setMode] = useState<Mode>('CP');

  return (
    <section className="panel p-6 mb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-xl font-bold text-slate-100">Performance Sections</h2>
        <div className="inline-flex rounded-lg border border-zinc-700/60 bg-zinc-950/70 p-1">
          <button
            type="button"
            onClick={() => setMode('CP')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
              mode === 'CP' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <RiCodeSSlashLine /> CP
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMode('DEVELOPMENT')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
              mode === 'DEVELOPMENT' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              <RiGithubFill /> DEVELOPMENT
            </span>
          </button>
        </div>
      </div>

      <div className="flip-scene">
        <div className={`flip-card ${mode === 'DEVELOPMENT' ? 'is-flipped' : ''}`}>
          <div className="flip-face flip-front space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latestLeetCode ? (
                <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">LeetCode</h3>
                    <span className="text-2xl font-black text-orange-400">{latestLeetCode.totalSolved}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-green-500/10 p-3">
                      <div className="text-xl font-bold text-green-400">{latestLeetCode.easySolved ?? 0}</div>
                      <div className="text-[10px] uppercase tracking-wider text-green-300">Easy</div>
                    </div>
                    <div className="rounded-lg bg-yellow-500/10 p-3">
                      <div className="text-xl font-bold text-yellow-400">{latestLeetCode.mediumSolved ?? 0}</div>
                      <div className="text-[10px] uppercase tracking-wider text-yellow-300">Medium</div>
                    </div>
                    <div className="rounded-lg bg-red-500/10 p-3">
                      <div className="text-xl font-bold text-red-400">{latestLeetCode.hardSolved ?? 0}</div>
                      <div className="text-[10px] uppercase tracking-wider text-red-300">Hard</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5 text-slate-500 italic">
                  No LeetCode data yet.
                </div>
              )}

              {latestCodeforces ? (
                <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Codeforces</h3>
                    <span className="text-2xl font-black text-zinc-100">{latestCodeforces.totalSolved}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-zinc-900 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Current Rating</div>
                      <div className="text-xl font-bold">{latestCodeforces.rating ?? 'N/A'}</div>
                    </div>
                    <div className="rounded-lg bg-zinc-900 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">Peak Rating</div>
                      <div className="text-xl font-bold">{latestCodeforces.maxRating ?? 'N/A'}</div>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mt-3">Rank: {latestCodeforces.rank || 'N/A'}</div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-5 text-slate-500 italic">
                  No Codeforces data yet.
                </div>
              )}
            </div>
          </div>

          <div className="flip-face flip-back">
            <GitHubDevelopmentPanel githubHandle={githubHandle} stats={githubStats} />
          </div>
        </div>
      </div>
    </section>
  );
}
