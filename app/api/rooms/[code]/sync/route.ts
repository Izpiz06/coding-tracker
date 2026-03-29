// app/api/rooms/[code]/sync/route.ts — Batch Sync for Room Members
import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { syncRoom, canSyncRoom } from '../../../../../lib/roomSync';
import { getCurrentUser } from '../../../../../lib/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { code } = await params;
        const body = await request.json();
        const { passcode } = body;

        // Auth
        if (passcode !== process.env.ADMIN_PASSCODE) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Find room
        const room = await prisma.room.findUnique({
            where: { joinCode: code.toUpperCase() },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        const membership = await prisma.roomMember.findUnique({
            where: {
                roomId_userId: {
                    roomId: room.id,
                    userId: currentUser.id,
                },
            },
        });

        if (!membership) {
            return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 });
        }

        // Rate limit check
        const allowed = await canSyncRoom(room.id);
        if (!allowed) {
            return NextResponse.json(
                { error: 'Room was synced recently. Please wait 15 minutes between syncs.' },
                { status: 429 }
            );
        }

        // Run the batch sync
        const result = await syncRoom(room.id);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error('Room sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}
