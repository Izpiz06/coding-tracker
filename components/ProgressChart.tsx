// components/ProgressChart.tsx
'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function ProgressChart({ snapshots }: { snapshots: any[] }) {
  // 1. Group the raw database snapshots by Date
  const dataMap = new Map();

  snapshots.forEach((snap) => {
    // Format the date to something clean like "Mar 14"
    const date = new Date(snap.recordedAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    if (!dataMap.has(date)) {
      dataMap.set(date, { date });
    }

    const existingDate = dataMap.get(date);

    // Assign the correct platform stats to that specific date
    if (snap.platform === 'LEETCODE') {
      existingDate.leetCodeSolved = snap.totalSolved;
    } else if (snap.platform === 'CODEFORCES') {
      existingDate.codeforcesSolved = snap.totalSolved;
    }
  });

  // 2. Convert to an array and reverse so the oldest date is on the left
  const chartData = Array.from(dataMap.values()).reverse();

  // If there's no data yet, just show a placeholder
  if (chartData.length === 0) {
    return <div className="text-neutral-500 italic mt-6 text-sm">Hit sync to generate chart data.</div>;
  }

  return (
    <div className="h-64 w-full mt-8 border-t border-neutral-800 pt-6">
      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4">
        Growth Over Time
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
          <XAxis dataKey="date" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Line
            type="monotone"
            dataKey="leetCodeSolved"
            name="LeetCode"
            stroke="#f97316" // Orange
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="codeforcesSolved"
            name="Codeforces"
            stroke="#3b82f6" // Blue
            strokeWidth={3}
            dot={{ r: 4, strokeWidth: 2 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}