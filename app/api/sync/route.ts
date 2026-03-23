// src/app/api/sync/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma'; 
import { getLeetCodeStats } from '../../../lib/leetcode';
import { getCodeforcesStats } from '../../../lib/codeforces';

export async function GET(request: Request) {
  // --- THE SECURITY LOCKDOWN ---
  const authHeader = request.headers.get('authorization');
  const url = new URL(request.url);
  const passcode = url.searchParams.get('passcode');

  // 1. Vercel automatically sends a CRON_SECRET header when it runs the nightly job.
  // 2. We also allow your ADMIN_PASSCODE so you can trigger it manually from your browser if needed.
  if (
    authHeader !== `Bearer ${process.env.CRON_SECRET}` &&
    passcode !== process.env.ADMIN_PASSCODE
  ) {
    return NextResponse.json({ error: "Unauthorized access. Route is locked." }, { status: 401 });
  }
  // -----------------------------

  try {
    const users = await prisma.user.findMany();
    let snapshotsCreated = 0;
    let submissionsChecked = 0; 

    for (const user of users) {
      
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
              submissionsChecked++;
            }
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
                update: {}, 
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