import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/$')({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-base text-slate-100">
      <div className="text-center">
        <p className="text-sm text-slate-400">404</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-slate-400">The page you&apos;re looking for doesn&apos;t exist.</p>
      </div>
      <Link
        to="/dashboard"
        className="text-sm text-slate-300 underline-offset-4 hover:text-white hover:underline"
      >
        Go to dashboard
      </Link>
    </div>
  );
}
