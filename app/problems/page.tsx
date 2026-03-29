// app/problems/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '../../lib/prisma';
import { getCurrentUser } from '../../lib/auth';
import ProblemsTable from '../../components/ProblemsTable';

// Ensures the page fetches fresh data every time it loads
export const revalidate = 0;

export default async function ProblemsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect('/auth');
  }

  // Get accepted friend IDs
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { senderId: currentUser.id },
        { receiverId: currentUser.id },
      ],
    },
    select: { senderId: true, receiverId: true },
  });

  const friendIds = friendships.map((f) =>
    f.senderId === currentUser.id ? f.receiverId : f.senderId
  );

  // Include self + friends
  const allowedUserIds = [currentUser.id, ...friendIds];

  // Fetch submissions for self + friends only
  const allSubmissions = await prisma.submission.findMany({
    where: { userId: { in: allowedUserIds } },
    orderBy: { solvedAt: 'desc' },
    include: {
      user: true,
    },
  });

  return (
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header with Navigation Back to Dashboard */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">
              Solved Problems
            </h1>
            <p className="text-slate-400 text-sm">Your problems and your friends&apos; problems.</p>
          </div>

          <Link
            href="/"
            className="btn-ghost px-6 py-2 text-sm transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Drop in the interactive table */}
        <ProblemsTable submissions={allSubmissions} />

      </div>
    </main>
  );
}