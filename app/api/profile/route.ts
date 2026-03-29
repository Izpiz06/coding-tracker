import { NextResponse } from 'next/server';
import { getCurrentUser, isProfileComplete } from '../../../lib/auth';
import { prisma } from '../../../lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      profile: user,
      profileComplete: isProfileComplete(user),
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const githubHandle = body.githubHandle ? String(body.githubHandle).trim() : null;
    const leetcodeHandle = body.leetcodeHandle ? String(body.leetcodeHandle).trim() : null;
    const codeforcesHandle = body.codeforcesHandle ? String(body.codeforcesHandle).trim() : null;

    if (!leetcodeHandle || !codeforcesHandle) {
      return NextResponse.json({ error: 'LeetCode and Codeforces handles are required' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        githubHandle,
        leetcodeHandle,
        codeforcesHandle,
      },
      select: {
        id: true,
        name: true,
        email: true,
        githubHandle: true,
        leetcodeHandle: true,
        codeforcesHandle: true,
      },
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      profileComplete: isProfileComplete(updated),
    });
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'One of these handles is already used by another user' }, { status: 409 });
    }

    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
