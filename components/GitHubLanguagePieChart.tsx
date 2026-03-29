'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { GitHubLanguageDatum } from '../lib/github';

const COLORS = [
  '#58a6ff',
  '#39d353',
  '#f0883e',
  '#a371f7',
  '#ff7b72',
  '#79c0ff',
  '#56d364',
  '#ffa657',
];

export default function GitHubLanguagePieChart({
  data,
}: {
  data: GitHubLanguageDatum[];
}) {
  if (!data || data.length === 0) {
    return (
      <div className="h-72 rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-4">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">GitHub Languages</h3>
        <div className="flex h-[85%] items-center justify-center text-sm text-zinc-500">
          No repository language data available.
        </div>
      </div>
    );
  }

  return (
    <div className="h-72 rounded-xl border border-zinc-700/60 bg-zinc-950/60 p-4">
      <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.15em] text-zinc-300">GitHub Languages</h3>
      <ResponsiveContainer width="100%" height="88%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={84}
            paddingAngle={4}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0b0b0d', borderColor: '#3f3f46', borderRadius: '8px' }}
            itemStyle={{ color: '#fff' }}
          />
          <Legend verticalAlign="bottom" height={28} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
