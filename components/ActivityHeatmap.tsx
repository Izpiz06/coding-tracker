// components/ActivityHeatmap.tsx
'use client';

import {ActivityCalendar, ThemeInput } from 'react-activity-calendar';

export default function ActivityHeatmap({ snapshots }: { snapshots: any[] }) {
  // 1. Group snapshots by Date (YYYY-MM-DD) and find the max total for each platform per day
  const dailyTotals = new Map<string, { lc: number; cf: number }>();

  // Sort snapshots oldest to newest to calculate progress
  const sortedSnaps = [...snapshots].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );

  sortedSnaps.forEach((snap) => {
    const dateStr = new Date(snap.recordedAt).toISOString().split('T')[0];
    
    if (!dailyTotals.has(dateStr)) {
      dailyTotals.set(dateStr, { lc: 0, cf: 0 });
    }
    
    const current = dailyTotals.get(dateStr)!;
    if (snap.platform === 'LEETCODE') current.lc = Math.max(current.lc, snap.totalSolved);
    if (snap.platform === 'CODEFORCES') current.cf = Math.max(current.cf, snap.totalSolved);
  });

  // 2. Calculate the daily difference (problems solved exactly on that day)
  const calendarData: { date: string; count: number; level: number }[] = [];
  let previousTotal = 0;
  let currentStreak = 0;

  Array.from(dailyTotals.entries()).forEach(([date, totals]) => {
    const dayTotal = totals.lc + totals.cf;
    
    // Calculate how many were solved today vs yesterday
    let dailySolved = 0;
    if (previousTotal > 0) {
      dailySolved = dayTotal - previousTotal;
    }
    
    // Determine the "green" level (0 = none, 1-4 = light to dark green)
    let level = 0;
    if (dailySolved > 0) level = 1;
    if (dailySolved > 2) level = 2;
    if (dailySolved > 5) level = 3;
    if (dailySolved > 10) level = 4;

    calendarData.push({ date, count: Math.max(0, dailySolved), level });
    
    // Streak logic
    if (dailySolved > 0) {
      currentStreak++;
    } else {
      currentStreak = 0; // Reset streak if 0 solved
    }

    previousTotal = dayTotal;
  });

  // Ensure we have at least one data point to prevent calendar crashes
  if (calendarData.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    calendarData.push({ date: today, count: 0, level: 0 });
  }

  // Customizing the GitHub-style green colors
  const greenTheme: ThemeInput = {
    light: ['#262626', '#14532d', '#166534', '#15803d', '#22c55e'],
    dark: ['#262626', '#14532d', '#166534', '#15803d', '#22c55e'],
  };

  return (
    <div className="mt-8 pt-6 border-t border-neutral-800">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">
          Activity Map
        </h3>
        <div className="text-right">
          <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Current Streak</div>
          <div className="text-2xl font-black text-emerald-400">🔥 {currentStreak} Days</div>
        </div>
      </div>
      
      <div className="flex justify-center overflow-x-auto pb-4">
        <ActivityCalendar 
          data={calendarData} 
          theme={greenTheme}
          colorScheme="dark"
          labels={{
            totalCount: '{{count}} problems solved in this timeframe',
          }}
        />
      </div>
    </div>
  );
}