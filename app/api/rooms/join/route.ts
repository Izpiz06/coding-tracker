// app/api/rooms/join/route.ts — Join a Room
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser, isProfileComplete } from '../../../../lib/auth';

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!isProfileComplete(currentUser)) {
            return NextResponse.json(
                { error: 'Complete your profile before joining a room' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { joinCode, roomPasscode } = body;

        if (!joinCode || !roomPasscode) {
            return NextResponse.json(
                { error: 'joinCode and roomPasscode are required' },
                { status: 400 }
            );
        }

        // Find the room by join code
        const room = await prisma.room.findUnique({
            where: { joinCode: joinCode.toUpperCase() },
        });

        if (!room) {
            return NextResponse.json(
                { error: 'Room not found. Check the invite code.' },
                { status: 404 }
            );
        }

        // Validate room passcode for rooms that are protected
        if (room.roomPasscode && room.roomPasscode !== roomPasscode) {
            return NextResponse.json(
                { error: 'Invalid room password' },
                { status: 401 }
            );
        }

        // Check if already a member
        const existingMembership = await prisma.roomMember.findUnique({
            where: { roomId_userId: { roomId: room.id, userId: currentUser.id } },
        });

        if (existingMembership) {
            return NextResponse.json(
                { error: 'You are already a member of this room!' },
                { status: 409 }
            );
        }

        // Join the room
        await prisma.$transaction(async (tx) => {
            await tx.roomMember.create({
                data: {
                    roomId: room.id,
                    userId: currentUser.id,
                    role: 'MEMBER',
                },
            });

            await tx.roomActivity.create({
                data: {
                    roomId: room.id,
                    userId: currentUser.id,
                    message: `${currentUser.name} joined the room!`,
                    scoreGain: 0,
                },
            });
        });

        return NextResponse.json({
            success: true,
            room: {
                id: room.id,
                name: room.name,
                joinCode: room.joinCode,
            },
        });
    } catch (error) {
        console.error('Join room error:', error);
        return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
    }
}
