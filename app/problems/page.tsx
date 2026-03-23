// app/problems/page.tsx
import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import ProblemsTable from '../../components/ProblemsTable';

// Ensures the page fetches fresh data every time it loads
export const revalidate = 0;

export default async function ProblemsPage() {
  // Fetch ALL submissions from the database, newest first, and include the user's name
  const allSubmissions = await prisma.submission.findMany({
    orderBy: { solvedAt: 'desc' },
    include: {
      user: true, // This is critical so the ProblemsTable knows whose log it is!
    },
  });

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header with Navigation Back to Dashboard */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4 bg-neutral-900/50 p-6 rounded-2xl border border-neutral-800">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              All Solved Problems
            </h1>
            <p className="text-neutral-400 text-sm">A complete history of every question tracked in the database.</p>
          </div>

          <Link
            href="/"
            className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
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