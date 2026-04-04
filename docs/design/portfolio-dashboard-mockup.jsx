import { useMemo, useState } from 'react'
import { Bar, BarChart } from 'recharts'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowUpDown, ChevronDown, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

type HoldingRow = {
  symbol: string
  name: string
  qty: number
  avg: number
  price: number
  pnl: number
  alloc: number
}

const holdings: HoldingRow[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', qty: 24, avg: 182.4, price: 198.12, pnl: 377.28, alloc: 18.4 },
  { symbol: 'MSFT', name: 'Microsoft', qty: 12, avg: 401.25, price: 428.91, pnl: 331.92, alloc: 16.1 },
  { symbol: 'NVDA', name: 'NVIDIA', qty: 18, avg: 102.1, price: 118.84, pnl: 301.32, alloc: 14.9 },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', qty: 10, avg: 504, price: 526.45, pnl: 224.5, alloc: 13.2 },
  { symbol: 'BTC', name: 'Bitcoin', qty: 0.18, avg: 61200, price: 68950, pnl: 1395, alloc: 12.6 },
]

type TransactionRow = {
  date: string
  type: 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE'
  symbol: string
  qty: string
  price: string
  platform: string
}

const transactions: TransactionRow[] = [
  { date: '2026-03-28', type: 'BUY', symbol: 'NVDA', qty: '4', price: '$116.20', platform: 'IBKR' },
  { date: '2026-03-20', type: 'DIVIDEND', symbol: 'AAPL', qty: '-', price: '$18.72', platform: 'IBKR' },
  { date: '2026-03-15', type: 'BUY', symbol: 'BTC', qty: '0.03', price: '$66,100', platform: 'Binance' },
  { date: '2026-03-11', type: 'SELL', symbol: 'SPY', qty: '2', price: '$522.15', platform: 'IBKR' },
  { date: '2026-03-04', type: 'FEE', symbol: 'IBKR', qty: '-', price: '$4.00', platform: 'IBKR' },
]

const allocation = [
  { label: 'Stocks', value: '56%' },
  { label: 'ETF', value: '18%' },
  { label: 'Crypto', value: '13%' },
  { label: 'Cash', value: '8%' },
  { label: 'Bonds', value: '5%' },
]

const instrumentAllocation = [
  { symbol: 'AAPL', value: 18.4 },
  { symbol: 'MSFT', value: 16.1 },
  { symbol: 'NVDA', value: 14.9 },
  { symbol: 'SPY', value: 13.2 },
  { symbol: 'BTC', value: 12.6 },
  { symbol: 'AMZN', value: 8.7 },
  { symbol: 'GOOGL', value: 7.4 },
  { symbol: 'CASH', value: 4.7 },
  { symbol: 'BND', value: 4.0 },
]

const pieColors = ['#60a5fa', '#67e8f9', '#fb923c', '#a78bfa', '#fbbf24', '#60a5fa', '#e879f9', '#38bdf8', '#34d399', '#fb7185', '#93c5fd', '#fdba74', '#4ade80', '#f43f5e']

const dailyGainers = [
  { symbol: 'NICE', change: 2.81, color: '#14b8a6' },
  { symbol: 'GLOB', change: 2.77, color: '#14b8a6' },
  { symbol: 'ACN', change: 2.17, color: '#14b8a6' },
  { symbol: 'MRSH', change: 1.59, color: '#14b8a6' },
  { symbol: 'PYPL', change: 1.59, color: '#14b8a6' },
]

const dailyLosers = [
  { symbol: 'DECK', change: -2.58, color: '#f43f5e' },
  { symbol: 'NOW', change: -1.96, color: '#f43f5e' },
  { symbol: 'DEO', change: -1.76, color: '#f43f5e' },
  { symbol: 'JD', change: -1.42, color: '#f43f5e' },
  { symbol: 'BABA', change: -1.36, color: '#f43f5e' },
]

