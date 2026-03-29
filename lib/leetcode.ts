// src/lib/leetcode.ts

export async function getLeetCodeStats(username: string) {
  const RECENT_AC_LIMITS = [2000, 500, 50];

  // We updated the GraphQL query to also fetch the `recentAcSubmissionList`
  const query = `
    query getUserStats($username: String!, $limit: Int!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
        languageProblemCount {
          languageName
          problemsSolved
        }
      }
      recentAcSubmissionList(username: $username, limit: $limit) {
        id
        title
        titleSlug
        timestamp
        lang
      }
    }
  `;

  interface LeetCodeSubmission {
    id: string;
    title: string;
    titleSlug: string;
    timestamp: string;
    lang: string;
  }

  try {
    let data: {
      errors?: unknown;
      data?: {
        matchedUser?: {
          submitStatsGlobal: {
            acSubmissionNum: { difficulty: string; count: number }[];
          };
          languageProblemCount?: { languageName: string; problemsSolved: number }[];
        };
        recentAcSubmissionList?: LeetCodeSubmission[];
      };
    } | null = null;

    for (const limit of RECENT_AC_LIMITS) {
      const response = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com/',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          query,
          variables: { username, limit },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP Error ${response.status}: ${errorText}`);
      }

      const candidate = await response.json();

      if (candidate?.data?.matchedUser && !candidate?.errors) {
        data = candidate;
        break;
      }
    }

    if (!data || data.errors || !data.data?.matchedUser) {
      throw new Error(`LeetCode user ${username} not found`);
    }

    const statsArray: { difficulty: string; count: number }[] = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
    const languageCounts = data.data.matchedUser.languageProblemCount || [];
    const recentSubmissions: LeetCodeSubmission[] = data.data.recentAcSubmissionList || [];

    // Format the recent submissions to match our new Prisma Submission model
    const formattedSubmissions = recentSubmissions.map((sub) => ({
      platform: 'LEETCODE',
      problemId: sub.titleSlug, // e.g., "two-sum"
      problemName: sub.title,   // e.g., "Two Sum"
      language: sub.lang,       // e.g., "cpp", "python3"
      tags: [],                 // LeetCode doesn't easily return tags in this specific query
      runtime: null,            
      memory: null,
      // LeetCode returns the timestamp as a string of seconds, so we convert it to milliseconds
      solvedAt: new Date(parseInt(sub.timestamp) * 1000), 
    }));

    return {
      totalSolved: statsArray.find((s) => s.difficulty === "All")?.count || 0,
      easySolved: statsArray.find((s) => s.difficulty === "Easy")?.count || 0,
      mediumSolved: statsArray.find((s) => s.difficulty === "Medium")?.count || 0,
      hardSolved: statsArray.find((s) => s.difficulty === "Hard")?.count || 0,
      languageProblemCounts: languageCounts.map((entry) => ({
        language: entry.languageName,
        count: entry.problemsSolved,
      })),
      submissions: formattedSubmissions, // <--- We now return the recent problems!
    };
    
  } catch (error) {
    console.error("Error fetching LeetCode stats:", error);
    return null;
  }
}