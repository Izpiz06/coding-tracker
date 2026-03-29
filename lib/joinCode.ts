// lib/joinCode.ts
// Generates a unique 6-character alphanumeric join code for rooms

import { prisma } from './prisma';

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 0, 1 to avoid confusion

export function generateCode(): string {
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return code;
}

/**
 * Generate a unique join code with collision retry.
 * Retries up to 10 times before throwing.
 */
export async function generateUniqueJoinCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
        const code = generateCode();
        const existing = await prisma.room.findUnique({ where: { joinCode: code } });
        if (!existing) return code;
    }
    throw new Error('Failed to generate unique join code after 10 attempts');
}