const chartData = {
  '1D': [
    { label: '09:30', value: 41780, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: '10:30', value: 41890, portfolioPct: 0.26, spxPct: 0.08, ndxPct: 0.12 },
    { label: '11:30', value: 41810, portfolioPct: 0.07, spxPct: 0.02, ndxPct: 0.05 },
    { label: '12:30', value: 41980, portfolioPct: 0.48, spxPct: 0.14, ndxPct: 0.21 },
    { label: '13:30', value: 42120, portfolioPct: 0.81, spxPct: 0.22, ndxPct: 0.36 },
    { label: '14:30', value: 42050, portfolioPct: 0.65, spxPct: 0.18, ndxPct: 0.29 },
    { label: '15:30', value: 42184, portfolioPct: 0.97, spxPct: 0.31, ndxPct: 0.44 },
  ],
  '1W': [
    { label: 'Mon', value: 40620, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: 'Tue', value: 40980, portfolioPct: 0.89, spxPct: 0.35, ndxPct: 0.52 },
    { label: 'Wed', value: 41140, portfolioPct: 1.28, spxPct: 0.61, ndxPct: 0.83 },
    { label: 'Thu', value: 41890, portfolioPct: 3.13, spxPct: 1.14, ndxPct: 1.76 },
    { label: 'Fri', value: 42184, portfolioPct: 3.85, spxPct: 1.42, ndxPct: 2.05 },
  ],
  '1M': [
    { label: 'Week 1', value: 39040, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: 'Week 2', value: 39760, portfolioPct: 1.84, spxPct: 0.92, ndxPct: 1.14 },
    { label: 'Week 3', value: 40440, portfolioPct: 3.58, spxPct: 1.27, ndxPct: 1.62 },
    { label: 'Week 4', value: 41480, portfolioPct: 6.25, spxPct: 2.21, ndxPct: 3.14 },
    { label: 'Now', value: 42184, portfolioPct: 8.07, spxPct: 2.94, ndxPct: 4.28 },
  ],
  '3M': [
    { label: 'Jan', value: 36200, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: 'Feb', value: 37850, portfolioPct: 4.56, spxPct: 1.84, ndxPct: 2.76 },
    { label: 'Mar', value: 40380, portfolioPct: 11.55, spxPct: 3.92, ndxPct: 5.41 },
    { label: 'Apr', value: 42184, portfolioPct: 16.53, spxPct: 5.27, ndxPct: 7.38 },
  ],
  '1Y': [
    { label: 'Q2', value: 29840, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: 'Q3', value: 32780, portfolioPct: 9.85, spxPct: 4.02, ndxPct: 5.61 },
    { label: 'Q4', value: 36520, portfolioPct: 22.39, spxPct: 7.86, ndxPct: 10.12 },
    { label: 'Q1', value: 39880, portfolioPct: 33.65, spxPct: 10.15, ndxPct: 13.44 },
    { label: 'Now', value: 42184, portfolioPct: 41.37, spxPct: 12.22, ndxPct: 16.18 },
  ],
  ALL: [
    { label: '2022', value: 18500, portfolioPct: 0, spxPct: 0, ndxPct: 0 },
    { label: '2023', value: 24360, portfolioPct: 31.68, spxPct: 12.18, ndxPct: 17.84 },
    { label: '2024', value: 31280, portfolioPct: 69.08, spxPct: 23.91, ndxPct: 34.28 },
    { label: '2025', value: 38140, portfolioPct: 106.16, spxPct: 31.45, ndxPct: 44.73 },
    { label: 'Now', value: 42184, portfolioPct: 127.99, spxPct: 38.62, ndxPct: 53.11 },
  ],
}

const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL']
const chartTabs = ['Value', 'Performance']

const formatCurrency = (value) => `$${Number(value).toLocaleString()}`
const formatPercent = (value) => `${Number(value).toFixed(2)}%`

