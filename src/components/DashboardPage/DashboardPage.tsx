import { useAuthStore } from '@/stores/auth.store';
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios';
import { PortfolioSelector } from './PortfolioSelector';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();

  return (
    <div className="px-8 pb-8 pt-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
          {user && (
            <p className="mt-1 text-sm text-slate-400">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>
        <PortfolioSelector portfolios={portfolios} loading={portfoliosLoading} />
      </div>

      {/* Portfolio fetch error */}
      {portfoliosError && (
        <p className="text-sm text-rose-400">
          Could not load portfolios: {portfoliosError.message}
        </p>
      )}

      {/* Dashboard content placeholder */}
      <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
        <p className="text-sm text-slate-500">Dashboard content coming soon</p>
      </div>
    </div>
  );
};
