// src/app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; 
import { getLeetCodeStats } from '../../../lib/leetcode';
import { getCodeforcesStats } from '../../../lib/codeforces';

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    let snapshotsCreated = 0;
    let submissionsChecked = 0; // Track how many problems we processed

    for (const user of users) {
      
      // --- LEETCODE ---
      if (user.leetcodeHandle) {
        const lcStats = await getLeetCodeStats(user.leetcodeHandle);
        if (lcStats) {
          // 1. Save the aggregate snapshot
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

          // 2. Save the actual problem submissions
          if (lcStats.submissions) {
            for (const sub of lcStats.submissions) {
              await prisma.submission.upsert({
                where: {
                  userId_platform_problemId: {
                    userId: user.id,
                    platform: 'LEETCODE',
                    problemId: sub.problemId,
                  }
                },
                update: {}, // If it already exists, do nothing (preserves original solve date)
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
              submissionsChecked++;
            }
          }
        }
      }

      // --- CODEFORCES ---
      if (user.codeforcesHandle) {
        const cfStats = await getCodeforcesStats(user.codeforcesHandle);
        if (cfStats) {
          // 1. Save the aggregate snapshot
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

          // 2. Save the actual problem submissions
          if (cfStats.submissions) {
            for (const sub of cfStats.submissions) {
              await prisma.submission.upsert({
                where: {
                  userId_platform_problemId: {
                    userId: user.id,
                    platform: 'CODEFORCES',
                    problemId: sub.problemId,
                  }
                },
                update: {}, // Do nothing if it exists
                create: {
                  userId: user.id,
                  platform: 'CODEFORCES',
                  problemId: sub.problemId,
                  problemName: sub.problemName,
                  language: sub.language,
                  tags: sub.tags,
                  runtime: sub.runtime,
                  memory: sub.memory,
                  solvedAt: sub.solvedAt,
                }
              });
              submissionsChecked++;
            }
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sync complete! Created ${snapshotsCreated} snapshots and processed ${submissionsChecked} problem submissions.` 
    });

  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Failed to sync stats" }, { status: 500 });
  }
}