const holdingsColumns: ColumnDef<HoldingRow>[] = [
  {
    accessorKey: 'symbol',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium text-slate-300 hover:bg-transparent hover:text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Symbol
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-semibold tracking-wide text-white">{row.original.symbol}</div>,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => <div className="text-slate-300">{row.original.name}</div>,
  },
  {
    accessorKey: 'qty',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium text-slate-300 hover:bg-transparent hover:text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Qty
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => row.original.qty,
  },
  {
    accessorKey: 'avg',
    header: 'Avg Cost',
    cell: ({ row }) => formatCurrency(row.original.avg),
  },
  {
    accessorKey: 'price',
    header: 'Current Price',
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  {
    accessorKey: 'pnl',
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="h-auto p-0 font-medium text-slate-300 hover:bg-transparent hover:text-white"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Unrealized P&L
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => <span className="font-medium text-emerald-400">+{formatCurrency(row.original.pnl).replace('$', '$')}</span>,
  },
  {
    accessorKey: 'alloc',
    header: 'Allocation',
    cell: ({ row }) => (
      <div className="flex min-w-[110px] items-center gap-3">
        <div className="h-2 w-full rounded-full bg-white/10">
          <div className="h-2 rounded-full bg-white" style={{ width: `${row.original.alloc}%` }} />
        </div>
        <span className="text-slate-300">{row.original.alloc}%</span>
      </div>
    ),
  },
]

function ChartTooltip({ active, payload, label, mode }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f131b]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur">
      <div className="mb-2 font-medium text-slate-200">{label}</div>
      <div className="space-y-1.5 text-slate-300">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center justify-between gap-4">
            <span>{entry.name}</span>
            <span className="font-medium text-white">
              {mode === 'Value' ? formatCurrency(entry.value) : formatPercent(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AllocationTooltip({ active, payload }) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0f131b]/95 px-4 py-3 text-xs shadow-2xl backdrop-blur">
      <div className="font-medium text-slate-200">{item.symbol}</div>
      <div className="mt-1 text-slate-300">Allocation: <span className="font-medium text-white">{item.value}%</span></div>
    </div>
  )
}

function renderCustomizedPieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }) {
  const RADIAN = Math.PI / 180
  const insideRadius = innerRadius + (outerRadius - innerRadius) * 0.52
  const outsideRadius = outerRadius + 18
  const xInside = cx + insideRadius * Math.cos(-midAngle * RADIAN)
  const yInside = cy + insideRadius * Math.sin(-midAngle * RADIAN)
  const xOutside = cx + outsideRadius * Math.cos(-midAngle * RADIAN)
  const yOutside = cy + outsideRadius * Math.sin(-midAngle * RADIAN)
  const showOutsideLabel = percent > 0.045
  const showInsidePercent = percent > 0.04

  return (
    <>
      {showInsidePercent && (
        <text x={xInside} y={yInside} fill="#f8fafc" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
          {`${value}%`}
        </text>
      )}
      {showOutsideLabel && (
        <text
          x={xOutside}
          y={yOutside}
          fill="#f8fafc"
          textAnchor={xOutside > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={500}
        >
          {name}
        </text>
      )}
    </>
  )
}

function MoversList({ title, items, negative = false }) {
  return (
    <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-2xl text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => {
          const width = `${Math.min(Math.abs(item.change) * 28, 100)}%`
          return (
            <div key={item.symbol} className="grid grid-cols-[74px_1fr_56px] items-center gap-4">
              <div className="rounded-xl bg-white/10 px-3 py-1.5 text-center text-sm font-medium text-white">
                {item.symbol}
              </div>
              <div className="h-2.5 rounded-full bg-white/10">
                <div className="h-2.5 rounded-full" style={{ width, backgroundColor: item.color }} />
              </div>
              <div className={`text-right text-sm font-medium ${negative ? 'text-rose-400' : 'text-teal-400'}`}>
                {item.change > 0 ? '+' : ''}{item.change.toFixed(2)}%
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default function FinvestPortfolioDarkUIMockup() {
  const [selectedRange, setSelectedRange] = useState('1M')
  const [selectedChartTab, setSelectedChartTab] = useState('Value')
  const [sorting, setSorting] = useState<SortingState>([])
  const [transactionSorting, setTransactionSorting] = useState<SortingState>([])
  const [holdingsSearch, setHoldingsSearch] = useState('')
  const [transactionsSearch, setTransactionsSearch] = useState('')

  const currentSeries = useMemo(() => chartData[selectedRange], [selectedRange])
  const latestPoint = currentSeries[currentSeries.length - 1]

  const filteredHoldings = useMemo(() => {
    const query = holdingsSearch.trim().toLowerCase()
    if (!query) return holdings
    return holdings.filter(
      (holding) =>
        holding.symbol.toLowerCase().includes(query) ||
        holding.name.toLowerCase().includes(query)
    )
  }, [holdingsSearch])

  const holdingsTable = useReactTable({
    data: filteredHoldings,
    columns: holdingsColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const transactionColumns: ColumnDef<TransactionRow>[] = [
    {
      accessorKey: 'date',
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="h-auto p-0 font-medium text-slate-300 hover:bg-transparent hover:text-white"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
        </Button>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const type = row.original.type
        const classes =
          type === 'BUY'
            ? 'bg-emerald-400/15 text-emerald-300'
            : type === 'SELL'
              ? 'bg-rose-400/15 text-rose-300'
              : type === 'DIVIDEND'
                ? 'bg-sky-400/15 text-sky-300'
                : 'bg-amber-400/15 text-amber-300'

        return <span className={`inline-flex rounded-xl px-2.5 py-1 text-xs font-medium ${classes}`}>{type}</span>
      },
    },
    {
      accessorKey: 'symbol',
      header: 'Symbol',
      cell: ({ row }) => <span className="font-medium text-white">{row.original.symbol}</span>,
    },
    {
      accessorKey: 'qty',
      header: 'Qty',
    },
    {
      accessorKey: 'price',
      header: 'Price',
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ row }) => <span className="text-slate-300">{row.original.platform}</span>,
    },
  ]

  const filteredTransactions = useMemo(() => {
    const query = transactionsSearch.trim().toLowerCase()
    if (!query) return transactions
    return transactions.filter(
      (tx) =>
        tx.symbol.toLowerCase().includes(query) ||
        tx.type.toLowerCase().includes(query) ||
        tx.platform.toLowerCase().includes(query)
    )
  }, [transactionsSearch])

  const transactionsTable = useReactTable({
    data: filteredTransactions,
    columns: transactionColumns,
    state: { sorting: transactionSorting },
    onSortingChange: setTransactionSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="min-h-screen bg-[#0a0b10] text-slate-100">
      <div className="mx-auto max-w-7xl p-6 md:p-8">
        <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 backdrop-blur">
              Finvest · Portfolio Overview
            </div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Long Term Portfolio</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 md:text-base">
              TradingView-inspired portfolio experience with a modern dark theme, cleaner hierarchy, and a fintech-style dashboard layout.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
              Add transaction
            </Button>
            <Button className="rounded-2xl bg-white text-slate-950 hover:bg-slate-200">
              Import CSV
            </Button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Total Value', value: '$42,184.92', delta: '+3.82% today' },
            { label: 'Unrealized P&L', value: '+$3,148.42', delta: '+8.07% total' },
            { label: 'Realized P&L', value: '+$842.15', delta: 'YTD' },
            { label: 'Cash Available', value: '$2,184.00', delta: '5.2% allocation' },
          ].map((item) => (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <div className="text-sm text-slate-400">{item.label}</div>
              <div className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</div>
              <div className="mt-2 text-sm text-emerald-400">{item.delta}</div>
            </div>
          ))}
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.55fr_1fr] xl:items-start">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Portfolio performance</h2>
                <p className="mt-1 text-sm text-slate-400">Track total equity or compare your portfolio return against SPX and NDX.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Tabs value={selectedChartTab} className="w-auto">
                  <TabsList className="rounded-2xl border border-white/10 bg-black/20 p-1">
                    {chartTabs.map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        onClick={() => setSelectedChartTab(tab)}
                        className="rounded-xl data-[state=active]:bg-white data-[state=active]:text-slate-950"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <div className="flex gap-2 text-xs text-slate-300">
                  {ranges.map((range) => (
                    <Button
                      key={range}
                      variant={range === selectedRange ? 'default' : 'outline'}
                      onClick={() => setSelectedRange(range)}
                      className={range === selectedRange ? 'h-8 rounded-xl bg-white px-3 text-slate-950 hover:bg-slate-200' : 'h-8 rounded-xl border-white/10 bg-white/5 px-3 text-slate-300 hover:bg-white/10 hover:text-white'}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-2xl border border-white/5 bg-[#0d1017] p-4">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_35%)]" />

              {selectedChartTab === 'Value' ? (
                <>
                  <div className="absolute left-4 top-4 z-10 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    {formatCurrency(latestPoint.value)} current value
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentSeries} margin={{ top: 28, right: 14, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="portfolioValueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.26)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={formatCurrency}
                        tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={72}
                      />
                      <Tooltip content={<ChartTooltip mode="Value" />} cursor={{ stroke: 'rgba(255,255,255,0.12)' }} />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Portfolio value"
                        stroke="rgba(255,255,255,0.98)"
                        strokeWidth={3}
                        fill="url(#portfolioValueFill)"
                        dot={false}
                        activeDot={{ r: 4, fill: 'white', stroke: 'rgba(255,255,255,0.8)' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </>
              ) : (
                <>
                  <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 text-xs">
                    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1 text-slate-200">Portfolio · {formatPercent(latestPoint.portfolioPct)}</div>
                    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1 text-slate-300">SPX · {formatPercent(latestPoint.spxPct)}</div>
                    <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-1 text-slate-400">NDX · {formatPercent(latestPoint.ndxPct)}</div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentSeries} margin={{ top: 28, right: 14, left: 8, bottom: 8 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={formatPercent}
                        tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={64}
                      />
                      <Tooltip content={<ChartTooltip mode="Performance" />} cursor={{ stroke: 'rgba(255,255,255,0.12)' }} />
                      <Legend wrapperStyle={{ paddingTop: 10, fontSize: '12px' }} />
                      <Line type="monotone" dataKey="portfolioPct" name="Portfolio" stroke="rgba(255,255,255,0.98)" strokeWidth={3} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="spxPct" name="SPX" stroke="rgba(148,163,184,0.95)" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="ndxPct" name="NDX" stroke="rgba(71,85,105,0.95)" strokeWidth={2.5} strokeDasharray="7 7" dot={false} activeDot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </>
              )}
            </div>

            {/* Monthly profitability */}
<div className="mt-6 rounded-2xl border border-white/5 bg-[#0d1017] p-4">
  <div className="mb-3 text-sm text-slate-400">
    Portfolio profitability (monthly)
  </div>

  <ResponsiveContainer width="100%" height={260}>
    <BarChart
      data={[
        { label: 'Aug', portfolio: 0.1, spx: 0.05, ndx: 0.08 },
        { label: 'Sep', portfolio: 6.8, spx: 4.2, ndx: 5.6 },
        { label: 'Oct', portfolio: 3.9, spx: 2.1, ndx: 2.9 },
        { label: 'Nov', portfolio: -2.1, spx: 0.2, ndx: -0.4 },
        { label: 'Dec', portfolio: 1.2, spx: 0.4, ndx: 0.9 },
        { label: 'Jan', portfolio: 1.4, spx: 1.7, ndx: 2.3 },
        { label: 'Feb', portfolio: -6.5, spx: -0.9, ndx: -1.8 },
        { label: 'Mar', portfolio: -5.2, spx: -4.1, ndx: -4.8 },
        { label: 'Apr', portfolio: 0.6, spx: 1.1, ndx: 1.5 },
      ]}
      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
    >
      <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="4 6" vertical={false} />

      <XAxis
        dataKey="label"
        tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />

      <YAxis
        tickFormatter={(v) => `${v}%`}
        tick={{ fill: 'rgba(148,163,184,0.95)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={48}
      />

      <Tooltip formatter={(v) => `${Number(v).toFixed(2)}%`} />
      <Legend />

      <Bar dataKey="portfolio" name="Portfolio %" fill="#60a5fa" radius={[4,4,0,0]} />
      <Bar dataKey="spx" name="SPX %" fill="#22d3ee" radius={[4,4,0,0]} />
      <Bar dataKey="ndx" name="NDX %" fill="#a78bfa" radius={[4,4,0,0]} />
    </BarChart>
  </ResponsiveContainer>
</div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-white">Allocation</CardTitle>
                <CardDescription className="text-slate-400">Asset class distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-1 flex items-center justify-center">
                  <div className="relative h-44 w-44 rounded-full border-[18px] border-white/10">
                    <div className="absolute inset-3 rounded-full border-[14px] border-slate-700" />
                    <div className="absolute inset-0 rounded-full [background:conic-gradient(#ffffff_0_56%,#94a3b8_56%_74%,#64748b_74%_87%,#334155_87%_95%,#1e293b_95%_100%)]" />
                    <div className="absolute inset-10 rounded-full bg-[#0a0b10]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-xs text-slate-400">Total</span>
                      <span className="text-xl font-semibold">$42.1k</span>
                    </div>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {allocation.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/20 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
                        <span className="text-slate-300">{item.label}</span>
                      </div>
                      <span className="font-medium text-slate-100">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-lg text-white">Portfolio distribution</CardTitle>
                <CardDescription className="text-slate-400">Allocation by instrument</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 8, right: 34, left: 34, bottom: 8 }}>
                      <Pie
                        data={instrumentAllocation}
                        dataKey="value"
                        nameKey="symbol"
                        innerRadius={76}
                        outerRadius={132}
                        paddingAngle={2}
                        stroke="rgba(10,11,16,0.9)"
                        strokeWidth={2}
                        labelLine={false}
                        label={renderCustomizedPieLabel}
                      >
                        {instrumentAllocation.map((entry, index) => (
                          <Cell key={entry.symbol} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<AllocationTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 text-center text-sm text-slate-400">
                  Hover any slice to inspect the exact weight.
                </div>
              </CardContent>
            </Card>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
              <h2 className="text-lg font-semibold">Insights</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-3 text-emerald-300">
                  Best performer: BTC · +12.7%
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-300">
                  Highest allocation: AAPL · 18.4%
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-slate-300">
                  Recent dividend income: $18.72
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg text-white">Holdings</CardTitle>
                <CardDescription className="mt-1 text-slate-400">Core positions across your portfolio</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={holdingsSearch}
                    onChange={(e) => setHoldingsSearch(e.target.value)}
                    placeholder="Search symbol or asset..."
                    className="w-[250px] rounded-2xl border-white/10 bg-black/20 pl-9 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                  Filters
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <Table>
                  <TableHeader className="bg-white/5">
                    {holdingsTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="h-12 text-slate-400">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {holdingsTable.getRowModel().rows.length ? (
                      holdingsTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="border-white/5 bg-black/10 hover:bg-white/[0.03]">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3 text-slate-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="border-white/5 bg-black/10 hover:bg-black/10">
                        <TableCell colSpan={holdingsColumns.length} className="h-24 text-center text-slate-400">
                          No holdings found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <MoversList title="Daily gainers" items={dailyGainers} />
            <MoversList title="Daily losers" items={dailyLosers} negative />
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card className="rounded-3xl border-white/10 bg-white/5 shadow-2xl shadow-black/20 backdrop-blur">
            <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-lg text-white">Transactions</CardTitle>
                <CardDescription className="mt-1 text-slate-400">Recent operations across brokers and exchanges</CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    value={transactionsSearch}
                    onChange={(e) => setTransactionsSearch(e.target.value)}
                    placeholder="Search type, symbol or platform..."
                    className="w-[260px] rounded-2xl border-white/10 bg-black/20 pl-9 text-slate-100 placeholder:text-slate-500"
                  />
                </div>
                <Button variant="outline" className="rounded-2xl border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white">
                  View all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <Table>
                  <TableHeader className="bg-white/5">
                    {transactionsTable.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-white/5 hover:bg-transparent">
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="h-12 text-slate-400">
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {transactionsTable.getRowModel().rows.length ? (
                      transactionsTable.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="border-white/5 bg-black/10 hover:bg-white/[0.03]">
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3 text-slate-100">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow className="border-white/5 bg-black/10 hover:bg-black/10">
                        <TableCell colSpan={transactionColumns.length} className="h-24 text-center text-slate-400">
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
            <h2 className="text-lg font-semibold">Performance by asset</h2>
            <p className="mt-1 text-sm text-slate-400">Relative contribution this month</p>
            <div className="mt-5 space-y-4">
              {[
                { label: 'AAPL', value: 84 },
                { label: 'MSFT', value: 72 },
                { label: 'NVDA', value: 66 },
                { label: 'SPY', value: 48 },
                { label: 'BTC', value: 91 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400">{item.value}%</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10">
                    <div className="h-2.5 rounded-full bg-white" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
