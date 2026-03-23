import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border p-8 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold">Sign in</h1>
        <p className="text-sm text-gray-500">Login form goes here.</p>
      </div>
    </div>
  )
}
