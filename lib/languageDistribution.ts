import { getLeetCodeStats } from './leetcode';
import { getCodeforcesStats } from './codeforces';

export interface LanguageDatum {
  name: string;
  value: number;
}

interface FallbackSubmission {
  platform: string;
  language?: string | null;
}

interface UserLanguageDistributionInput {
  leetcodeHandle?: string | null;
  codeforcesHandle?: string | null;
  fallbackSubmissions: FallbackSubmission[];
}

function normalizeLanguage(rawLanguage?: string | null): string {
  const lang = (rawLanguage || 'Unknown').trim();
  const lower = lang.toLowerCase();

  if (lower.includes('javascript')) return 'JavaScript';
  if (lower.includes('typescript')) return 'TypeScript';
  if (lower.includes('c++') || lower.includes('cpp')) return 'C++';
  if (lower === 'py' || lower.includes('python')) return 'Python';
  if (lower.includes('java')) return 'Java';

  return lang;
}

function addCount(map: Map<string, number>, language: string, value: number) {
  map.set(language, (map.get(language) || 0) + value);
}

function countFromSubmissions(submissions: FallbackSubmission[]): Map<string, number> {
  const map = new Map<string, number>();

  for (const sub of submissions) {
    addCount(map, normalizeLanguage(sub.language), 1);
  }

  return map;
}

function mapToSortedArray(map: Map<string, number>): LanguageDatum[] {
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value);
}

export async function getLanguageDistributionForUser(
  input: UserLanguageDistributionInput
): Promise<LanguageDatum[]> {
  const { leetcodeHandle, codeforcesHandle, fallbackSubmissions } = input;

  const lcFallback = fallbackSubmissions.filter((sub) => sub.platform === 'LEETCODE');
  const cfFallback = fallbackSubmissions.filter((sub) => sub.platform === 'CODEFORCES');
  const otherFallback = fallbackSubmissions.filter(
    (sub) => sub.platform !== 'LEETCODE' && sub.platform !== 'CODEFORCES'
  );

  const [lcStats, cfStats] = await Promise.all([
    leetcodeHandle ? getLeetCodeStats(leetcodeHandle) : Promise.resolve(null),
    codeforcesHandle ? getCodeforcesStats(codeforcesHandle) : Promise.resolve(null),
  ]);

  const finalCounts = new Map<string, number>();

  // LeetCode: prefer direct lifetime language counts from LeetCode profile.
  if (lcStats?.languageProblemCounts && lcStats.languageProblemCounts.length > 0) {
    for (const entry of lcStats.languageProblemCounts) {
      addCount(finalCounts, normalizeLanguage(entry.language), entry.count);
    }
  } else {
    const fallbackCounts = countFromSubmissions(lcFallback);
    fallbackCounts.forEach((value, language) => addCount(finalCounts, language, value));
  }

  // Codeforces: API returns all solved submissions, so use it when available.
  if (cfStats?.submissions && cfStats.submissions.length > 0) {
    for (const sub of cfStats.submissions) {
      addCount(finalCounts, normalizeLanguage(sub.language), 1);
    }
  } else {
    const fallbackCounts = countFromSubmissions(cfFallback);
    fallbackCounts.forEach((value, language) => addCount(finalCounts, language, value));
  }

  // Keep any other platforms from fallback submissions.
  const otherCounts = countFromSubmissions(otherFallback);
  otherCounts.forEach((value, language) => addCount(finalCounts, language, value));

  return mapToSortedArray(finalCounts);
}
