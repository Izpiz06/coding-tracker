import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getCurrentUser } from '../../../../../lib/auth';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const friendId = parseInt(id, 10);

        if (isNaN(friendId)) {
            return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
        }

        // Verify friendship exists and is accepted
        const friendship = await prisma.friendship.findFirst({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { senderId: currentUser.id, receiverId: friendId },
                    { senderId: friendId, receiverId: currentUser.id },
                ],
            },
        });

        if (!friendship) {
            return NextResponse.json({ error: 'You are not friends with this user' }, { status: 403 });
        }

        // Get the friend's submissions
        const submissions = await prisma.submission.findMany({
            where: { userId: friendId },
            orderBy: { solvedAt: 'desc' },
            include: {
                user: { select: { name: true } },
            },
        });

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Friend submissions error:', error);
        return NextResponse.json({ error: 'Failed to load submissions' }, { status: 500 });
    }
}
