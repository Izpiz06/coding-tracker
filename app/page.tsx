// app/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/prisma';
import LogoutButton from '../components/LogoutButton';
import SyncButton from '../components/SyncButton';
import { calculateScore } from '../lib/scoring';
import { getCurrentUser, isProfileComplete } from '../lib/auth';

export const revalidate = 0;

export default async function Home() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth');
  }

  const profileComplete = isProfileComplete(currentUser);

  // Get all users for leaderboard
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      snapshots: {
        orderBy: { recordedAt: 'desc' },
      },
    },
  });

  // Get current user's rooms
  const userRooms = await prisma.room.findMany({
    where: {
      members: {
        some: {
          userId: currentUser.id,
        },
      },
    },
    select: {
      id: true,
      joinCode: true,
      name: true,
      createdById: true,
      createdBy: {
        select: {
          name: true,
        },
      },
      members: {
        select: {
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const globalLeaderboard = users
    .map((user) => {
      const latestLeetCode = user.snapshots.find((s) => s.platform === 'LEETCODE');
      const latestCodeforces = user.snapshots.find((s) => s.platform === 'CODEFORCES');
      const score = calculateScore({
        lcEasy: latestLeetCode?.easySolved || 0,
        lcMedium: latestLeetCode?.mediumSolved || 0,
        lcHard: latestLeetCode?.hardSolved || 0,
        cfSolved: latestCodeforces?.totalSolved || 0,
        cfRating: latestCodeforces?.rating || 0,
      });

      return {
        id: user.id,
        name: user.name,
        score: score.totalScore,
        leetcodeTotal: latestLeetCode?.totalSolved || 0,
        codeforcesTotal: latestCodeforces?.totalSolved || 0,
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Coding Tracker
            </h1>
            <p className="text-sm text-neutral-400 mt-1">Signed in as {currentUser.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              📊 Dashboard
            </Link>
            <Link
              href="/problems"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              Problems
            </Link>
            <Link
              href="/profile/setup"
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-lg font-bold text-sm transition-all"
            >
              Profile
            </Link>
            <SyncButton />
            <LogoutButton />
          </div>
        </div>

        {!profileComplete && (
          <div className="mb-8 rounded-xl border border-amber-800/50 bg-amber-900/20 p-4 text-amber-300 text-sm">
            Complete your profile handles (LeetCode + Codeforces) before joining/creating rooms.
            <Link href="/profile/setup" className="ml-2 underline underline-offset-2">
              Complete profile
            </Link>
          </div>
        )}

        {/* Global Leaderboard */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl mb-10">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-widest">🏆 Global Leaderboard</h2>
          </div>
          <div className="divide-y divide-neutral-800/50">
            {globalLeaderboard.map((entry, index) => (
              <div key={entry.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-neutral-400 w-8 font-bold">#{index + 1}</span>
                  <Link href={`/players/${entry.id}`} className="font-bold hover:text-emerald-400 transition-colors">
                    {entry.name}
                  </Link>
                </div>
                <div className="text-sm text-neutral-400 hidden md:block">
                  LC {entry.leetcodeTotal} • CF {entry.codeforcesTotal}
                </div>
                <div className="text-xl font-black text-emerald-400">{entry.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-200 uppercase tracking-widest">🎮 My Rooms</h2>
            <Link
              href="/rooms"
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded font-semibold transition-all"
            >
              Manage Rooms
            </Link>
          </div>

          {userRooms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-neutral-400 mb-4">No rooms yet. Create one to start competing!</p>
              <Link
                href="/rooms"
                className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all"
              >
                Create Your First Room
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-800/50">
              {userRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.joinCode}`}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-neutral-800/50 transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-emerald-400 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-sm text-neutral-400">
                      Code: <span className="font-mono bg-neutral-800 px-2 py-1 rounded">{room.joinCode}</span>
                      {currentUser.id === room.createdById && (
                        <span className="ml-2 px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded text-xs font-bold">
                          OWNER
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-400">{room.members.length} Member{room.members.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-neutral-500">Created by {room.createdBy.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}