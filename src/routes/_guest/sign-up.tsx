import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm } from '@/components/SignUpForm';

export const Route = createFileRoute('/_guest/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
