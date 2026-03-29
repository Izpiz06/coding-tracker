import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { getLeetCodeStats } from '../../../lib/leetcode';
import { getCodeforcesStats } from '../../../lib/codeforces';

type SyncSubmission = {
  problemId: string;
  problemName: string;
  language?: string | null;
  tags?: string[];
  runtime?: number | null;
  memory?: number | null;
  solvedAt: Date;
};

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

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let snapshotsCreated = 0;
    let submissionsProcessed = 0;
    let newSubmissions = 0;

    // --- LEETCODE ---
    if (user.leetcodeHandle) {
      const lcStats = await getLeetCodeStats(user.leetcodeHandle);
      if (lcStats) {
        await prisma.statSnapshot.create({
          data: {
            userId: user.id,
            platform: 'LEETCODE',
            totalSolved: lcStats.totalSolved,
            easySolved: lcStats.easySolved,
            mediumSolved: lcStats.mediumSolved,
            hardSolved: lcStats.hardSolved,
          }
        });
        snapshotsCreated++;

        const submissions = uniqueEarliestSubmissions(lcStats.submissions || []);
        submissionsProcessed += submissions.length;

        if (submissions.length > 0) {
          const created = await prisma.submission.createMany({
            data: submissions.map((sub) => ({
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
    }

    // --- CODEFORCES ---
    if (user.codeforcesHandle) {
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
          }
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
    }

    return NextResponse.json({
      success: true,
      snapshotsCreated,
      submissionsProcessed,
      newSubmissions,
      message: `Synced ${snapshotsCreated} snapshots and checked ${submissionsProcessed} lifetime submissions`
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 });
  }
}

