const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating test users...');
    
    // Create users
    const partha = await prisma.user.upsert({
      where: { email: 'partha@example.com' },
      update: {},
      create: {
        name: 'Partha',
        email: 'partha@example.com',
        githubHandle: 'parthayyy',
        leetcodeHandle: 'parthayyy',
        codeforcesHandle: 'partha_cf',
        passwordHash: 'dummy'
      }
    });

    const alex = await prisma.user.upsert({
      where: { email: 'alex@example.com' },
      update: {},
      create: {
        name: 'Alex Demo',
        email: 'alex@example.com',
        githubHandle: 'alexdemo',
        leetcodeHandle: 'alexdemo',
        codeforcesHandle: 'alexdemo_cf',
        passwordHash: 'dummy'
      }
    });

    console.log(`✓ Created users:`);
    console.log(`  1. ${partha.name} (ID: ${partha.id})`);
    console.log(`     - LeetCode: ${partha.leetcodeHandle}`);
    console.log(`     - Codeforces: ${partha.codeforcesHandle}`);
    console.log(`  2. ${alex.name} (ID: ${alex.id})`);
    console.log(`     - LeetCode: ${alex.leetcodeHandle}`);
    console.log(`     - Codeforces: ${alex.codeforcesHandle}`);
    
    console.log('\nTo sync their data, hit the Force Sync button in the app!');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
