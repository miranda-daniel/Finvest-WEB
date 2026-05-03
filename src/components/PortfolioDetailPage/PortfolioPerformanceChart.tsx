import { useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { usePortfolioPerformance, PortfolioRange } from '@/api/hooks/portfolios/usePortfolioPerformance';

interface PortfolioPerformanceChartProps {
  portfolioId: number;
}

type ChartTab = 'value' | 'performance';

const RANGES: Array<{ value: PortfolioRange; label: string }> = [
  { value: PortfolioRange.OneMonth,    label: '1M'  },
  { value: PortfolioRange.ThreeMonths, label: '3M'  },
  { value: PortfolioRange.YearToDate,  label: 'YTD' },
  { value: PortfolioRange.OneYear,     label: '1Y'  },
  { value: PortfolioRange.All,         label: 'ALL' },
];

const formatCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(1)}k`;
  return `$${value.toFixed(0)}`;
};

const formatPct = (value: number): string =>
  `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const formatDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const renderSkeleton = () => (
  <div className="flex h-52 items-end gap-2 px-4">
    {[40, 60, 45, 70, 55, 80, 65, 50, 75, 60, 85, 70].map((h, i) => (
      <div
        key={i}
        className="flex-1 animate-pulse rounded-t bg-white/10"
        style={{ height: `${h}%` }}
      />
    ))}
  </div>
);

const renderEmpty = () => (
  <div className="flex h-52 items-center justify-center">
    <p className="text-subtle">No historical data yet. The first snapshot will be captured tonight.</p>
  </div>
);

export const PortfolioPerformanceChart = ({ portfolioId }: PortfolioPerformanceChartProps) => {
  const [chartTab, setChartTab] = useState<ChartTab>('value');
  const [range, setRange] = useState<PortfolioRange>(PortfolioRange.OneMonth);

  const { points, loading } = usePortfolioPerformance(portfolioId, range);

  const renderSubTabs = () => (
    <div className="flex gap-1">
      {(['value', 'performance'] as ChartTab[]).map((tab) => (
        <button
          key={tab}
          onClick={() => setChartTab(tab)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
            chartTab === tab
              ? 'bg-white/10 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderRangeSelector = () => (
    <div className="flex gap-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          onClick={() => setRange(r.value)}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            range === r.value
              ? 'bg-white/10 text-slate-100'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );

  const renderValueChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="rgba(99,102,241,0.3)" stopOpacity={1} />
            <stop offset="95%" stopColor="rgba(99,102,241,0)"   stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,19,27,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            fontSize: '12px',
          }}
          labelFormatter={formatDate}
          formatter={(value: number) => [formatCurrency(value), 'Value']}
        />
        <Area
          type="monotone"
          dataKey="portfolioValue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#portfolioGradient)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderPerformanceChart = () => (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatPct}
          tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <Tooltip
          contentStyle={{
            background: 'rgba(15,19,27,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            fontSize: '12px',
          }}
          labelFormatter={formatDate}
          formatter={(value: number, name: string) => [formatPct(value), name]}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: 'rgba(148,163,184,0.95)', paddingTop: '12px' }}
        />
        <Line
          type="monotone"
          dataKey="portfolioReturnPct"
          name="Portfolio"
          stroke="#6366f1"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="spxReturnPct"
          name="SPX"
          stroke="#10b981"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="ndxReturnPct"
          name="NDX"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    if (loading) return renderSkeleton();
    if (points.length === 0) return renderEmpty();
    return chartTab === 'value' ? renderValueChart() : renderPerformanceChart();
  };

  return (
    <div className="mb-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl shadow-black/20">
      <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        {renderSubTabs()}
        {renderRangeSelector()}
      </div>
      <div className="px-2 py-4">
        {renderChart()}
      </div>
    </div>
  );
};
