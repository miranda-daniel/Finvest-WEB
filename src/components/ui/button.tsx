import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center rounded-2xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        // White background — main CTA
        primary: 'bg-slate-300 text-slate-950 hover:bg-slate-200',
        // Subtle border + background — secondary/cancel actions
        secondary: 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
        // Transparent — icon buttons and dialog close
        ghost: 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
        // Destructive — irreversible or dangerous actions
        danger: 'border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
      },
      size: {
        default: 'h-9 gap-1.5 px-4',
        sm: 'h-8 gap-1 px-3 text-[0.8rem]',
        lg: 'h-10 gap-2 px-5',
        icon: 'size-9 rounded-xl',
        'icon-sm': 'size-7 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  },
);

const Button = ({
  className,
  variant,
  size,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) => (
  <ButtonPrimitive
    data-slot="button"
    className={cn(buttonVariants({ variant, size, className }))}
    {...props}
  />
);

export { Button, buttonVariants };
