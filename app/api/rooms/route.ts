// app/api/rooms/route.ts — Create a new Room
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { generateUniqueJoinCode } from '../../../lib/joinCode';
import { getCurrentUser, isProfileComplete } from '../../../lib/auth';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isProfileComplete(currentUser)) {
            return NextResponse.json(
                { error: 'Complete your profile before creating a room' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, periodMode, roomPasscode } = body;

        if (!name || !roomPasscode) {
            return NextResponse.json({ error: 'Name and roomPasscode are required' }, { status: 400 });
        }

        // Generate unique join code
        const joinCode = await generateUniqueJoinCode();

        // Create room + owner membership in a transaction
        const room = await prisma.$transaction(async (tx) => {
            const newRoom = await tx.room.create({
                data: {
                    name,
                    joinCode,
                    roomPasscode,
                    createdById: currentUser.id,
                    periodMode: periodMode || 'WEEKLY',
                },
            });

            // Add creator as OWNER
            await tx.roomMember.create({
                data: {
                    roomId: newRoom.id,
                    userId: currentUser.id,
                    role: 'OWNER',
                },
            });

            // Activity log
            await tx.roomActivity.create({
                data: {
                    roomId: newRoom.id,
                    userId: currentUser.id,
                    message: `${currentUser.name} created this room`,
                    scoreGain: 0,
                },
            });

            return newRoom;
        });

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                name: room.name,
                joinCode: room.joinCode,
                periodMode: room.periodMode,
            },
        });
    } catch (error) {
        console.error('Create room error:', error);
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}

// GET: List all rooms (for homepage display)
export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const rooms = await prisma.room.findMany({
            where: { members: { some: { userId: currentUser.id } } },
            include: {
                _count: { select: { members: true } },
                createdBy: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ rooms });
    } catch (error) {
        console.error('List rooms error:', error);
        return NextResponse.json({ error: 'Failed to list rooms' }, { status: 500 });
    }
}
