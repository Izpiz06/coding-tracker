// components/ActivityHeatmap.tsx
'use client';

import { ActivityCalendar, ThemeInput } from 'react-activity-calendar';

export default function ActivityHeatmap({ submissions }: { submissions: any[] }) {
  // 1. Count how many problems were solved on each specific day
  const dailyCounts = new Map<string, number>();

  submissions.forEach((sub) => {
    // Extract just the YYYY-MM-DD part of the date
    const dateStr = new Date(sub.solvedAt).toISOString().split('T')[0];
    dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + 1);
  });

  // 2. Format the data for the Calendar component
  const calendarData = Array.from(dailyCounts.entries()).map(([date, count]) => {
    // Determine the "green" level (0 = none, 1-4 = light to dark green)
    let level = 0;
    if (count > 0) level = 1;
    if (count > 2) level = 2;
    if (count > 5) level = 3;
    if (count >= 10) level = 4;

    return { date, count, level };
  });

  // Sort by date ascending (oldest to newest)
  calendarData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Ensure we have at least one data point so the calendar doesn't crash on empty DBs
  if (calendarData.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    calendarData.push({ date: today, count: 0, level: 0 });
  }

  // 3. Calculate the True Current Streak
  let currentStreak = 0;
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // A streak is only alive if you solved something today or yesterday
  if (dailyCounts.has(todayStr) || dailyCounts.has(yesterdayStr)) {
    let checkDate = dailyCounts.has(todayStr) ? new Date(todayStr) : new Date(yesterdayStr);

    while (true) {
      const checkStr = checkDate.toISOString().split('T')[0];
      if (dailyCounts.has(checkStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1); // Go back one day
      } else {
        break; // Streak broken
      }
    }
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