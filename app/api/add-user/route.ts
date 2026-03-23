// app/api/add-user/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, leetcodeHandle, codeforcesHandle, passcode } = body;

    // 1. The Security Check
    if (passcode !== process.env.ADMIN_PASSCODE) {
      return NextResponse.json({ error: "Wrong passcode, bro." }, { status: 401 });
    }

    // 2. The "Max 5" Check
    const userCount = await prisma.user.count();
    if (userCount >= 5) {
      return NextResponse.json({ error: "Roster is full! Max 5 players allowed." }, { status: 403 });
    }

    // 3. Add the friend
    const newUser = await prisma.user.create({
      data: {
        name,
        leetcodeHandle: leetcodeHandle || null,
        codeforcesHandle: codeforcesHandle || null,
      }
    });

    return NextResponse.json({ success: true, user: newUser });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add user" }, { status: 500 });
  }
}