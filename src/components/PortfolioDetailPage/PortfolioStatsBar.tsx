import { Holding } from '@/api/generated/graphql';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  deltaPositive?: boolean;
}

const StatCard = ({ label, value, delta, deltaPositive }: StatCardProps) => (
  <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
    <div className="text-label">{label}</div>
    <div className="mt-3 text-2xl font-semibold tracking-tight text-slate-100">{value}</div>
    <div
      className={`mt-2 text-sm ${
        deltaPositive === true
          ? 'text-emerald-400'
          : deltaPositive === false
            ? 'text-rose-400'
            : 'text-slate-500'
      }`}
    >
      {delta}
    </div>
  </div>
);

const formatCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (value > 0) return `+$${formatted}`;
  if (value < 0) return `-$${formatted}`;
  return `$${formatted}`;
};

const formatPercent = (value: number): string => {
  const formatted = Math.abs(value).toFixed(2);
  if (value > 0) return `+${formatted}%`;
  if (value < 0) return `-${formatted}%`;
  return `${formatted}%`;
};

interface PortfolioStatsBarProps {
  holdings: Holding[];
  quotes: Record<string, number>;
  eodPrices: Record<string, number>;
  realizedPnl: number;
  loading: boolean;
}

export const PortfolioStatsBar = ({
  holdings,
  quotes,
  eodPrices,
  realizedPnl,
  loading,
}: PortfolioStatsBarProps) => {
  const missingQuotes = holdings.filter((h) => quotes[h.instrument.symbol] == null).length;

  const totalValue = holdings.reduce((sum, h) => {
    const price = quotes[h.instrument.symbol];
    return price != null ? sum + h.quantity * price : sum;
  }, 0);

  const totalValueYesterday = holdings.reduce((sum, h) => {
    const eod = eodPrices[h.instrument.symbol];
    return eod != null ? sum + h.quantity * eod : sum;
  }, 0);

  const todayChange = totalValueYesterday > 0 ? totalValue - totalValueYesterday : null;
  const todayChangePct = todayChange != null && totalValueYesterday > 0
    ? (todayChange / totalValueYesterday) * 100
    : null;

  const costBasis = holdings.reduce((sum, h) => sum + h.quantity * h.avgCost, 0);
  const unrealizedPnl = totalValue - costBasis;
  const unrealizedPct = costBasis > 0 ? (unrealizedPnl / costBasis) * 100 : 0;

  const totalValueDelta = todayChangePct != null
    ? `${formatPercent(todayChangePct)} today`
    : totalValue > 0
      ? 'Live prices'
      : 'No positions';
  const totalValueDeltaPositive = todayChangePct != null ? todayChangePct > 0 : undefined;

  if (loading) {
    return (
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-2xl shadow-black/20"
          >
            <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-3 h-7 w-36 animate-pulse rounded bg-white/10" />
            <div className="mt-2 h-3 w-20 animate-pulse rounded bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mb-8 flex flex-col gap-4">
      {missingQuotes > 0 && (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-xs text-amber-300">
          Live prices unavailable for {missingQuotes} symbol{missingQuotes > 1 ? 's' : ''}. Total value and P&L may be understated.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        label="Total Value"
        value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        delta={totalValueDelta}
        deltaPositive={totalValueDeltaPositive}
      />
      <StatCard
        label="Unrealized P&L"
        value={formatCurrency(unrealizedPnl)}
        delta={costBasis > 0 ? `${formatPercent(unrealizedPct)} total` : '—'}
        deltaPositive={unrealizedPnl > 0 ? true : unrealizedPnl < 0 ? false : undefined}
      />
      <StatCard
        label="Realized P&L"
        value={formatCurrency(realizedPnl)}
        delta="All time"
        deltaPositive={realizedPnl > 0 ? true : realizedPnl < 0 ? false : undefined}
      />
      </div>
    </div>
  );
};
