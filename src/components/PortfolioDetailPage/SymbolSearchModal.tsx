import { useState, useEffect } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import {
  useInstrumentSearch,
  InstrumentSearchResult,
} from '@/api/hooks/instruments/useInstrumentSearch';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface SymbolSearchModalProps {
  onSelect: (result: InstrumentSearchResult) => void;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  'Common Stock': 'stock',
  'American Depositary Receipt': 'stock',
  ETF: 'etf',
  'Digital Currency': 'crypto',
  Bond: 'bond',
};

const normalizeType = (type: string) => TYPE_LABEL[type] ?? type.toLowerCase();

interface SymbolLogoProps {
  symbol: string;
}

const SymbolLogo = ({ symbol }: SymbolLogoProps) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-slate-200">
        {symbol[0]}
      </div>
    );
  }

  return (
    <img
      src={`https://financialmodelingprep.com/image-stock/${symbol}.png`}
      alt={symbol}
      className="size-8 shrink-0 rounded-full object-contain"
      onError={() => setFailed(true)}
    />
  );
};

type FilterTab = 'all' | 'stocks' | 'cryptos';

const STOCK_TYPES = new Set(['Common Stock', 'American Depositary Receipt']);

const applyFilter = (results: InstrumentSearchResult[], tab: FilterTab) => {
  if (tab === 'stocks')
    return results.filter((r) => STOCK_TYPES.has(r.type) && r.exchange !== 'OTC');

  if (tab === 'cryptos') return results.filter((r) => r.type === 'Digital Currency');
  return results;
};

export const SymbolSearchModal = ({ onSelect, onClose }: SymbolSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('stocks');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { results, loading } = useInstrumentSearch(debouncedQuery);
  const filtered = applyFilter(results, activeTab);

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-xl sm:max-w-xl rounded-2xl border border-white/10 bg-surface-overlay p-6 shadow-2xl shadow-black/40 ring-0 gap-0"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading-2">Symbol search</h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <SearchIcon className="size-4 shrink-0 text-slate-500" />
          <input
            autoFocus
            type="text"
            placeholder="Symbol or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter tabs */}
        <div className="mb-4 flex gap-1.5">
          {(['all', 'stocks', 'cryptos'] as FilterTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium capitalize transition-colors',
                activeTab === tab
                  ? 'border-white/20 bg-white/10 text-slate-100'
                  : 'border-white/10 bg-transparent text-slate-500 hover:text-slate-300',
              )}
            >
              {tab === 'all' ? 'All' : tab === 'stocks' ? 'Stocks' : 'Crypto'}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="flex flex-col gap-0.5 max-h-96 overflow-y-auto">
          {loading && <p className="text-subtle py-4 text-center">Searching...</p>}

          {!loading && debouncedQuery.length >= 1 && filtered.length === 0 && (
            <p className="text-subtle py-4 text-center">No results found.</p>
          )}

          {filtered.map((result) => (
            <button
              key={`${result.symbol}-${result.exchange}`}
              onClick={() => {
                onSelect(result);
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <SymbolLogo symbol={result.symbol} />

              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">{result.symbol}</span>
                  <span className="truncate text-xs text-slate-400">{result.name}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="text-label">{normalizeType(result.type)}</span>

                <span className="text-xs font-medium text-slate-400">{result.exchange}</span>

                {result.country?.length === 2 ? (
                  <span
                    className={`fi fi-${result.country.toLowerCase()}`}
                    title={result.country}
                  />
                ) : (
                  <span
                    className="inline-block w-4 ml-0.5 mr-1 text-center text-xs text-slate-600"
                    title="Unknown"
                  >
                    N/A
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
