// app/api/rooms/leave/route.ts — Leave a Room
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { roomId } = body;

        if (!roomId) {
            return NextResponse.json(
                { error: 'roomId is required' },
                { status: 400 }
            );
        }

        // Check membership exists
        const membership = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId, userId: currentUser.id } },
        });

        if (!membership) {
            return NextResponse.json(
                { error: 'You are not a member of this room' },
                { status: 404 }
            );
        }

        // Count remaining members
        const memberCount = await prisma.roomMember.count({ where: { roomId } });

        await prisma.$transaction(async (tx) => {
            // Remove membership
            await tx.roomMember.delete({
                where: { roomId_userId: { roomId, userId: currentUser.id } },
            });

            if (memberCount <= 1) {
                // Last member leaving — delete the entire room
                await tx.roomActivity.deleteMany({ where: { roomId } });
                await tx.room.delete({ where: { id: roomId } });
            } else {
                // If the owner is leaving, promote the oldest remaining member
                if (membership.role === 'OWNER') {
                    const oldestMember = await tx.roomMember.findFirst({
                        where: { roomId, userId: { not: currentUser.id } },
                        orderBy: { joinedAt: 'asc' },
                    });

                    if (oldestMember) {
                        await tx.roomMember.update({
                            where: { id: oldestMember.id },
                            data: { role: 'OWNER' },
                        });
                    }
                }

                // Log the departure
                await tx.roomActivity.create({
                    data: {
                        roomId,
                        userId: currentUser.id,
                        message: `${currentUser.name} left the room`,
                        scoreGain: 0,
                    },
                });
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Leave room error:', error);
        return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
    }
}
