import { useState } from 'react';
import { ArrowLeftIcon, PlusIcon } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { usePortfolioDetail } from '@/api/hooks/portfolios/usePortfolioDetail';
import { Holding } from '@/api/generated/graphql';
import { AddTransactionModal } from './AddTransactionModal';

const columnHelper = createColumnHelper<Holding>();

const columns = [
  columnHelper.accessor('instrument.symbol', {
    header: 'Symbol',
    cell: (info) => <span className="text-sm font-semibold text-slate-100">{info.getValue()}</span>,
  }),
  columnHelper.accessor('instrument.name', {
    header: 'Name',
    cell: (info) => <span className="text-body">{info.getValue()}</span>,
  }),
  columnHelper.accessor('instrument.instrumentClass', {
    header: 'Type',
    cell: (info) => (
      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-label">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor('quantity', {
    header: 'Quantity',
    cell: (info) => <span className="text-body">{info.getValue()}</span>,
  }),
  columnHelper.accessor('avgCost', {
    header: 'Avg Cost',
    cell: (info) => <span className="text-body">${info.getValue().toFixed(2)}</span>,
  }),
];

interface PortfolioDetailPageProps {
  portfolioId: number;
}

export const PortfolioDetailPage = ({ portfolioId }: PortfolioDetailPageProps) => {
  const navigate = useNavigate();
  const { portfolio, loading, error } = usePortfolioDetail(portfolioId);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  const table = useReactTable({
    data: portfolio?.holdings ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderHeader = () => (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => void navigate({ to: '/dashboard' })}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeftIcon className="size-5" />
        </button>
        <div>
          <h1 className="text-heading-1">{portfolio?.name ?? '—'}</h1>
          {portfolio?.description && <p className="mt-1 text-subtle">{portfolio.description}</p>}
        </div>
      </div>

      <Button onClick={() => setShowAddTransaction(true)}>
        <PlusIcon className="size-3.5" />
        Add Transaction
      </Button>
    </div>
  );

  const renderSkeletonRows = () =>
    [...Array(3)].map((_, i) => (
      <tr key={i} className="border-b border-white/5">
        {columns.map((col) => (
          <td key={col.id} className="px-5 py-4">
            <div className="h-4 animate-pulse rounded bg-white/10" />
          </td>
        ))}
      </tr>
    ));

  const renderEmptyRow = () => (
    <tr>
      <td colSpan={columns.length} className="px-5 py-12 text-center text-subtle">
        No holdings yet. Add your first transaction.
      </td>
    </tr>
  );

  const renderDataRows = () =>
    table.getRowModel().rows.map((row) => (
      <tr
        key={row.id}
        className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors"
      >
        {row.getVisibleCells().map((cell) => (
          <td key={cell.id} className="px-5 py-4">
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        ))}
      </tr>
    ));

  const renderTableBody = () => {
    if (loading) return renderSkeletonRows();

    if (table.getRowModel().rows.length === 0) return renderEmptyRow();

    return renderDataRows();
  };

  const renderHoldingsTable = () => (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur shadow-2xl shadow-black/20">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-white/8">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-5 py-3.5 text-left text-label">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>{renderTableBody()}</tbody>
      </table>
    </div>
  );

  return (
    <div className="px-8 pb-8 pt-20">
      {renderHeader()}

      {error && <p className="mb-6 text-body text-rose-400">{error}</p>}

      {renderHoldingsTable()}

      {showAddTransaction && (
        <AddTransactionModal
          portfolioId={portfolioId}
          onClose={() => setShowAddTransaction(false)}
        />
      )}
    </div>
  );
};
