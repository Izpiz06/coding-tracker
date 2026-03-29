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
    <main className="site-shell text-slate-100">
      <div className="site-container max-w-6xl">

        {/* Header with Navigation Back to Dashboard */}
        <div className="panel flex flex-col md:flex-row items-center justify-between mb-10 gap-4 p-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 mb-2">
              All Solved Problems
            </h1>
            <p className="text-slate-400 text-sm">A complete history of every question tracked in the database.</p>
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