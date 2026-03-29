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
        const { friendshipId, action } = body;

        if (!friendshipId || !['accept', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'friendshipId and action (accept/reject) are required' }, { status: 400 });
        }

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
        }

        // Only the receiver can accept/reject
        if (friendship.receiverId !== currentUser.id) {
            return NextResponse.json({ error: 'You can only respond to requests sent to you' }, { status: 403 });
        }

        if (friendship.status !== 'PENDING') {
            return NextResponse.json({ error: 'This request has already been responded to' }, { status: 409 });
        }

        const updated = await prisma.friendship.update({
            where: { id: friendshipId },
            data: {
                status: action === 'accept' ? 'ACCEPTED' : 'REJECTED',
            },
        });

        return NextResponse.json({ success: true, friendship: updated });
    } catch (error) {
        console.error('Friend respond error:', error);
        return NextResponse.json({ error: 'Failed to respond to request' }, { status: 500 });
    }
}
