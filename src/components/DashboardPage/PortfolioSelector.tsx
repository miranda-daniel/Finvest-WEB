import { Menu } from '@base-ui/react/menu';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
import { useDashboardStore } from '@/stores/dashboard.store';
import { PORTFOLIO_DOT_COLORS, ALL_PORTFOLIOS_COLOR } from './constants';

interface Portfolio {
  id: number;
  name: string;
}

interface PortfolioSelectorProps {
  portfolios: Portfolio[];
  loading: boolean;
  activePortfolioId: number | null;
}

export const PortfolioSelector = ({ portfolios, loading, activePortfolioId }: PortfolioSelectorProps) => {
  const setSelectedPortfolio = useDashboardStore((s) => s.setSelectedPortfolio);

  if (loading) {
    return <div className="h-9 w-36 animate-pulse rounded-xl bg-white/[0.07]" />;
  }

  if (portfolios.length === 0) {
    return null;
  }

  const selectedIndex = portfolios.findIndex((p) => p.id === activePortfolioId);
  const selectedPortfolio = selectedIndex !== -1 ? portfolios[selectedIndex] : null;

  const selectedName = selectedPortfolio?.name ?? 'All Portfolios';

  const selectedColor = selectedPortfolio
    ? PORTFOLIO_DOT_COLORS[selectedIndex % PORTFOLIO_DOT_COLORS.length]
    : ALL_PORTFOLIOS_COLOR;

  return (
    <Menu.Root>
      <Menu.Trigger className="group flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/6 px-3.5 py-2 text-sm text-slate-100 transition-colors hover:bg-white/9 focus:outline-none data-popup-open:border-blue-400/40 data-popup-open:bg-white/9">
        <span className={`size-1.75 shrink-0 rounded-full ${selectedColor}`} />
        {selectedName}
        <ChevronDownIcon className="size-3.5 text-slate-400 group-data-popup-open:hidden" />
        <ChevronUpIcon className="hidden size-3.5 text-blue-400 group-data-popup-open:block" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={6}>
          <Menu.Popup className="z-50 min-w-47.5 rounded-[14px] border border-white/10 bg-surface-overlay p-1.5 shadow-2xl shadow-black/60 focus:outline-none data-open:animate-in data-open:fade-in-0 data-open:slide-in-from-top-1 data-open:duration-200 data-closed:animate-out data-closed:fade-out-0 data-closed:slide-out-to-top-1 data-closed:duration-150">
            {/* All Portfolios option */}
            <Menu.Item
              className="flex cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-2 text-sm text-slate-300 outline-none transition-colors hover:bg-white/4 focus:bg-white/4 data-highlighted:bg-white/4"
              onClick={() => setSelectedPortfolio(null)}
            >
              <span className={`size-1.75 shrink-0 rounded-full ${ALL_PORTFOLIOS_COLOR}`} />
              <span className={activePortfolioId === null ? 'font-medium text-slate-100' : ''}>
                All Portfolios
              </span>
              {activePortfolioId === null && (
                <CheckIcon className="ml-auto size-3.5 text-blue-400" />
              )}
            </Menu.Item>

            {/* Divider */}
            <div className="mx-1 my-1 h-px bg-white/6" />

            {/* Individual portfolios */}
            {portfolios.map((portfolio, index) => {
              const color = PORTFOLIO_DOT_COLORS[index % PORTFOLIO_DOT_COLORS.length];
              const isSelected = activePortfolioId === portfolio.id;

              return (
                <Menu.Item
                  key={portfolio.id}
                  className="flex cursor-pointer items-center gap-2.5 rounded-[9px] px-3 py-2 text-sm text-slate-300 outline-none transition-colors hover:bg-white/4 focus:bg-white/4 data-highlighted:bg-white/4"
                  onClick={() => setSelectedPortfolio(portfolio.id)}
                >
                  <span className={`size-1.75 shrink-0 rounded-full ${color}`} />
                  <span className={isSelected ? 'font-medium text-slate-100' : ''}>
                    {portfolio.name}
                  </span>

                  {isSelected && <CheckIcon className="ml-auto size-3.5 text-blue-400" />}
                </Menu.Item>
              );
            })}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
};
