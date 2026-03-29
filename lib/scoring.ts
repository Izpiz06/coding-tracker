// lib/scoring.ts
// Weighted Problem Score (WPS) algorithm for Room leaderboards

export interface UserScoreInput {
    // LeetCode stats (from latest StatSnapshot)
    lcEasy: number;
    lcMedium: number;
    lcHard: number;
    // Codeforces stats
    cfSolved: number;
    cfRating: number;
}

export interface ScoreResult {
    totalScore: number;
    lcScore: number;
    cfScore: number;
    breakdown: {
        lcEasy: number;
        lcMedium: number;
        lcHard: number;
        cfProblems: number;
        cfRatingBonus: number;
    };
}

// Scoring weights
const LC_EASY_WEIGHT = 1;
const LC_MEDIUM_WEIGHT = 3;
const LC_HARD_WEIGHT = 7;
const CF_PROBLEM_WEIGHT = 2;
const CF_RATING_DIVISOR = 200;

/**
 * Calculate the Room Score for a single user.
 * LeetCode: Easy=1pt, Medium=3pt, Hard=7pt
 * Codeforces: 2pt per problem + floor(rating/200) bonus
 */
export function calculateScore(input: UserScoreInput): ScoreResult {
    const lcEasyPts = input.lcEasy * LC_EASY_WEIGHT;
    const lcMediumPts = input.lcMedium * LC_MEDIUM_WEIGHT;
    const lcHardPts = input.lcHard * LC_HARD_WEIGHT;
    const lcScore = lcEasyPts + lcMediumPts + lcHardPts;

    const cfProblemPts = input.cfSolved * CF_PROBLEM_WEIGHT;
    const cfRatingBonus = Math.floor(Math.max(0, input.cfRating) / CF_RATING_DIVISOR);
    const cfScore = cfProblemPts + cfRatingBonus;

    return {
        totalScore: lcScore + cfScore,
        lcScore,
        cfScore,
        breakdown: {
            lcEasy: lcEasyPts,
            lcMedium: lcMediumPts,
            lcHard: lcHardPts,
            cfProblems: cfProblemPts,
            cfRatingBonus,
        },
    };
}

/**
 * Calculate the score delta from submissions within a given time window.
 * Uses RoomActivity entries to sum up scoreGain values.
 */
export function calculateDelta(
    activities: { scoreGain: number; createdAt: Date }[],
    windowMs: number = 24 * 60 * 60 * 1000 // default 24h
): number {
    const cutoff = new Date(Date.now() - windowMs);
    return activities
        .filter((a) => new Date(a.createdAt) >= cutoff)
        .reduce((sum, a) => sum + a.scoreGain, 0);
}

/**
 * Determine submission score based on platform and difficulty.
 * Used when generating RoomActivity entries during sync.
 */
export function getSubmissionScore(
    platform: 'LEETCODE' | 'CODEFORCES',
    difficulty?: string | null
): number {
    if (platform === 'LEETCODE') {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return LC_EASY_WEIGHT;
            case 'medium': return LC_MEDIUM_WEIGHT;
            case 'hard': return LC_HARD_WEIGHT;
            default: return LC_EASY_WEIGHT; // fallback
        }
    }
    // Codeforces: flat rate per problem
    return CF_PROBLEM_WEIGHT;
}
