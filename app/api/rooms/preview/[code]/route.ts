import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await prisma.room.findUnique({
      where: { joinCode: code.toUpperCase() },
      include: {
        createdBy: { select: { name: true } },
        _count: { select: { members: true } },
      },
    });

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({
      room: {
        name: room.name,
        memberCount: room._count.members,
        createdBy: room.createdBy.name,
      },
    });
  } catch (error) {
    console.error('Room preview error:', error);
    return NextResponse.json({ error: 'Failed to load room preview' }, { status: 500 });
  }
}
