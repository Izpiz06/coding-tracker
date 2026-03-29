import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';
import { getLeetCodeStats } from '../../../lib/leetcode';
import { getCodeforcesStats } from '../../../lib/codeforces';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let snapshotsCreated = 0;

    // Get the past 7 days range
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // --- LEETCODE ---
    if (user.leetcodeHandle) {
      const lcStats = await getLeetCodeStats(user.leetcodeHandle);
      if (lcStats) {
        // Filter submissions from the past 7 days
        const recentSubmissions = (lcStats.submissions || []).filter((sub) => {
          const subDate = new Date(sub.solvedAt);
          return subDate >= sevenDaysAgo && subDate <= today;
        });

        // Sort submissions by date (oldest first)
        recentSubmissions.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

        // Create snapshots for each day in the past 7 days
        for (let i = 7; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0); // Start of day

          // Count how many problems were solved UP TO this date
          let solvedUpToThisDate = 0;
          recentSubmissions.forEach((sub) => {
            const subDate = new Date(sub.solvedAt);
            if (subDate <= date) {
              solvedUpToThisDate++;
            }
          });

          // Create a snapshot with the cumulative total for that day
          await prisma.statSnapshot.create({
            data: {
              userId: user.id,
              platform: 'LEETCODE',
              totalSolved: solvedUpToThisDate > 0 ? solvedUpToThisDate : lcStats.totalSolved,
              easySolved: lcStats.easySolved,
              mediumSolved: lcStats.mediumSolved,
              hardSolved: lcStats.hardSolved,
              recordedAt: date,
            }
          });
          snapshotsCreated++;
        }

        // Store submissions only once (dedup)
        if (recentSubmissions.length > 0) {
          for (const sub of recentSubmissions) {
            await prisma.submission.upsert({
              where: {
                userId_platform_problemId: {
                  userId: user.id,
                  platform: 'LEETCODE',
                  problemId: sub.problemId,
                }
              },
              update: {},
              create: {
                userId: user.id,
                platform: 'LEETCODE',
                problemId: sub.problemId,
                problemName: sub.problemName,
                language: sub.language,
                tags: sub.tags,
                runtime: sub.runtime,
                memory: sub.memory,
                solvedAt: sub.solvedAt,
              }
            });
          }
        }
      }
    }

    // --- CODEFORCES ---
    if (user.codeforcesHandle) {
      const cfStats = await getCodeforcesStats(user.codeforcesHandle);
      if (cfStats) {
        // Filter submissions from the past 7 days
        const recentSubmissions = (cfStats.submissions || []).filter((sub) => {
          const subDate = new Date(sub.solvedAt);
          return subDate >= sevenDaysAgo && subDate <= today;
        });

        // Sort submissions by date (oldest first)
        recentSubmissions.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

        // Create snapshots for each day in the past 7 days
        for (let i = 7; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0); // Start of day

          // Count how many problems were solved UP TO this date
          let solvedUpToThisDate = 0;
          recentSubmissions.forEach((sub) => {
            const subDate = new Date(sub.solvedAt);
            if (subDate <= date) {
              solvedUpToThisDate++;
            }
          });

          // Create a snapshot with the cumulative total for that day
          await prisma.statSnapshot.create({
            data: {
              userId: user.id,
              platform: 'CODEFORCES',
              totalSolved: solvedUpToThisDate > 0 ? solvedUpToThisDate : cfStats.totalSolved,
              rating: cfStats.rating,
              maxRating: cfStats.maxRating,
              rank: cfStats.rank,
              recordedAt: date,
            }
          });
          snapshotsCreated++;
        }

        // Store submissions only once (dedup)
        if (recentSubmissions.length > 0) {
          for (const sub of recentSubmissions) {
            await prisma.submission.upsert({
              where: {
                userId_platform_problemId: {
                  userId: user.id,
                  platform: 'CODEFORCES',
                  problemId: sub.problemId,
                }
              },
              update: {},
              create: {
                userId: user.id,
                platform: 'CODEFORCES',
                problemId: sub.problemId,
                problemName: sub.problemName,
                language: sub.language,
                tags: sub.tags,
                solvedAt: sub.solvedAt,
              }
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      snapshotsCreated,
      message: `Synced ${snapshotsCreated} snapshots with historical data from past 7 days`
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 });
  }
}

