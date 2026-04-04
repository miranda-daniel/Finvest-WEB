import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-2xl border border-white/10 bg-white/5 px-4 py-1 text-sm text-slate-100 transition-colors outline-none placeholder:text-slate-500 hover:border-white/20 hover:bg-white/8 focus-visible:border-white/30 focus-visible:bg-white/8 focus-visible:ring-2 focus-visible:ring-white/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-rose-400/50 aria-invalid:ring-2 aria-invalid:ring-rose-400/20',
        className
      )}
      {...props}
    />
  )
}

export { Input }
