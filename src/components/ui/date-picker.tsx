import * as React from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import 'react-day-picker/src/style.css';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const DatePicker = ({ value, onChange, className }: DatePickerProps) => {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const selected = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined;
  const isValidDate = selected && isValid(selected);

  const handleOpen = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };

  const handleSelect = (date: Date | undefined) => {
    if (date) { onChange(format(date, 'yyyy-MM-dd')); setOpen(false); }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        className={cn(
          'flex w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm transition-colors hover:border-white/20 focus:outline-none',
          isValidDate ? 'text-slate-200' : 'text-slate-500',
          className,
        )}
      >
        <CalendarIcon className="size-4 shrink-0 text-slate-500" />
        {isValidDate ? format(selected, 'MMM d, yyyy') : 'Pick a date'}
      </button>

      {open && rect && createPortal(
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-60" onClick={() => setOpen(false)} />

          {/* Calendar popup — fixed positioning so scroll after open doesn't misplace it */}
          <div
            className="fixed z-61 rounded-2xl border border-white/10 bg-surface-overlay p-3 shadow-2xl shadow-black/60"
            style={{ top: rect.bottom + 8, left: rect.left }}
          >
            <DayPicker
              mode="single"
              selected={isValidDate ? selected : undefined}
              onSelect={handleSelect}
              defaultMonth={isValidDate ? selected : new Date()}
              components={{
                PreviousMonthButton: ({ onClick }) => (
                  <button type="button" onClick={onClick} className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors">
                    <ChevronLeftIcon className="size-4" />
                  </button>
                ),
                NextMonthButton: ({ onClick }) => (
                  <button type="button" onClick={onClick} className="flex size-7 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200 transition-colors">
                    <ChevronRightIcon className="size-4" />
                  </button>
                ),
              }}
              classNames={{
                root: 'text-slate-200 text-sm',
                months: 'flex flex-col gap-4',
                month: 'flex flex-col gap-3',
                month_caption: 'flex items-center justify-between px-1 pb-1',
                caption_label: 'text-sm font-semibold text-slate-100',
                nav: 'flex items-center gap-1',
                month_grid: 'w-full border-collapse',
                weekdays: 'flex',
                weekday: 'flex-1 text-center text-xs text-slate-500 py-1 w-9',
                week: 'flex mt-1',
                day: 'flex-1 text-center',
                day_button: 'mx-auto flex size-9 items-center justify-center rounded-lg text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-slate-100 cursor-pointer',
                selected: '[&>button]:!bg-white/20 [&>button]:!text-slate-100 [&>button]:font-semibold',
                today: '[&>button]:border [&>button]:border-white/20',
                outside: '[&>button]:text-slate-600',
                disabled: '[&>button]:text-slate-700 [&>button]:cursor-not-allowed',
              }}
            />
          </div>
        </>,
        document.body,
      )}
    </>
  );
};
