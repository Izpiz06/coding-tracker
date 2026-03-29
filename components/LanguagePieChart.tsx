// components/LanguagePieChart.tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Submission {
  language?: string | null;
}

export default function LanguagePieChart({ submissions }: { submissions: Submission[] }) {
  // 1. Group the submissions by language and count them
  const languageCounts = new Map<string, number>();

  submissions.forEach((sub) => {
    // Some platforms return null or weird strings, let's clean it up a bit
    const lang = sub.language || 'Unknown';

    // Group variations of languages together (e.g., "GNU C++17" -> "C++")
    let cleanLang = lang;
    if (lang.toLowerCase().includes('c++') || lang.toLowerCase().includes('cpp')) cleanLang = 'C++';
    if (lang.toLowerCase().includes('python')) cleanLang = 'Python';
    if (lang.toLowerCase().includes('java') && !lang.toLowerCase().includes('javascript')) cleanLang = 'Java';

    languageCounts.set(cleanLang, (languageCounts.get(cleanLang) || 0) + 1);
  });

  // 2. Convert to an array for Recharts
  const data = Array.from(languageCounts.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  // If no submissions exist, don't render a broken chart
  if (data.length === 0) {
    return null;
  }

  // 3. Define a sleek color palette
  const COLORS: Record<string, string> = {
    'C++': '#3b82f6',    // Blue
    'Python': '#eab308', // Yellow
    'Java': '#ef4444',   // Red
    'JavaScript': '#f59e0b',
    'TypeScript': '#0ea5e9',
    'Unknown': '#737373',
  };

  return (
    <div className="h-64 w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl flex flex-col">
      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest text-center mb-2">
        Language Distribution
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60} // This makes it a Donut chart instead of a solid Pie
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name] || '#10b981'} // Default to emerald green if not mapped
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}