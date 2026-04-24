import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Finvest</h1>
      <Link
        to="/login"
        className="mb-6 flex w-fit items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign in
      </Link>
    </div>
  );
}
