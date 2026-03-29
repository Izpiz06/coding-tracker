const { PrismaClient } = require('@prisma/client');
const { getLeetCodeStats } = require('./lib/leetcode');
const { getCodeforcesStats } = require('./lib/codeforces');

const prisma = new PrismaClient();

async function syncUserData(userId, leetcodeHandle, codeforcesHandle) {
  console.log(`\nSyncing user ${userId}...`);
  
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // Sync LeetCode
  if (leetcodeHandle) {
    console.log(`  Fetching LeetCode: ${leetcodeHandle}`);
    const lcStats = await getLeetCodeStats(leetcodeHandle);
    if (lcStats) {
      const recentSubmissions = (lcStats.submissions || []).filter((sub) => {
        const subDate = new Date(sub.solvedAt);
        return subDate >= sevenDaysAgo && subDate <= today;
      });

      recentSubmissions.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        let solvedUpToThisDate = 0;
        recentSubmissions.forEach((sub) => {
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
      console.log(`  ✓ LeetCode synced: ${lcStats.totalSolved} problems`);
    }
  }

  // Sync Codeforces
  if (codeforcesHandle) {
    console.log(`  Fetching Codeforces: ${codeforcesHandle}`);
    const cfStats = await getCodeforcesStats(codeforcesHandle);
    if (cfStats) {
      const recentSubmissions = (cfStats.submissions || []).filter((sub) => {
        const subDate = new Date(sub.solvedAt);
        return subDate >= sevenDaysAgo && subDate <= today;
      });

      recentSubmissions.sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime());

      for (let i = 7; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        let solvedUpToThisDate = 0;
        recentSubmissions.forEach((sub) => {
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
      console.log(`  ✓ Codeforces synced: ${cfStats.totalSolved} problems`);
    }
  }
}

async function main() {
  try {
    // Create users
    console.log('Creating users...');
    await prisma.user.createMany({
      data: [
        {
          name: 'Partha',
          email: 'partha@example.com',
          githubHandle: 'parthayyy',
          leetcodeHandle: 'parthayyy',
          codeforcesHandle: 'partha_cf',
          passwordHash: 'dummy'
        },
        {
          name: 'Alex Demo',
          email: 'alex@example.com',
          githubHandle: 'alexdemo',
          leetcodeHandle: 'alexdemo',
          codeforcesHandle: 'alexdemo_cf',
          passwordHash: 'dummy'
        }
      ],
      skipDuplicates: true
    });

    // Get all users with these handles and sync them
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { leetcodeHandle: 'parthayyy' },
          { leetcodeHandle: 'alexdemo' }
        ]
      }
    });

    console.log(`\nFound ${users.length} user(s) to sync:`);
    for (const user of users) {
      await syncUserData(user.id, user.leetcodeHandle, user.codeforcesHandle);
    }

    console.log('\n✓ All users synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
