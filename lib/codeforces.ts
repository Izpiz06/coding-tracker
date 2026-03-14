// src/lib/codeforces.ts

export async function getCodeforcesStats(handle: string) {
  try {
    // 1. Fetch user profile info (rating, maxRating, rank)
    const infoRes = await fetch(`https://codeforces.com/api/user.info?handles=${handle}`);
    const infoData = await infoRes.json();

    if (infoData.status !== "OK") {
      throw new Error(`Codeforces user ${handle} not found`);
    }
    const user = infoData.result[0];

    // 2. Fetch all submissions to calculate unique problems and extract details
    const statusRes = await fetch(`https://codeforces.com/api/user.status?handle=${handle}`);
    const statusData = await statusRes.json();

    let totalSolved = 0;
    const submissionsList: any[] = [];
    
    if (statusData.status === "OK") {
      // Use a Map to track unique problems by ID so we don't count duplicates
      const solvedProblems = new Map();
      
      // Reverse the array so we process oldest submissions first. 
      // This ensures we save the exact date/time of your FIRST successful solve.
      const allSubmissions = statusData.result.reverse();
      
      allSubmissions.forEach((submission: any) => {
        if (submission.verdict === "OK") {
          const problemId = `${submission.problem.contestId}-${submission.problem.index}`;
          
          if (!solvedProblems.has(problemId)) {
            solvedProblems.set(problemId, true);
            
            // Build the exact object our new Prisma Submission model expects
            submissionsList.push({
              platform: 'CODEFORCES',
              problemId: problemId,
              problemName: submission.problem.name,
              language: submission.programmingLanguage, // e.g., "GNU C++17", "Python 3"
              tags: submission.problem.tags || [],
              runtime: submission.timeConsumedMillis || 0,
              // Convert bytes to Megabytes (MB) for easier reading
              memory: submission.memoryConsumedBytes ? (submission.memoryConsumedBytes / (1024 * 1024)) : 0,
              solvedAt: new Date(submission.creationTimeSeconds * 1000),
            });
          }
        }
      });
      totalSolved = solvedProblems.size;
    }

    return {
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || "unrated",
      totalSolved,
      submissions: submissionsList, // <--- We now return the full array of solved problems!
    };
    
  } catch (error) {
    console.error("Error fetching Codeforces stats:", error);
    return null;
  }
}