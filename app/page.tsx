// app/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../lib/prisma';
import LogoutButton from '../components/LogoutButton';
import SyncButton from '../components/SyncButton';
import { calculateScore } from '../lib/scoring';
import { getCurrentUser, isProfileComplete } from '../lib/auth';
import { RiBarChartLine, RiDoorLockBoxLine, RiGamepadLine, RiMedalLine, RiTeamLine, RiUserSettingsLine } from 'react-icons/ri';

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
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
              Coding Tracker
            </h1>
            <p className="text-sm text-slate-400 mt-1">Signed in as {currentUser.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <RiBarChartLine className="text-sky-300" /> Dashboard
            </Link>
            <Link
              href="/problems"
              className="btn-ghost px-4 py-2 text-sm"
            >
              Problems
            </Link>
            <Link
              href="/profile/setup"
              className="btn-ghost inline-flex items-center gap-2 px-4 py-2 text-sm"
            >
              <RiUserSettingsLine className="text-sky-300" /> Profile
            </Link>
            <SyncButton />
            <LogoutButton />
          </div>
        </div>

        {!profileComplete && (
          <div className="mb-8 rounded-xl border border-amber-700/50 bg-amber-900/20 p-4 text-amber-300 text-sm">
            Complete your profile handles (LeetCode + Codeforces) before joining/creating rooms.
            <Link href="/profile/setup" className="ml-2 underline underline-offset-2">
              Complete profile
            </Link>
          </div>
        )}

        {/* Global Leaderboard */}
        <div className="panel overflow-hidden mb-10">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/70">
            <h2 className="section-title inline-flex items-center gap-2"><RiMedalLine className="text-sky-300" /> Global Leaderboard</h2>
          </div>
          <div className="divide-y divide-slate-700/40">
            {globalLeaderboard.map((entry, index) => (
              <div key={entry.id} className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/25 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-slate-400 w-8 font-bold">#{index + 1}</span>
                  <Link href={`/players/${entry.id}`} className="font-bold hover:text-sky-300 transition-colors">
                    {entry.name}
                  </Link>
                </div>
                <div className="text-sm text-slate-400 hidden md:block">
                  LC {entry.leetcodeTotal} • CF {entry.codeforcesTotal}
                </div>
                <div className="text-xl font-black text-sky-300">{entry.score}</div>
              </div>
            ))}
          </div>
        </div>

        {/* My Rooms Section */}
        <div className="panel overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/70 flex items-center justify-between">
            <h2 className="section-title inline-flex items-center gap-2"><RiGamepadLine className="text-sky-300" /> My Rooms</h2>
            <Link
              href="/rooms"
              className="btn-primary px-3 py-1 text-sm"
            >
              Manage Rooms
            </Link>
          </div>

          {userRooms.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <p className="text-slate-400 mb-4">No rooms yet. Create one to start competing!</p>
              <Link
                href="/rooms"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3"
              >
                <RiTeamLine className="text-sky-300" />
                Create Your First Room
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/40">
              {userRooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/rooms/${room.joinCode}`}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-lg group-hover:text-sky-300 transition-colors">
                      {room.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Code: <span className="font-mono bg-slate-800/80 px-2 py-1 rounded">{room.joinCode}</span>
                      {currentUser.id === room.createdById && (
                        <span className="ml-2 px-2 py-1 bg-sky-900/30 text-sky-300 rounded text-xs font-bold inline-flex items-center gap-1">
                          <RiDoorLockBoxLine />
                          OWNER
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{room.members.length} Member{room.members.length !== 1 ? 's' : ''}</p>
                    <p className="text-xs text-slate-500">Created by {room.createdBy.name}</p>
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