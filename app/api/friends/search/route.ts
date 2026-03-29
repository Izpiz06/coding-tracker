import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getCurrentUser } from '../../../../lib/auth';

export async function GET(request: Request) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const query = url.searchParams.get('q')?.trim();

        if (!query || query.length < 2) {
            return NextResponse.json({ users: [] });
        }

        const users = await prisma.user.findMany({
            where: {
                id: { not: currentUser.id },
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                name: true,
                email: true,
            },
            take: 10,
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error('User search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
