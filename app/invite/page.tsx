import Link from 'next/link';

export default function InvitePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-2xl font-bold mb-3 text-emerald-400">Authentication Updated</h1>
        <p className="text-sm text-neutral-400 mb-6">
          This app now uses account-based login/register instead of the old invite flow.
        </p>
        <Link
          href="/auth"
          className="inline-block px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-lg font-bold"
        >
          Go to Login / Register
        </Link>
      </div>
    </main>
  );
}
