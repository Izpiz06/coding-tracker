import { NextResponse } from 'next/server';
import { getCodeforcesStats } from '@/lib/codeforces';

export async function GET(request: Request) {
  // Extract the handle from the URL query parameters
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Please provide a Codeforces handle' }, { status: 400 });
  }

  // Call the utility function we just wrote
  const stats = await getCodeforcesStats(handle);

  if (!stats) {
    return NextResponse.json({ error: 'Failed to fetch stats or user not found' }, { status: 404 });
  }

  // Return the data as JSON
  return NextResponse.json({
    handle,
    stats
  });
}