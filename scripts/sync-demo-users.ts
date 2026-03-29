import { PrismaClient } from '@prisma/client';
import { getLeetCodeStats } from '@/lib/leetcode';
import { getCodeforcesStats } from '@/lib/codeforces';

const prisma = new PrismaClient();

async function syncUserData(userId: number, name: string, leetcodeHandle: string, codeforcesHandle: string) {
  console.log(`\n📊 Syncing ${name}...`);
  
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Sync LeetCode
  if (leetcodeHandle) {
    console.log(`  🔄 Fetching LeetCode: ${leetcodeHandle}`);
    const lcStats = await getLeetCodeStats(leetcodeHandle);
    if (lcStats) {
      const recentSubmissions = (lcStats.submissions || []).filter((sub: any) => {
        const subDate = new Date(sub.solvedAt);
        return subDate >= sevenDaysAgo && subDate <= today;
      });

      recentSubmissions.sort((a: any, b: any) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        let solvedUpToThisDate = 0;
        recentSubmissions.forEach((sub: any) => {
          const subDate = new Date(sub.solvedAt);
          if (subDate <= date) {
            solvedUpToThisDate++;
          }
        });

        await prisma.statSnapshot.create({
          data: {
            userId,
            platform: 'LEETCODE',
            totalSolved: solvedUpToThisDate > 0 ? solvedUpToThisDate : lcStats.totalSolved,
            easySolved: lcStats.easySolved,
            mediumSolved: lcStats.mediumSolved,
            hardSolved: lcStats.hardSolved,
            recordedAt: date,
          }
        });
      }

      if (recentSubmissions.length > 0) {
        for (const sub of recentSubmissions) {
          await prisma.submission.upsert({
            where: {
              userId_platform_problemId: {
                userId,
                platform: 'LEETCODE',
                problemId: sub.problemId,
              }
            },
            update: {},
            create: {
              userId,
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
      console.log(`  ✅ LeetCode: ${lcStats.totalSolved} problems (${lcStats.easySolved}E, ${lcStats.mediumSolved}M, ${lcStats.hardSolved}H)`);
    }
  }

  // Sync Codeforces
  if (codeforcesHandle) {
    console.log(`  🔄 Fetching Codeforces: ${codeforcesHandle}`);
    const cfStats = await getCodeforcesStats(codeforcesHandle);
    if (cfStats) {
      const recentSubmissions = (cfStats.submissions || []).filter((sub: any) => {
        const subDate = new Date(sub.solvedAt);
        return subDate >= sevenDaysAgo && subDate <= today;
      });

      recentSubmissions.sort((a: any, b: any) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        let solvedUpToThisDate = 0;
        recentSubmissions.forEach((sub: any) => {
          const subDate = new Date(sub.solvedAt);
          if (subDate <= date) {
            solvedUpToThisDate++;
          }
        });

        await prisma.statSnapshot.create({
          data: {
            userId,
            platform: 'CODEFORCES',
            totalSolved: solvedUpToThisDate > 0 ? solvedUpToThisDate : cfStats.totalSolved,
            rating: cfStats.rating,
            maxRating: cfStats.maxRating,
            rank: cfStats.rank,
            recordedAt: date,
          }
        });
      }

      if (recentSubmissions.length > 0) {
        for (const sub of recentSubmissions) {
          await prisma.submission.upsert({
            where: {
              userId_platform_problemId: {
                userId,
                platform: 'CODEFORCES',
                problemId: sub.problemId,
              }
            },
            update: {},
            create: {
              userId,
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
      console.log(`  ✅ Codeforces: ${cfStats.totalSolved} problems (Rating: ${cfStats.rating})`);
    }
  }
}

async function main() {
  try {
    const users = [
      { id: 7, name: 'Partha', lc: 'parthayyy', cf: 'partha_cf' },
      { id: 8, name: 'Alex Demo', lc: 'alexdemo', cf: 'alexdemo_cf' }
    ];

    for (const user of users) {
      await syncUserData(user.id, user.name, user.lc, user.cf);
    }

    console.log('\n✅ All users synced successfully with 7-day historical data!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
