import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/auth';
import { getGitHubStats } from '../../../../lib/github';

export const revalidate = 3600;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ handle: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { handle } = await params;
    const cleanHandle = decodeURIComponent(handle).trim();

    if (!cleanHandle) {
      return NextResponse.json({ error: 'GitHub handle is required' }, { status: 400 });
    }

    const stats = await getGitHubStats(cleanHandle);
    if (!stats) {
      return NextResponse.json({ error: 'GitHub stats not found' }, { status: 404 });
    }

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('GitHub stats route error:', error);
    return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
  }
}
