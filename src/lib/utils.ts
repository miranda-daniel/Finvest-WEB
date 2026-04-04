import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// cn — utility for merging Tailwind classes safely.
// Combines clsx (conditional classes) with tailwind-merge (deduplication).
// Used by all shadcn/ui components.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
