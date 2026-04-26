import { useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { OperationSide } from '@/api/generated/graphql';
import { useAddTransaction } from '@/api/hooks/portfolios/useAddTransaction';
import { useInstrumentQuote } from '@/api/hooks/instruments/useInstrumentQuote';
import { SymbolSearchModal } from './SymbolSearchModal';
import { InstrumentSearchResult } from '@/api/hooks/instruments/useInstrumentSearch';
import { DatePicker } from '@/components/ui/date-picker';

const schema = z.object({
  side: z.nativeEnum(OperationSide),
  symbol: z.string().min(1, 'Select a symbol'),
  name: z.string().min(1),
  instrumentClass: z.string().min(1),
  date: z.string().min(1, 'Date is required'),
  price: z.number({ error: 'Enter a valid price' }).positive('Price must be > 0'),
  quantity: z.number({ error: 'Enter a valid quantity' }).positive('Quantity must be > 0'),
});

type FormValues = z.infer<typeof schema>;

interface AddTransactionModalProps {
  portfolioId: number;
  onClose: () => void;
}

const today = () => new Date().toISOString().split('T')[0];

export const AddTransactionModal = ({ portfolioId, onClose }: AddTransactionModalProps) => {
  const [showSymbolSearchModal, setShowSymbolSearchModal] = useState(false);
  const { submit, loading, error } = useAddTransaction(onClose);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      side: OperationSide.Buy,
      symbol: '',
      name: '',
      instrumentClass: '',
      date: today(),
      price: 0,
      quantity: 1,
    },
  });

  const symbol = useWatch({ control, name: 'symbol' });
  const price = useWatch({ control, name: 'price' });
  const quantity = useWatch({ control, name: 'quantity' });

  const total = price > 0 && quantity > 0 ? (price * quantity).toFixed(2) : '0.00';

  const { fetchQuote } = useInstrumentQuote();

  const handleSymbolSelect = async (result: InstrumentSearchResult) => {
    setValue('symbol', result.symbol);
    setValue('name', result.name);
    setValue('instrumentClass', result.type);

    const fetchedPrice = await fetchQuote(result.symbol);

    if (fetchedPrice !== null) setValue('price', fetchedPrice);
  };

  const onSubmit = (values: FormValues) => {
    void submit({
      portfolioId,
      side: values.side,
      symbol: values.symbol,
      name: values.name,
      instrumentClass: values.instrumentClass,
      date: values.date,
      price: values.price,
      quantity: values.quantity,
    });
  };

  const renderSideToggle = () => (
    <div>
      <Label>Side</Label>

      <Controller
        name="side"
        control={control}
        render={({ field }) => (
          <div className="mt-1.5 flex overflow-hidden rounded-xl border border-white/10 bg-white/5">
            {[OperationSide.Sell, OperationSide.Buy].map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => field.onChange(side)}
                className={`flex-1 py-2 text-sm font-semibold transition-colors ${
                  field.value === side
                    ? side === OperationSide.Buy
                      ? 'bg-blue-500 text-white'
                      : 'bg-rose-500/80 text-white'
                    : side === OperationSide.Buy
                      ? 'text-slate-400 hover:text-blue-400'
                      : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                {side}
              </button>
            ))}
          </div>
        )}
      />
    </div>
  );

  const renderSymbolField = () => (
    <div>
      <Label>Symbol</Label>
      <button
        type="button"
        onClick={() => setShowSymbolSearchModal(true)}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-left text-sm text-slate-400 transition-colors hover:border-white/20 focus:outline-none"
      >
        {symbol || 'Choose symbol...'}
      </button>
      {errors.symbol && <p className="mt-1 text-xs text-rose-400">{errors.symbol.message}</p>}
    </div>
  );

  const renderDateField = () => (
    <div>
      <Label>Date</Label>
      <Controller
        name="date"
        control={control}
        render={({ field }) => (
          <DatePicker className="mt-1.5" value={field.value} onChange={field.onChange} />
        )}
      />
      {errors.date && <p className="mt-1 text-xs text-rose-400">{errors.date.message}</p>}
    </div>
  );

  const renderPriceField = () => (
    <div>
      <Label>
        Price <span className="text-slate-500">(USD)</span>
      </Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        className="mt-1.5"
        {...register('price', { valueAsNumber: true })}
      />
      {errors.price && <p className="mt-1 text-xs text-rose-400">{errors.price.message}</p>}
    </div>
  );

  const renderQuantityField = () => (
    <div>
      <Label>Quantity</Label>
      <Input
        type="number"
        step="0.1"
        min="0"
        className="mt-1.5"
        {...register('quantity', { valueAsNumber: true })}
      />
      {errors.quantity && <p className="mt-1 text-xs text-rose-400">{errors.quantity.message}</p>}
    </div>
  );

  const renderTotal = () => (
    <div className="flex items-center justify-between border-t border-white/8 pt-4">
      <span className="text-subtle">Total</span>
      <span className="text-lg font-semibold text-slate-100">${total}</span>
    </div>
  );

  const renderActions = () => (
    <div className="flex justify-end gap-2.5">
      <Button type="button" variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save'}
      </Button>
    </div>
  );

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="max-w-sm rounded-2xl border border-white/10 bg-surface-overlay p-7 shadow-2xl shadow-black/40 ring-0 gap-0"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-heading-2">Add Transaction</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {renderSideToggle()}
            {renderSymbolField()}
            {renderDateField()}
            {renderPriceField()}
            {renderQuantityField()}
            {renderTotal()}

            {error && <p className="text-xs text-rose-400">{error}</p>}

            {renderActions()}
          </form>
        </DialogContent>
      </Dialog>

      {showSymbolSearchModal && (
        <SymbolSearchModal
          onSelect={handleSymbolSelect}
          onClose={() => setShowSymbolSearchModal(false)}
        />
      )}
    </>
  );
};
