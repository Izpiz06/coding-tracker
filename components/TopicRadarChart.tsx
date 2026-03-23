// components/TopicRadarChart.tsx
'use client';

import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';

export default function TopicRadarChart({ submissions }: { submissions: any[] }) {
  // 1. Count the frequency of each tag
  const tagCounts = new Map<string, number>();

  submissions.forEach((sub) => {
    if (sub.tags && Array.isArray(sub.tags)) {
      sub.tags.forEach((tag: string) => {
        // Clean up the tag name for display
        const cleanTag = tag.toLowerCase().trim();
        tagCounts.set(cleanTag, (tagCounts.get(cleanTag) || 0) + 1);
      });
    }
  });

  // 2. Sort by frequency and take the top 6 topics to make a clean hexagon
  const sortedTags = Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const data = sortedTags.map(([subject, count]) => ({
    // Truncate really long tags so they don't overlap on the chart
    subject: subject.length > 12 ? subject.substring(0, 12) + '...' : subject,
    count,
    fullSubject: subject
  }));

  // If there are no tags yet (or less than 3, which breaks the polygon), hide the chart
  if (data.length < 3) {
    return (
      <div className="h-64 w-full bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 italic text-sm">
        Not enough topic data yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl flex flex-col">
      <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest text-center mb-2">
        Topic Mastery
      </h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid stroke="#404040" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 11 }} />
            <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
            <Radar
              name="Problems Solved"
              dataKey="count"
              stroke="#10b981" // Emerald Green to match your heatmap
              fill="#10b981"
              fillOpacity={0.4}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value: any) => [Number(value) || 0, 'Solved']}
              labelFormatter={(label) => {
                // Find the full name for the tooltip
                const original = data.find(d => d.subject === label);
                return original ? original.fullSubject : label;
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}