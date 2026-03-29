import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';

export async function GET() {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get accepted friends (both directions)
        const friendships = await prisma.friendship.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [
                    { senderId: currentUser.id },
                    { receiverId: currentUser.id },
                ],
            },
            include: {
                sender: { select: { id: true, name: true, email: true, leetcodeHandle: true, codeforcesHandle: true, githubHandle: true } },
                receiver: { select: { id: true, name: true, email: true, leetcodeHandle: true, codeforcesHandle: true, githubHandle: true } },
            },
        });

        const friends = friendships.map((f) => {
            const friend = f.senderId === currentUser.id ? f.receiver : f.sender;
            return { friendshipId: f.id, ...friend };
        });

        // Get pending requests received
        const pendingReceived = await prisma.friendship.findMany({
            where: {
                receiverId: currentUser.id,
                status: 'PENDING',
            },
            include: {
                sender: { select: { id: true, name: true, email: true } },
            },
        });

        // Get pending requests sent
        const pendingSent = await prisma.friendship.findMany({
            where: {
                senderId: currentUser.id,
                status: 'PENDING',
            },
            include: {
                receiver: { select: { id: true, name: true, email: true } },
            },
        });

        return NextResponse.json({ friends, pendingReceived, pendingSent });
    } catch (error) {
        console.error('Friends list error:', error);
        return NextResponse.json({ error: 'Failed to load friends' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { receiverId } = body;

        if (!receiverId || receiverId === currentUser.id) {
            return NextResponse.json({ error: 'Invalid user' }, { status: 400 });
        }

        // Check if user exists
        const receiver = await prisma.user.findUnique({ where: { id: receiverId } });
        if (!receiver) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if friendship already exists (either direction)
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: currentUser.id, receiverId },
                    { senderId: receiverId, receiverId: currentUser.id },
                ],
            },
        });

        if (existing) {
            if (existing.status === 'ACCEPTED') {
                return NextResponse.json({ error: 'Already friends' }, { status: 409 });
            }
            if (existing.status === 'PENDING') {
                return NextResponse.json({ error: 'Friend request already pending' }, { status: 409 });
            }
            // If rejected, allow re-sending by updating status
            if (existing.status === 'REJECTED') {
                const updated = await prisma.friendship.update({
                    where: { id: existing.id },
                    data: { senderId: currentUser.id, receiverId, status: 'PENDING' },
                });
                return NextResponse.json({ success: true, friendship: updated });
            }
        }

        const friendship = await prisma.friendship.create({
            data: {
                senderId: currentUser.id,
                receiverId,
            },
        });

        return NextResponse.json({ success: true, friendship });
    } catch (error) {
        console.error('Friend request error:', error);
        return NextResponse.json({ error: 'Failed to send friend request' }, { status: 500 });
    }
}
