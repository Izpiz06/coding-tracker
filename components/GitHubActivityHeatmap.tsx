'use client';

import { useMemo } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';
import type { GitHubContributionDay } from '../lib/github';

export default function GitHubActivityHeatmap({
  data,
  totalContributions,
}: {
  data: GitHubContributionDay[];
  totalContributions: number;
}) {
  const currentStreak = useMemo(() => {
    const activeDays = new Set(
      data
        .filter((d) => d.count > 0)
        .map((d) => d.date)
    );

    let streak = 0;
    const mostRecentDate = data[data.length - 1]?.date;
    if (!mostRecentDate) {
      return 0;
    }

    const todayStr = mostRecentDate;
    const yesterdayDate = new Date(mostRecentDate);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    if (activeDays.has(todayStr) || activeDays.has(yesterdayStr)) {
      const checkDate = activeDays.has(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);

      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (activeDays.has(checkStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return streak;
  }, [data]);

  const theme: ThemeInput = {
    light: ['#1f2937', '#0e4429', '#006d32', '#26a641', '#39d353'],
    dark: ['#1f2937', '#0e4429', '#006d32', '#26a641', '#39d353'],
  };

  return (
    <div className="rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-4">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">
          GitHub Activity
        </h3>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.15em] text-zinc-500">Current Streak</div>
          <div className="text-lg font-black text-emerald-400">{currentStreak} days</div>
        </div>
      </div>

      <div className="mb-3 flex justify-center overflow-x-auto pb-3">
        <ActivityCalendar
          data={data}
          theme={theme}
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} contributions in this timeframe',
          }}
        />
      </div>

      <div className="text-xs text-zinc-500">Total contributions (last year): {totalContributions}</div>
    </div>
  );
}
