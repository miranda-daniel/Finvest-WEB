import { createFileRoute } from '@tanstack/react-router';
import { SignInForm } from '@/components/SignInForm';
import { Card, CardContent } from '@/components/ui/card';

export const Route = createFileRoute('/_guest/login')({
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface-base">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_65%)]" />

      <div className="relative w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
            Finvest
          </div>
          <h1 className="text-heading-1">Sign in</h1>
          <p className="mt-2 text-subtle">Welcome back to your portfolio.</p>
        </div>

        <Card>
          <CardContent className="px-6 pb-6 pt-2">
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
