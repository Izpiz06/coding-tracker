// components/LanguagePieChart.tsx
'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Submission {
  language?: string | null;
}

interface LanguageDatum {
  name: string;
  value: number;
}

function normalizeLanguage(rawLanguage?: string | null): string {
  if (!rawLanguage || rawLanguage === 'Unknown') return 'Unknown';
  const lower = rawLanguage.toLowerCase().trim();

  // Map common API strings to clean display names
  const langMap: [string, string][] = [
    ['python3', 'Python'], ['python', 'Python'], ['pypy3', 'Python'], ['pypy', 'Python'],
    ['cpp', 'C++'], ['c++', 'C++'], ['gnu c++', 'C++'],
    ['c#', 'C#'], ['csharp', 'C#'],
    ['javascript', 'JavaScript'], ['nodejs', 'JavaScript'],
    ['typescript', 'TypeScript'],
    ['java', 'Java'],
    ['golang', 'Go'], [' go', 'Go'],
    ['rust', 'Rust'],
    ['ruby', 'Ruby'],
    ['swift', 'Swift'],
    ['kotlin', 'Kotlin'],
    ['scala', 'Scala'],
    ['php', 'PHP'],
    ['dart', 'Dart'],
    ['racket', 'Racket'],
    ['erlang', 'Erlang'],
    ['elixir', 'Elixir'],
    ['haskell', 'Haskell'],
    ['lua', 'Lua'],
    ['perl', 'Perl'],
    ['r ', 'R'], ['rlang', 'R'],
    ['mysql', 'SQL'], ['mssql', 'SQL'], ['oraclesql', 'SQL'], ['postgresql', 'SQL'],
    ['bash', 'Bash'],
  ];

  for (const [pattern, name] of langMap) {
    if (lower.includes(pattern)) return name;
  }

  // Special case: exact match "c" (not c++/c#)
  if (lower === 'c' || lower === 'gnu c') return 'C';
  // Special case: exact "go"
  if (lower === 'go') return 'Go';
  // Special case: exact "r"
  if (lower === 'r') return 'R';

  // Capitalize first letter for anything else
  return rawLanguage.charAt(0).toUpperCase() + rawLanguage.slice(1);
}

export default function LanguagePieChart({
  submissions = [],
  languageData,
}: {
  submissions?: Submission[];
  languageData?: LanguageDatum[];
}) {
  // Prefer precomputed distribution from coding platform APIs when available.
  let data: LanguageDatum[];

  if (languageData && languageData.length > 0) {
    data = languageData;
  } else {
    // Group fallback submission records by language.
    const languageCounts = new Map<string, number>();

    submissions.forEach((sub) => {
      const cleanLang = normalizeLanguage(sub.language);
      if (cleanLang === 'Unknown') return; // skip unknowns
      languageCounts.set(cleanLang, (languageCounts.get(cleanLang) || 0) + 1);
    });

    data = Array.from(languageCounts.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }

  // If no submissions exist, don't render a broken chart
  if (data.length === 0) {
    return null;
  }

  // Dynamic color palette — known languages get branded colors, rest cycle through extras
  const KNOWN_COLORS: Record<string, string> = {
    'C++': '#3b82f6',
    'C': '#a3a3a3',
    'C#': '#68217a',
    'Python': '#eab308',
    'Java': '#ef4444',
    'JavaScript': '#f59e0b',
    'TypeScript': '#0ea5e9',
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
    'SQL': '#e38c00',
    'Bash': '#4eaa25',
    'R': '#276dc3',
  };
  const EXTRA_COLORS = ['#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f472b6', '#6366f1', '#84cc16', '#fb923c'];
  let extraIdx = 0;

  function getColor(name: string): string {
    if (KNOWN_COLORS[name]) return KNOWN_COLORS[name];
    return EXTRA_COLORS[extraIdx++ % EXTRA_COLORS.length];
  }

  return (
    <div className="h-72 w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-xl flex flex-col">
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
              innerRadius={56} // This makes it a Donut chart instead of a solid Pie
              outerRadius={84}
              paddingAngle={4}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={28} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}