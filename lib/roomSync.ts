// lib/roomSync.ts
// Batch sync strategy for Rooms — sequential per-member with rate limiting

import { prisma } from './prisma';
import { getLeetCodeStats } from './leetcode';
import { getCodeforcesStats } from './codeforces';
import { getSubmissionScore } from './scoring';

const CACHE_WINDOW_MS = 30 * 60 * 1000; // 30 minutes
const RATE_LIMIT_DELAY_MS = 2000; // 2 seconds between members
const SYNC_COOLDOWN_MS = 15 * 60 * 1000; // 15 min cooldown per room

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if a room sync is allowed (15 min cooldown).
 */
export async function canSyncRoom(roomId: number): Promise<boolean> {
    const latestActivity = await prisma.roomActivity.findFirst({
        where: {
            roomId,
            message: { startsWith: '[SYNC]' },
        },
        orderBy: { createdAt: 'desc' },
    });

    if (!latestActivity) return true;
    return Date.now() - latestActivity.createdAt.getTime() > SYNC_COOLDOWN_MS;
}

/**
 * Check if a user was recently synced (within 30 min cache window).
 */
async function isUserRecentlySynced(userId: number): Promise<boolean> {
    const latestSnapshot = await prisma.statSnapshot.findFirst({
        where: { userId },
        orderBy: { recordedAt: 'desc' },
    });

    if (!latestSnapshot) return false;
    return Date.now() - latestSnapshot.recordedAt.getTime() < CACHE_WINDOW_MS;
}

/**
 * Sync a single user's data. Returns the count of new submissions found.
 * Reuses the exact same logic from api/sync/route.ts but wrapped for room use.
 */
async function syncSingleUser(
    user: { id: number; leetcodeHandle: string | null; codeforcesHandle: string | null }
): Promise<{ newSubmissions: { platform: string; problemName: string; difficulty?: string }[] }> {
    const newSubmissions: { platform: string; problemName: string; difficulty?: string }[] = [];

    // --- LeetCode ---
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
                },
            });

            if (lcStats.submissions) {
                for (const sub of lcStats.submissions) {
                    // Try to create — if it already exists, it's not new
                    try {
                        await prisma.submission.create({
                            data: {
                                userId: user.id,
                                platform: 'LEETCODE',
                                problemId: sub.problemId,
                                problemName: sub.problemName,
                                language: sub.language,
                                tags: sub.tags,
                                runtime: sub.runtime,
                                memory: sub.memory,
                                solvedAt: sub.solvedAt,
                            },
                        });
                        // If create succeeds, this is a NEW submission
                        newSubmissions.push({
                            platform: 'LEETCODE',
                            problemName: sub.problemName,
                        });
                    } catch {
                        // Unique constraint violation = already exists, skip
                    }
                }
            }
        }
    }

    // --- Codeforces ---
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
                },
            });

            if (cfStats.submissions) {
                for (const sub of cfStats.submissions) {
                    try {
                        await prisma.submission.create({
                            data: {
                                userId: user.id,
                                platform: 'CODEFORCES',
                                problemId: sub.problemId,
                                problemName: sub.problemName,
                                language: sub.language,
                                tags: sub.tags,
                                runtime: sub.runtime,
                                memory: sub.memory,
                                solvedAt: sub.solvedAt,
                            },
                        });
                        newSubmissions.push({
                            platform: 'CODEFORCES',
                            problemName: sub.problemName,
                        });
                    } catch {
                        // Already exists, skip
                    }
                }
            }
        }
    }

    return { newSubmissions };
}

export interface SyncResult {
    membersSynced: number;
    membersSkipped: number;
    activitiesCreated: number;
}

/**
 * Batch sync all members of a room.
 * Sequential with rate limiting + 30-min cache to skip recently synced users.
 */
export async function syncRoom(roomId: number): Promise<SyncResult> {
    const members = await prisma.roomMember.findMany({
        where: { roomId },
        include: {
            user: {
                select: { id: true, name: true, leetcodeHandle: true, codeforcesHandle: true },
            },
        },
    });

    let membersSynced = 0;
    let membersSkipped = 0;
    let activitiesCreated = 0;

    // Log sync start
    await prisma.roomActivity.create({
        data: {
            roomId,
            userId: members[0]?.userId || 0,
            message: '[SYNC] Room sync started',
            scoreGain: 0,
        },
    });

    for (let i = 0; i < members.length; i++) {
        const member = members[i];

        // Check cache — skip if recently synced
        if (await isUserRecentlySynced(member.userId)) {
            membersSkipped++;
            continue;
        }

        // Sync the user
        const result = await syncSingleUser(member.user);
        membersSynced++;

        // Generate RoomActivity entries for new submissions
        for (const sub of result.newSubmissions) {
            const score = getSubmissionScore(
                sub.platform as 'LEETCODE' | 'CODEFORCES',
                sub.difficulty
            );

            await prisma.roomActivity.create({
                data: {
                    roomId,
                    userId: member.userId,
                    message: `${member.user.name} solved "${sub.problemName}" on ${sub.platform}`,
                    scoreGain: score,
                },
            });
            activitiesCreated++;
        }

        // Rate limit: wait 2s before next member (except after the last one)
        if (i < members.length - 1) {
            await sleep(RATE_LIMIT_DELAY_MS);
        }
    }

    // Log sync completion
    await prisma.roomActivity.create({
        data: {
            roomId,
            userId: members[0]?.userId || 0,
            message: `[SYNC] Complete — ${membersSynced} synced, ${membersSkipped} cached, ${activitiesCreated} new activities`,
            scoreGain: 0,
        },
    });

    return { membersSynced, membersSkipped, activitiesCreated };
}
