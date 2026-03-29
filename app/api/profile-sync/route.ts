import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../lib/auth';
import { syncUserLifetimeData } from '../../../lib/userSync';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const result = await syncUserLifetimeData({
      id: user.id,
      leetcodeHandle: user.leetcodeHandle,
      codeforcesHandle: user.codeforcesHandle,
    });

    return NextResponse.json({
      success: true,
      snapshotsCreated: result.snapshotsCreated,
      submissionsProcessed: result.submissionsProcessed,
      newSubmissions: result.newSubmissions,
      errors: result.errors,
      message: `Synced ${result.snapshotsCreated} snapshots and checked ${result.submissionsProcessed} lifetime submissions`
    });
  } catch (error) {
    console.error('Profile sync error:', error);
    return NextResponse.json({ error: 'Failed to sync profile' }, { status: 500 });
  }
}

