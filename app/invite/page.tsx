import Link from 'next/link';

export default function InvitePage() {
  return (
    <main className="site-shell text-slate-100 flex items-center justify-center">
      <div className="max-w-md w-full panel p-8 text-center">
        <h1 className="text-2xl font-bold mb-3 text-slate-100">Authentication Updated</h1>
        <p className="text-sm text-slate-400 mb-6">
          This app now uses account-based login/register instead of the old invite flow.
        </p>
        <Link
          href="/auth"
          className="btn-primary inline-block px-5 py-2"
        >
          Go to Login / Register
        </Link>
      </div>
    </main>
  );
}
