// components/ActivityHeatmap.tsx
'use client';

import { useMemo } from 'react';
import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';

interface Submission {
  solvedAt: Date | string;
}

export default function ActivityHeatmap({ submissions }: { submissions: Submission[] }) {
  const { calendarData, currentStreak } = useMemo(() => {
    // 1. Count how many problems were solved on each specific day
    const dailyCounts = new Map<string, number>();

    submissions.forEach((sub) => {
      // Extract just the YYYY-MM-DD part of the date
      const dateStr = new Date(sub.solvedAt).toISOString().split('T')[0];
      dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
    });

    // 2. Format the data for the Calendar component
    const data = Array.from(dailyCounts.entries()).map(([date, count]) => {
      // Determine the "green" level (0 = none, 1-4 = light to dark green)
      let level = 0;
      if (count > 0) level = 1;
      if (count > 2) level = 2;
      if (count > 5) level = 3;
      if (count >= 10) level = 4;

      return { date, count, level };
    });

    // Sort by date ascending (oldest to newest)
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ensure we have at least one data point so the calendar doesn't crash on empty DBs
    if (data.length === 0) {
      const today = new Date().toISOString().split('T')[0];
      data.push({ date: today, count: 0, level: 0 });
    }

    // 3. Calculate the True Current Streak
    let streak = 0;
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const todayStr = new Date(now).toISOString().split('T')[0];
    const yesterdayStr = new Date(now - 86400000).toISOString().split('T')[0];

    // A streak is only alive if you solved something today or yesterday
    if (dailyCounts.has(todayStr) || dailyCounts.has(yesterdayStr)) {
      const checkDate = dailyCounts.has(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);

      while (true) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (dailyCounts.has(checkStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1); // Go back one day
        } else {
          break; // Streak broken
        }
      }
    }

    return { calendarData: data, currentStreak: streak };
  }, [submissions]);

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
          <div className="text-2xl font-black text-emerald-400">{currentStreak} Days</div>
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