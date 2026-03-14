// app/api/leetcode/route.ts
import { NextResponse } from 'next/server';
import { getLeetCodeStats } from '../../../lib/leetcode'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');

  if (!handle) {
    return NextResponse.json({ error: 'Please provide a LeetCode handle' }, { status: 400 });
  }

  const stats = await getLeetCodeStats(handle);

  if (!stats) {
    return NextResponse.json({ error: 'Failed to fetch stats or user not found' }, { status: 404 });
  }

  return NextResponse.json({
    handle,
    stats
  });
}