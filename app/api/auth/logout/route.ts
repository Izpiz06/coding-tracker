import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { clearSessionCookie, deleteSession } from '../../../../lib/auth';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('tracker_session')?.value;
    if (token) {
      await deleteSession(token);
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
