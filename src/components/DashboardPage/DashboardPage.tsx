import { useState } from 'react';
import { PlusIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { usePortfolios } from '@/api/hooks/portfolios/usePortfolios';
import { useDashboardStore } from '@/stores/dashboard.store';
import { Button } from '@/components/ui/button';
import { PortfolioSelector } from './PortfolioSelector';
import { PortfolioCard } from './PortfolioCard';
import { CreatePortfolioModal } from './CreatePortfolioModal';
import { PORTFOLIO_DOT_COLORS } from './constants';

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);

  const { portfolios, loading: portfoliosLoading, error: portfoliosError } = usePortfolios();

  const selectedPortfolioId = useDashboardStore((s) => s.selectedPortfolioId);

  const [openCreatePortfolioModal, setOpenCreatePortfolioModal] = useState(false);

  const activePortfolioId = selectedPortfolioId ?? portfolios.find((p) => p.isFavorite)?.id ?? null;

  const renderSkeletonCards = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-36 animate-pulse rounded-2xl bg-white/5" />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex min-h-64 items-center justify-center rounded-3xl border border-white/10 bg-white/5">
      <div className="text-center">
        <p className="text-sm text-slate-500">No portfolios yet</p>
        <Button
          variant="ghost"
          onClick={() => setOpenCreatePortfolioModal(true)}
          className="mt-3 text-slate-400 hover:text-slate-300"
        >
          Create your first portfolio
        </Button>
      </div>
    </div>
  );

  const renderPortfolioCards = () => (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {portfolios.map((portfolio, index) => (
        <PortfolioCard
          key={portfolio.id}
          portfolio={portfolio}
          activePortfolioId={activePortfolioId}
          color={PORTFOLIO_DOT_COLORS[index % PORTFOLIO_DOT_COLORS.length]}
        />
      ))}
    </div>
  );

  const renderPortfolioArea = () => {
    if (portfoliosLoading) return renderSkeletonCards();

    if (portfoliosError) return null;

    if (portfolios.length === 0) return renderEmptyState();

    return renderPortfolioCards();
  };

  return (
    <div className="px-8 pb-8 pt-20">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-heading-1">Dashboard</h1>

          {user && (
            <p className="mt-1 text-subtle">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <PortfolioSelector
            portfolios={portfolios}
            loading={portfoliosLoading}
            activePortfolioId={activePortfolioId}
          />

          <Button onClick={() => setOpenCreatePortfolioModal(true)}>
            <PlusIcon className="size-3.5" />
            New Portfolio
          </Button>
        </div>
      </div>

      {/* Portfolio fetch error */}
      {portfoliosError && (
        <p className="mb-6 text-body text-rose-400">{portfoliosError}</p>
      )}

      {renderPortfolioArea()}

      <CreatePortfolioModal
        open={openCreatePortfolioModal}
        onClose={() => setOpenCreatePortfolioModal(false)}
      />
    </div>
  );
};
