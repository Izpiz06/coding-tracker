// app/api/rooms/[code]/route.ts — Room Dashboard Data + Leaderboard
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { calculateScore, calculateDelta } from '../../../../lib/scoring';
import { getCurrentUser } from '../../../../lib/auth';
import { getLanguageDistributionForUser } from '../../../../lib/languageDistribution';

/**
 * Get the start of the current competition period.
 * If the period has elapsed, advance it forward.
 */
function getPeriodStart(room: { periodMode: string; periodStart: Date }): Date {
    const now = new Date();
    let periodStart = new Date(room.periodStart);

    if (room.periodMode === 'ALL_TIME') {
        return periodStart;
    }

    const incrementMs =
        room.periodMode === 'WEEKLY'
            ? 7 * 24 * 60 * 60 * 1000
            : 30 * 24 * 60 * 60 * 1000; // ~monthly

    // Advance period until it's current
    while (now.getTime() - periodStart.getTime() > incrementMs) {
        periodStart = new Date(periodStart.getTime() + incrementMs);
    }

    return periodStart;
}

export async function GET(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await params;

        const room = await prisma.room.findUnique({
            where: { joinCode: code.toUpperCase() },
            include: {
                createdBy: { select: { name: true } },
                members: {
                    include: {
                        user: {
                            include: {
                                snapshots: {
                                    orderBy: { recordedAt: 'desc' },
                                },
                                submissions: true,
                            },
                        },
                    },
                    orderBy: { joinedAt: 'asc' },
                },
                activities: {
                    orderBy: { createdAt: 'desc' },
                    take: 50, // Last 50 activities
                },
            },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const isMember = room.members.some((member) => member.userId === currentUser.id);
        if (!isMember) {
            return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
        }

        // Update period if elapsed
        const effectivePeriodStart = getPeriodStart(room);
        if (effectivePeriodStart.getTime() !== room.periodStart.getTime()) {
            await prisma.room.update({
                where: { id: room.id },
                data: { periodStart: effectivePeriodStart },
            });
        }

        // Build leaderboard
        const leaderboard = await Promise.all(room.members.map(async (member) => {
            const user = member.user;

            // Get latest snapshots per platform
            const latestLC = user.snapshots.find((s) => s.platform === 'LEETCODE');
            const latestCF = user.snapshots.find((s) => s.platform === 'CODEFORCES');

            // Count submissions within the current period
            const periodSubmissions = user.submissions.filter(
                (s) => new Date(s.solvedAt) >= effectivePeriodStart
            );

            const lcInPeriod = periodSubmissions.filter((s) => s.platform === 'LEETCODE');
            const cfInPeriod = periodSubmissions.filter((s) => s.platform === 'CODEFORCES');

            // For period scoring, we need difficulty breakdown
            // Since we don't store difficulty per submission, use snapshot deltas
            // For now: use latest snapshot data for full scoring, period submissions for count
            const score = calculateScore({
                lcEasy: latestLC?.easySolved || 0,
                lcMedium: latestLC?.mediumSolved || 0,
                lcHard: latestLC?.hardSolved || 0,
                cfSolved: latestCF?.totalSolved || 0,
                cfRating: latestCF?.rating || 0,
            });

            // Calculate 24h delta from room activities
            const userActivities = room.activities.filter(
                (a) => a.userId === user.id
            );
            const delta24h = calculateDelta(userActivities);

            const languageData = await getLanguageDistributionForUser({
                leetcodeHandle: user.leetcodeHandle,
                codeforcesHandle: user.codeforcesHandle,
                fallbackSubmissions: user.submissions.map((sub) => ({
                    platform: sub.platform,
                    language: sub.language,
                })),
            });

            return {
                userId: user.id,
                name: user.name,
                role: member.role,
                joinedAt: member.joinedAt,
                score: score.totalScore,
                lcScore: score.lcScore,
                cfScore: score.cfScore,
                breakdown: score.breakdown,
                delta24h,
                stats: {
                    leetcode: latestLC
                        ? {
                            easy: latestLC.easySolved || 0,
                            medium: latestLC.mediumSolved || 0,
                            hard: latestLC.hardSolved || 0,
                            total: latestLC.totalSolved,
                        }
                        : null,
                    codeforces: latestCF
                        ? {
                            total: latestCF.totalSolved,
                            rating: latestCF.rating || 0,
                            maxRating: latestCF.maxRating || 0,
                            rank: latestCF.rank,
                        }
                        : null,
                },
                periodSubmissions: {
                    leetcode: lcInPeriod.length,
                    codeforces: cfInPeriod.length,
                    total: periodSubmissions.length,
                },
                languageData,
                submissions: user.submissions,
            };
        }));

        // Sort by total score descending
        leaderboard.sort((a, b) => b.score - a.score);

        // Add rank
        const rankedLeaderboard = leaderboard.map((entry, index) => ({
            rank: index + 1,
            ...entry,
        }));

        // Recent activities (exclude [SYNC] system messages for the feed)
        const recentActivity = room.activities
            .filter((a) => !a.message.startsWith('[SYNC]'))
            .slice(0, 20)
            .map((a) => ({
                id: a.id,
                userId: a.userId,
                message: a.message,
                scoreGain: a.scoreGain,
                createdAt: a.createdAt,
            }));

        return NextResponse.json({
            room: {
                id: room.id,
                name: room.name,
                joinCode: room.joinCode,
                periodMode: room.periodMode,
                periodStart: effectivePeriodStart,
                createdBy: room.createdBy.name,
                memberCount: room.members.length,
            },
            leaderboard: rankedLeaderboard,
            recentActivity,
        });
    } catch (error) {
        console.error('Room dashboard error:', error);
        return NextResponse.json({ error: 'Failed to load room data' }, { status: 500 });
    }
}
