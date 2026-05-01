import { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import 'flag-icons/css/flag-icons.min.css';
import {
  useInstrumentSearch,
  InstrumentSearchResponse,
} from '@/api/hooks/instruments/useInstrumentSearch';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDebounce } from '@/lib/useDebounce';

interface SymbolSearchModalProps {
  onSelect: (result: InstrumentSearchResponse) => void;
  onClose: () => void;
}

// Instrument type strings as returned by the search API
enum InstrumentType {
  CommonStock = 'Common Stock',
  ADR = 'American Depositary Receipt',
  ETF = 'ETF',
  DigitalCurrency = 'Digital Currency',
  Bond = 'Bond',
}

const TYPE_LABEL: Record<string, string> = {
  [InstrumentType.CommonStock]: 'stock',
  [InstrumentType.ADR]: 'stock',
  [InstrumentType.ETF]: 'etf',
  [InstrumentType.DigitalCurrency]: 'crypto',
  [InstrumentType.Bond]: 'bond',
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
      src={`/logos/${symbol}.png`}
      alt={symbol}
      className="size-8 shrink-0 rounded-full object-contain"
      onError={() => setFailed(true)}
    />
  );
};

enum FilterTab {
  All = 'all',
  Stocks = 'stocks',
  Cryptos = 'cryptos',
}

const STOCK_TYPES = new Set<string>([InstrumentType.CommonStock, InstrumentType.ADR]);

const applyFilter = (results: InstrumentSearchResponse[], tab: FilterTab) => {
  if (tab === FilterTab.Stocks)
    return results.filter((r) => STOCK_TYPES.has(r.type) && r.exchange !== 'OTC');

  if (tab === FilterTab.Cryptos)
    return results.filter((r) => r.type === InstrumentType.DigitalCurrency);
  return results;
};

interface ResultRowProps {
  result: InstrumentSearchResponse;
  onSelect: (result: InstrumentSearchResponse) => void;
  onClose: () => void;
}

const ResultRow = ({ result, onSelect, onClose }: ResultRowProps) => (
  <button
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
        <span className={`fi fi-${result.country.toLowerCase()}`} title={result.country} />
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
);

export const SymbolSearchModal = ({ onSelect, onClose }: SymbolSearchModalProps) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>(FilterTab.Stocks);

  const debouncedQuery = useDebounce(query, 400);

  const { results, loading } = useInstrumentSearch(debouncedQuery);
  const filtered = applyFilter(results, activeTab);

  const renderSearchInput = () => (
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
  );

  const renderFilterTabs = () => (
    <div className="mb-4 flex gap-1.5">
      {Object.values(FilterTab).map((tab) => (
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
          {tab === FilterTab.All ? 'All' : tab === FilterTab.Stocks ? 'Stocks' : 'Crypto'}
        </button>
      ))}
    </div>
  );

  const renderResults = () => (
    <div className="flex flex-col gap-0.5 max-h-96 overflow-y-auto">
      {loading && <p className="text-subtle py-4 text-center">Searching...</p>}

      {!loading && debouncedQuery.length >= 1 && filtered.length === 0 && (
        <p className="text-subtle py-4 text-center">No results found.</p>
      )}

      {filtered.map((result) => (
        <ResultRow
          key={`${result.symbol}-${result.exchange}`}
          result={result}
          onSelect={onSelect}
          onClose={onClose}
        />
      ))}
    </div>
  );

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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading-2">Symbol search</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {renderSearchInput()}
        {renderFilterTabs()}
        {renderResults()}
      </DialogContent>
    </Dialog>
  );
};
