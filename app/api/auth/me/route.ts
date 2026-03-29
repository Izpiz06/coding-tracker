import { NextResponse } from 'next/server';
import { getCurrentUser, isProfileComplete } from '../../../../lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user,
      profileComplete: isProfileComplete(user),
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Failed to load user' }, { status: 500 });
  }
}
