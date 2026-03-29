'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { GitHubLanguageDatum } from '../lib/github';

const KNOWN_COLORS: Record<string, string> = {
  'TypeScript': '#0ea5e9',
  'JavaScript': '#f59e0b',
  'Python': '#eab308',
  'Java': '#ef4444',
  'C++': '#3b82f6',
  'C': '#a3a3a3',
  'C#': '#68217a',
  'Go': '#00add8',
  'Rust': '#dea584',
  'Ruby': '#cc342d',
  'Swift': '#f05138',
  'Kotlin': '#7f52ff',
  'Scala': '#dc322f',
  'PHP': '#777bb4',
  'Dart': '#0175c2',
  'Haskell': '#5e5086',
  'Lua': '#000080',
  'Shell': '#4eaa25',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'SCSS': '#c6538c',
  'Vue': '#41b883',
  'Svelte': '#ff3e00',
  'Jupyter Notebook': '#da5b0b',
  'R': '#276dc3',
  'Elixir': '#6e4a7e',
  'Zig': '#f7a41d',
  'Nix': '#7ebae4',
  'Dockerfile': '#384d54',
  'Makefile': '#427819',
};
const EXTRA_COLORS = ['#58a6ff', '#39d353', '#f0883e', '#a371f7', '#ff7b72', '#79c0ff', '#56d364', '#ffa657'];
let extraIdx = 0;

function getColor(name: string): string {
  if (KNOWN_COLORS[name]) return KNOWN_COLORS[name];
  return EXTRA_COLORS[extraIdx++ % EXTRA_COLORS.length];
}

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
              <Cell key={`${entry.name}-${index}`} fill={getColor(entry.name)} />
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
