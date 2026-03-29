import { prisma } from './prisma';
import { getLeetCodeStats } from './leetcode';
import { getCodeforcesStats } from './codeforces';
import { getLeetCodeSubmissionCalendar } from './leetcode';
import { getLeetCodeQuestionMetadataBatch } from './leetcode';

type SyncSubmission = {
  problemId: string;
  problemName: string;
  language?: string | null;
  tags?: string[];
  difficulty?: string | null;
  runtime?: number | null;
  memory?: number | null;
  solvedAt: Date;
};

export interface LifetimeSyncInput {
  id: number;
  leetcodeHandle: string | null;
  codeforcesHandle: string | null;
}

export interface LifetimeSyncResult {
  snapshotsCreated: number;
  submissionsProcessed: number;
  newSubmissions: number;
  errors: string[];
}

function uniqueEarliestSubmissions(submissions: SyncSubmission[]): SyncSubmission[] {
  const byProblem = new Map<string, SyncSubmission>();

  for (const sub of submissions) {
    const existing = byProblem.get(sub.problemId);
    if (!existing || new Date(sub.solvedAt) < new Date(existing.solvedAt)) {
      byProblem.set(sub.problemId, sub);
    }
  }

  return Array.from(byProblem.values()).sort(
    (a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime()
  );
}

function toDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function buildLeetCodeCalendarSyntheticSubmissions(
  calendarEntries: { date: Date; count: number }[],
  detailedSubmissions: SyncSubmission[]
): SyncSubmission[] {
  const detailedCountByDay = new Map<string, number>();

  for (const sub of detailedSubmissions) {
    const key = toDateKey(new Date(sub.solvedAt));
    detailedCountByDay.set(key, (detailedCountByDay.get(key) || 0) + 1);
  }

  const synthetic: SyncSubmission[] = [];

  for (const entry of calendarEntries) {
    const dayKey = toDateKey(entry.date);
    const detailedCount = detailedCountByDay.get(dayKey) || 0;
    const missingCount = Math.max(0, entry.count - detailedCount);

    if (missingCount === 0) {
      continue;
    }

    const dayStart = new Date(`${dayKey}T00:00:00.000Z`);

    for (let i = 0; i < missingCount; i++) {
      synthetic.push({
        problemId: `lc-calendar-${Math.floor(dayStart.getTime() / 1000)}-${i + 1}`,
        problemName: 'LeetCode Accepted Submission',
        language: 'Unknown',
        tags: [],
        difficulty: null,
        runtime: null,
        memory: null,
        solvedAt: new Date(dayStart.getTime() + i * 1000),
      });
    }
  }

  return synthetic;
}

export async function syncUserLifetimeData(user: LifetimeSyncInput): Promise<LifetimeSyncResult> {
  let snapshotsCreated = 0;
  let submissionsProcessed = 0;
  let newSubmissions = 0;
  const errors: string[] = [];

  if (user.leetcodeHandle) {
    try {
      const [lcStats, lcCalendar] = await Promise.all([
        getLeetCodeStats(user.leetcodeHandle),
        getLeetCodeSubmissionCalendar(user.leetcodeHandle),
      ]);

      if (lcStats) {
        await prisma.statSnapshot.create({
          data: {
            userId: user.id,
            platform: 'LEETCODE',
            totalSolved: lcStats.totalSolved,
            easySolved: lcStats.easySolved,
            mediumSolved: lcStats.mediumSolved,
            hardSolved: lcStats.hardSolved,
          },
        });
        snapshotsCreated++;

        const detailedSubmissions = uniqueEarliestSubmissions(lcStats.submissions || []);
        const metadataBySlug = await getLeetCodeQuestionMetadataBatch(
          detailedSubmissions.map((sub) => sub.problemId)
        );

        const enrichedDetailedSubmissions = detailedSubmissions.map((sub) => {
          const metadata = metadataBySlug.get(sub.problemId);
          return {
            ...sub,
            tags: metadata?.tags || sub.tags || [],
            difficulty: metadata?.difficulty || null,
          };
        });

        const syntheticSubmissions = lcCalendar
          ? buildLeetCodeCalendarSyntheticSubmissions(lcCalendar, enrichedDetailedSubmissions)
          : [];

        const submissions = [...enrichedDetailedSubmissions, ...syntheticSubmissions];
        submissionsProcessed += submissions.length;

        for (const sub of enrichedDetailedSubmissions) {
          await prisma.submission.upsert({
            where: {
              userId_platform_problemId: {
                userId: user.id,
                platform: 'LEETCODE',
                problemId: sub.problemId,
              },
            },
            update: {
              problemName: sub.problemName,
              language: sub.language,
              tags: sub.tags || [],
              runtime: sub.runtime,
              memory: sub.memory,
              solvedAt: sub.solvedAt,
            },
            create: {
              userId: user.id,
              platform: 'LEETCODE',
              problemId: sub.problemId,
              problemName: sub.problemName,
              language: sub.language,
              tags: sub.tags || [],
              runtime: sub.runtime,
              memory: sub.memory,
              solvedAt: sub.solvedAt,
            },
          });
        }

        if (syntheticSubmissions.length > 0) {
          const created = await prisma.submission.createMany({
            data: syntheticSubmissions.map((sub) => ({
              userId: user.id,
              platform: 'LEETCODE',
              problemId: sub.problemId,
              problemName: sub.problemName,
              language: sub.language,
              tags: sub.tags || [],
              runtime: sub.runtime,
              memory: sub.memory,
              solvedAt: sub.solvedAt,
            })),
            skipDuplicates: true,
          });
          newSubmissions += created.count;
        }
      }
    } catch {
      errors.push('LeetCode sync failed');
    }
  }

  if (user.codeforcesHandle) {
    try {
      const cfStats = await getCodeforcesStats(user.codeforcesHandle);
      if (cfStats) {
        await prisma.statSnapshot.create({
          data: {
            userId: user.id,
            platform: 'CODEFORCES',
            totalSolved: cfStats.totalSolved,
            rating: cfStats.rating,
            maxRating: cfStats.maxRating,
            rank: cfStats.rank,
          },
        });
        snapshotsCreated++;

        const submissions = uniqueEarliestSubmissions(cfStats.submissions || []);
        submissionsProcessed += submissions.length;

        if (submissions.length > 0) {
          const created = await prisma.submission.createMany({
            data: submissions.map((sub) => ({
              userId: user.id,
              platform: 'CODEFORCES',
              problemId: sub.problemId,
              problemName: sub.problemName,
              language: sub.language,
              tags: sub.tags || [],
              runtime: sub.runtime,
              memory: sub.memory,
              solvedAt: sub.solvedAt,
            })),
            skipDuplicates: true,
          });
          newSubmissions += created.count;
        }
      }
    } catch {
      errors.push('Codeforces sync failed');
    }
  }

  return {
    snapshotsCreated,
    submissionsProcessed,
    newSubmissions,
    errors,
  };
}