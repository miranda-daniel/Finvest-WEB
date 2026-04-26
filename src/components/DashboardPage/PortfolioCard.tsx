import { StarIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useSetFavoritePortfolio } from '@/api/hooks/portfolios/useSetFavoritePortfolio';

interface Portfolio {
  id: number;
  name: string;
  isFavorite: boolean;
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  color: string;
  activePortfolioId: number | null;
}

export const PortfolioCard = ({ portfolio, color, activePortfolioId }: PortfolioCardProps) => {
  const navigate = useNavigate();
  const { setFavorite, loading } = useSetFavoritePortfolio();

  const isSelected = activePortfolioId === portfolio.id;

  const handleStarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    setFavorite(portfolio.isFavorite ? null : portfolio.id);
  };

  return (
    <div
      onClick={() =>
        void navigate({ to: '/portfolios/$portfolioId', params: { portfolioId: String(portfolio.id) } })
      }
      className={`relative cursor-pointer rounded-2xl border p-5 transition-colors ${
        isSelected
          ? 'border-blue-400/40 bg-blue-400/6'
          : 'border-white/8 bg-white/4 hover:border-white/15'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className={`size-2 shrink-0 rounded-full ${color}`} />
          <span className="text-heading-3">{portfolio.name}</span>
        </div>
        <button
          onClick={handleStarClick}
          className={`transition-colors ${
            portfolio.isFavorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
          }`}
          aria-label={portfolio.isFavorite ? 'Remove from favorites' : 'Set as favorite'}
        >
          <StarIcon className="size-4" fill={portfolio.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-label">Total Value</p>
        <p className="mt-1">—</p>
        <p className="mt-0.5 text-label">Holdings coming soon</p>
      </div>
    </div>
  );
};
