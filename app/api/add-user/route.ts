import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'This endpoint is deprecated. Please use /auth to register and login.' },
    { status: 410 }
  );
}