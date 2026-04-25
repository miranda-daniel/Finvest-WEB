import { useState } from 'react';
import { SearchIcon, XIcon } from 'lucide-react';
import { useInstrumentSearch, InstrumentSearchResult } from '@/api/hooks/instruments/useInstrumentSearch';

interface SymbolSearchModalProps {
  onSelect: (result: InstrumentSearchResult) => void;
  onClose: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  'Common Stock': 'stock',
  'ETF': 'etf',
  'Digital Currency': 'crypto',
  'Bond': 'bond',
};

const normalizeType = (type: string) => TYPE_LABEL[type] ?? type.toLowerCase();

export const SymbolSearchModal = ({ onSelect, onClose }: SymbolSearchModalProps) => {
  const [query, setQuery] = useState('');
  const { results, loading } = useInstrumentSearch(query);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-overlay p-6 shadow-2xl shadow-black/40">

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-heading-2">Symbol search</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5">
          <SearchIcon className="size-4 shrink-0 text-slate-500" />
          <input
            autoFocus
            type="text"
            placeholder="Symbol, name, or ISIN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        {/* Results */}
        <div className="flex flex-col gap-0.5">
          {loading && (
            <p className="text-subtle py-4 text-center">Searching...</p>
          )}

          {!loading && query.length >= 1 && results.length === 0 && (
            <p className="text-subtle py-4 text-center">No results found.</p>
          )}

          {results.map((result) => (
            <button
              key={`${result.symbol}-${result.exchange}`}
              onClick={() => { onSelect(result); onClose(); }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-white/5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-slate-200">
                {result.symbol[0]}
              </div>
              <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100">{result.symbol}</span>
                  <span className="truncate text-xs text-slate-400">{result.name}</span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-label">{normalizeType(result.type)}</span>
                <span className="text-xs font-medium text-slate-400">{result.exchange}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
